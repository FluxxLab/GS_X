'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';
import { ApiError } from '@/lib/api/client';
import { OTP_LENGTH } from '@/lib/constants/landing';

const EMPTY_OTP = (): string[] => Array.from({ length: OTP_LENGTH }, () => '');

/**
 * Owns the public login page's credential + OTP-verification flow: email /
 * password, the authenticator-code step, and the post-auth redirect. Mirrors
 * the original `app/page.tsx` behavior exactly (no validation was present, so
 * none is added — §1.4). Returns props-in / callbacks-out state for the
 * co-located section components.
 */
export function useLoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  // Compulsory first-login authenticator setup (QR handed over by /auth/login)
  const [setupStep, setSetupStep] = useState(false);
  const [setupQr, setSetupQr] = useState<string | null>(null);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [otp, setOtp] = useState<string[]>(EMPTY_OTP);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const redirectAfterAuth = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    router.push(params.get('redirect') || '/dashboard');
  }, [router]);

  const submitLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
        const result = await authService.login({ email, password });
        if (result.requiresTotpSetup) {
          // MFA is compulsory: no session until the authenticator is set up.
          setOtpEmail(result.email || email);
          setSetupQr(result.qr || null);
          setSetupSecret(result.secret || null);
          setSetupStep(true);
        } else if (result.requiresOtp) {
          // Authenticator-app codes only; nothing is emailed and there is no
          // resend, so no cooldown to start.
          setOtpEmail(result.email || email);
          setOtpStep(true);
        } else if (result.passwordExpired) {
          router.push(`/change-password?email=${encodeURIComponent(result.email || email)}`);
        } else {
          redirectAfterAuth();
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [email, password, redirectAfterAuth, router],
  );

  const setOtpDigit = useCallback((index: number, value: string) => {
    const val = value.replace(/\D/g, '');
    setOtp((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    if (val && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  }, []);

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    },
    [otp],
  );

  const fillOtp = useCallback((digits: string) => {
    const clean = digits.replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (clean.length === OTP_LENGTH) {
      setOtp(clean.split(''));
      otpRefs.current[OTP_LENGTH - 1]?.focus();
    }
  }, []);

  const handleOtpPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      fillOtp(e.clipboardData.getData('text'));
    },
    [fillOtp],
  );

  const pasteOtpFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      fillOtp(text);
    } catch {
      // Clipboard permission denied — user can paste manually
    }
  }, [fillOtp]);

  const verifyOtp = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await authService.verifyOtp(otpEmail, otp.join(''));
      if (result.passwordExpired) {
        router.push(`/change-password?email=${encodeURIComponent(result.email || otpEmail)}`);
        return;
      }
      redirectAfterAuth();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Verification failed. Please try again.');
      }
      setOtp(EMPTY_OTP());
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }, [otpEmail, otp, redirectAfterAuth, router]);

  // One-time recovery codes returned by enrollment; shown on a blocking
  // screen before the dashboard so the user can save them.
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  /** Completes compulsory enrollment with a code from the freshly-scanned app. */
  const completeSetup = useCallback(async (code: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await authService.totpSetupComplete(otpEmail, code);
      if (result.passwordExpired) {
        router.push(`/change-password?email=${encodeURIComponent(result.email || otpEmail)}`);
        return;
      }
      if (result.backupCodes?.length) {
        setBackupCodes(result.backupCodes); // session exists; show codes first
        return;
      }
      redirectAfterAuth();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [otpEmail, redirectAfterAuth, router]);

  /** User confirmed they saved the recovery codes; proceed to the app. */
  const acknowledgeBackupCodes = useCallback(() => {
    setBackupCodes(null);
    redirectAfterAuth();
  }, [redirectAfterAuth]);

  const backToLogin = useCallback(() => {
    setOtpStep(false);
    setSetupStep(false);
    setSetupQr(null);
    setSetupSecret(null);
    setOtp(EMPTY_OTP());
    setError('');
  }, []);

  return {
    // credentials
    showPassword,
    toggleShowPassword: () => setShowPassword((v) => !v),
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    submitLogin,
    // otp
    otpStep,
    otpEmail,
    otp,
    otpRefs,
    setOtpDigit,
    handleOtpKeyDown,
    handleOtpPaste,
    pasteOtpFromClipboard,
    verifyOtp,
    backToLogin,
    // compulsory first-login authenticator setup
    setupStep,
    setupQr,
    setupSecret,
    completeSetup,
    backupCodes,
    acknowledgeBackupCodes,
  };
}
