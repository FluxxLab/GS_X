import { apiClient } from '../api/client';
import type { LoginPayload } from '../types/auth';
import type { User } from '../types/user';

const USER_KEY = 'maizube_user';

interface LoginResult {
  /** True when the account has an authenticator enrolled: an app code is required. */
  requiresOtp: boolean;
  /** MFA is compulsory: true on first login until an authenticator is set up.
   *  The QR (and manual key) for enrollment ride along on the login response. */
  requiresTotpSetup?: boolean;
  qr?: string;
  secret?: string;
  passwordExpired?: boolean;
  email?: string;
  user?: User;
}

interface OtpResult {
  user?: User;
  passwordExpired?: boolean;
  email?: string;
  /** One-time recovery codes — present only on the enrollment response. */
  backupCodes?: string[];
}

export interface SessionInfo {
  jti: string;
  createdAt: string;
  expiresAt: string;
  userAgent: string | null;
  ip: string | null;
  current: boolean;
}

export const authService = {
  async login(data: LoginPayload): Promise<LoginResult> {
    const response = await apiClient.post<LoginResult>('/auth/login', data);

    if (!response.requiresOtp && response.user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      }
    }

    return response;
  },

  async verifyOtp(email: string, otp: string): Promise<OtpResult> {
    const response = await apiClient.post<OtpResult>('/auth/verify-otp', { email, otp });
    if (typeof window !== 'undefined' && response.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
    return response;
  },

  // Self-service / forced (expired) password change. On success the backend has
  // revoked all sessions, so the caller routes back to login to sign in fresh.
  async changePassword(
    email: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>('/auth/change-password', {
      email,
      currentPassword,
      newPassword,
    });
  },

  // ── Authenticator-app (TOTP) management ─────────────────────────────────

  /** Start enrollment: returns a QR data-URI to scan plus the raw secret. */
  totpEnrollStart(): Promise<{ qr: string; secret: string }> {
    return apiClient.post<{ qr: string; secret: string }>('/auth/mfa/totp/enroll', {});
  },

  /** Activate: prove the app generates valid codes. Returns fresh backup codes. */
  totpEnrollVerify(code: string): Promise<{ enabled: boolean; backupCodes: string[] }> {
    return apiClient.post<{ enabled: boolean; backupCodes: string[] }>('/auth/mfa/totp/verify', { code });
  },

  // ── Sessions ────────────────────────────────────────────────────────────

  /** My active sessions (devices), newest first; one is flagged `current`. */
  listSessions(): Promise<SessionInfo[]> {
    return apiClient.get<SessionInfo[]>('/auth/sessions');
  },

  /** Sign a single device out. */
  revokeSession(jti: string): Promise<{ revoked: boolean }> {
    return apiClient.post<{ revoked: boolean }>(`/auth/sessions/${jti}/revoke`, {});
  },

  /** Admin: clear a user's authenticator; their next login re-enrolls. */
  adminResetMfa(userId: string): Promise<{ reset: boolean }> {
    return apiClient.post<{ reset: boolean }>(`/auth/mfa/reset/${userId}`, {});
  },

  /** Compulsory first-login setup: verify the scanned secret and sign in. */
  async totpSetupComplete(email: string, code: string): Promise<OtpResult> {
    const response = await apiClient.post<OtpResult>('/auth/totp/setup', { email, code });
    if (typeof window !== 'undefined' && response.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
    return response;
  },

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>('/auth/reset-password', { token, newPassword });
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Clear local state even if API call fails
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY);
    }
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;
    try { return JSON.parse(data); } catch { return null; }
  },

  /** The current user's full profile from the server (includes department + jobTitle). */
  getMe(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  async validateSession(): Promise<User | null> {
    try {
      const user = await apiClient.get<User>('/auth/me');
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
      return user;
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_KEY);
      }
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getUser();
  },
};
