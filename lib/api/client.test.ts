import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiClient, ApiError } from './client';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('apiClient', () => {
  it('GET builds query params and drops empty/undefined values', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await apiClient.get('/things', { page: 2, q: 'x', skip: undefined, blank: '' });

    expect(res).toEqual({ ok: true });
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('/things');
    expect(url).toContain('page=2');
    expect(url).toContain('q=x');
    expect(url).not.toContain('skip');
    expect(url).not.toContain('blank');
  });

  it('POST sends a JSON content-type and stringifies the body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    const out = await apiClient.post('/x', { a: 1 });

    expect(out).toBeUndefined(); // 204 → undefined
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
    expect(init.credentials).toBe('include');
  });

  it('throws an ApiError carrying the server message on a non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ message: 'Nope' }, 400)));

    const err = (await apiClient.get('/x').catch((e) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.message).toBe('Nope');
  });

  it('upload sends FormData WITHOUT a manual content-type (browser sets the boundary)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 1 }, 201));
    vi.stubGlobal('fetch', fetchMock);

    const fd = new FormData();
    fd.append('file', new Blob(['hi']), 'a.txt');
    await apiClient.upload('/upload', fd);

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.headers as Record<string, string>)['Content-Type']).toBeUndefined();
    expect(init.method).toBe('POST');
  });

  it('getBlob returns the raw response body as a Blob', async () => {
    const pdf = new Blob(['PDF']);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, blob: async () => pdf }),
    );

    const blob = await apiClient.getBlob('/file.pdf');
    expect(blob).toBe(pdf);
  });

  it('on a 401 it refreshes once and retries the original request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 })) // protected call
      .mockResolvedValueOnce(new Response(null, { status: 200 })) // /auth/refresh
      .mockResolvedValueOnce(jsonResponse({ ok: 1 })); // retried call
    vi.stubGlobal('fetch', fetchMock);

    const res = await apiClient.get('/secure');

    expect(res).toEqual({ ok: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[1][0])).toContain('/auth/refresh');
  });
});
