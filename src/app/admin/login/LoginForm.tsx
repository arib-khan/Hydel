// src/app/admin/login/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
  MultiFactorError,
  MultiFactorResolver,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function finishLogin(idToken: string) {
    const res = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Sign in failed.');
    }
    router.push(nextPath);
    router.refresh();
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await credential.user.getIdToken();
      await finishLogin(idToken);
    } catch (err) {
      const fbError = err as MultiFactorError;
      if (fbError?.code === 'auth/multi-factor-auth-required') {
        const auth = getFirebaseAuth();
        setResolver(getMultiFactorResolver(auth, fbError));
        setError(null);
      } else {
        setError(mapAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resolver) return;
    setError(null);
    setLoading(true);
    try {
      const totpHint = resolver.hints.find((h) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID);
      if (!totpHint) throw new Error('No authenticator app is enrolled on this account.');

      const assertion = TotpMultiFactorGenerator.assertionForSignIn(totpHint.uid, otp.trim());
      const userCredential = await resolver.resolveSignIn(assertion);
      const idToken = await userCredential.user.getIdToken();
      await finishLogin(idToken);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  if (resolver) {
    return (
      <form onSubmit={handleOtpSubmit} className="admin-space-y-4">
        <p className="admin-text-sm admin-text-muted">
          Enter the 6-digit code from your authenticator app.
        </p>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
          className="admin-input admin-input--otp"
          autoFocus
        />
        {error && <p className="admin-text-sm admin-text-red">{error}</p>}
        <button
          type="submit"
          disabled={loading || otp.trim().length < 6}
          className="admin-btn admin-btn--primary admin-w-full"
        >
          {loading ? 'Verifying...' : 'Verify & Sign In'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handlePasswordSubmit} className="admin-space-y-4">
      <div>
        <label className="admin-label">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="admin-input"
        />
      </div>
      <div>
        <label className="admin-label">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="admin-input"
        />
      </div>
      {error && <p className="admin-text-sm admin-text-red">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="admin-btn admin-btn--primary admin-w-full"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      <p className="admin-text-xs admin-text-muted admin-text-center admin-pt-2">
        Admin accounts are created by a Super Admin. There is no public sign-up.
      </p>
    </form>
  );
}

function mapAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/invalid-verification-code':
      return 'That code is incorrect or expired.';
    default:
      return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
  }
}