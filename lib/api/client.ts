const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * The request never reached (or never heard back from) the server: the device is
 * offline, or it timed out on a slow connection. Distinct from `ApiError` (a real
 * server response) so the UI can treat connectivity blips gently — a toast and a
 * retry — instead of a blocking error modal.
 */
export class NetworkError extends Error {
  constructor(
    public kind: 'offline' | 'timeout',
    message: string,
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  // 'blob' returns the raw Response body (PDF/payslip downloads); default 'json'.
  responseType?: 'json' | 'blob';
  // Override the default abort timeout (uploads / PDF generation can be slow).
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 8000;

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(path, BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

// Prevent multiple concurrent refresh attempts.
// 'refreshed'    — got a new token, retry the original request.
// 'unauthorized' — refresh was rejected (session truly invalid), log out.
// 'network-error'— the refresh request itself never completed; do NOT log the
//                  user out over a connectivity blip.
type RefreshResult = 'refreshed' | 'unauthorized' | 'network-error';
let refreshPromise: Promise<RefreshResult> | null = null;

async function attemptRefresh(): Promise<RefreshResult> {
  if (refreshPromise) return refreshPromise;

  const doRefresh = (): Promise<RefreshResult> =>
    fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res): RefreshResult => (res.ok ? 'refreshed' : 'unauthorized'))
      .catch((): RefreshResult => 'network-error');

  // Cross-TAB single-flight: refresh tokens rotate, so two tabs redeeming
  // the same cookie concurrently trip the server's replay detection. The
  // Web Locks API serialises tabs (the loser re-runs with the winner's
  // fresh cookie); where unsupported, the server's reuse-grace window still
  // absorbs the race.
  refreshPromise = (async (): Promise<RefreshResult> => {
    if (typeof navigator !== 'undefined' && navigator.locks?.request) {
      return await navigator.locks.request('gs26-token-refresh', doRefresh);
    }
    return doRefresh();
  })().finally(() => { refreshPromise = null; });

  return refreshPromise;
}

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { body, params, headers: customHeaders, responseType, timeoutMs, ...rest } = options;

  // FormData must NOT carry a manual Content-Type — the browser sets the
  // multipart boundary itself — and must be sent as-is, not JSON-stringified.
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(customHeaders as Record<string, string>),
  };

  // Abort after a timeout to prevent infinite hang when the backend is down.
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  const config: RequestInit = {
    ...rest,
    headers,
    credentials: 'include',
    signal: controller.signal,
    ...(body !== undefined && {
      body: isFormData ? (body as FormData) : JSON.stringify(body),
    }),
  };

  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), config);
  } catch (err) {
    // fetch only rejects when the request never completed: our timeout aborted
    // it (AbortError), or the network is unreachable (TypeError). Surface these
    // as NetworkError so the UI reconnects gracefully instead of hard-erroring.
    if ((err as Error)?.name === 'AbortError') {
      throw new NetworkError('timeout', 'The request timed out. Please check your connection and try again.');
    }
    throw new NetworkError('offline', 'You appear to be offline. Please check your connection and try again.');
  } finally {
    clearTimeout(timeoutId);
  }

  // If 401 and not already retrying, attempt token refresh. Only the
  // pre-session auth endpoints are excluded — a blanket '/auth/' filter used
  // to also cover /auth/me and /auth/sessions, so the very call that
  // validates the session could never trigger the silent refresh.
  const NO_REFRESH_PATHS = [
    '/auth/login',
    '/auth/refresh',
    '/auth/logout',
    '/auth/verify-otp',
    '/auth/totp/setup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/change-password',
  ];
  const refreshable = !NO_REFRESH_PATHS.some((p) => path.startsWith(p));
  if (response.status === 401 && !isRetry && refreshable) {
    const result = await attemptRefresh();
    if (result === 'refreshed') {
      return request<T>(path, options, true);
    }
    if (result === 'network-error') {
      // The refresh request never completed (bad connection). Keep the session
      // and surface a connectivity blip so the user can retry — don't log them
      // out over a transient network failure.
      throw new NetworkError('offline', 'You appear to be offline. Please check your connection and try again.');
    }
    // 'unauthorized' — the session is genuinely invalid. Clear and go to
    // the LOGIN page (not "/", which is the marketing homepage).
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gs26_user');
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      errorData?.message || `Request failed with status ${response.status}`,
      errorData,
    );
  }

  if (responseType === 'blob') return (await response.blob()) as T;

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(path, { method: 'GET', params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),

  // Multipart upload (FormData). Goes through the same auth/refresh/error path.
  upload: <T>(path: string, formData: FormData, method: 'POST' | 'PATCH' = 'POST') =>
    request<T>(path, { method, body: formData, timeoutMs: 30000 }),

  // Binary download (e.g. PDF/payslip). Returns a Blob.
  getBlob: (path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<Blob>(path, { method: 'GET', params, responseType: 'blob', timeoutMs: 30000 }),
};
