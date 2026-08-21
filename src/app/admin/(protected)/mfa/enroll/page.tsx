// src/app/admin/(protected)/mfa/enroll/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import {
  multiFactor,
  onAuthStateChanged,
  TotpMultiFactorGenerator,
  TotpSecret,
  User,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';

export default function MfaEnrollPage() {
  const router = useRouter();
  const [secret, setSecret] = useState<TotpSecret | null>(null);
  const [qrUri, setQrUri] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [alreadyEnrolled, setAlreadyEnrolled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        setError('Your sign-in session could not be found. Please sign in again.');
        setTimeout(() => router.push('/admin/login'), 1500);
        return;
      }

      const enrolledFactors = multiFactor(user).enrolledFactors;
      if (enrolledFactors.length > 0) {
        setAlreadyEnrolled(true);
        return;
      }
      setAlreadyEnrolled(false);

      multiFactor(user)
        .getSession()
        .then((session) => TotpMultiFactorGenerator.generateSecret(session))
        .then((generatedSecret) => {
          setSecret(generatedSecret);
          setQrUri(generatedSecret.generateQrCodeUrl(user.email || 'admin', 'Hydel Admin'));
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to start MFA enrollment.'));
    });

    return () => unsubscribe();
  }, [router]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!secret) return;
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Session expired. Please sign in again.');

      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, code.trim());
      await multiFactor(user).enroll(assertion, 'Authenticator app');

      await fetch('/api/admin/mfa/sync', { method: 'POST' });
      setSuccess(true);
      setTimeout(() => router.push('/admin'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That code did not work. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (alreadyEnrolled) {
    return (
      <div className="admin-max-w-lg">
        <h1 className="admin-heading admin-mb-2">Two-Factor Authentication</h1>
        <p className="admin-text-sm admin-text-muted">
          Your account already has an authenticator app enrolled. To re-enroll on a new device, contact a
          Super Admin to reset your MFA status, or remove the existing factor from your Firebase user record.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="admin-max-w-lg">
        <h1 className="admin-heading admin-text-green admin-mb-2">You&apos;re all set!</h1>
        <p className="admin-text-sm admin-text-muted">Redirecting to your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="admin-max-w-lg">
      <h1 className="admin-heading admin-mb-2">Set Up Two-Factor Authentication</h1>
      <p className="admin-text-sm admin-text-muted admin-mb-6">
        Scan this QR code with an authenticator app (Google Authenticator, Authy, 1Password, etc.), then
        enter the 6-digit code it generates to finish enrolling. This is required before you can use the
        rest of the admin panel.
      </p>

      {error && <p className="admin-text-sm admin-text-red admin-mb-4">{error}</p>}

      {qrUri ? (
        <div className="admin-card admin-qr-container">
          <QRCodeSVG value={qrUri} size={200} />
          <p className="admin-qr-manual">
            Can&apos;t scan? Manual key: <code>{secret?.secretKey}</code>
          </p>

          <form onSubmit={handleVerify} className="admin-w-full admin-max-w-xs admin-space-y-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="admin-input admin-input--otp"
            />
            <button
              type="submit"
              disabled={loading || code.trim().length < 6}
              className="admin-btn admin-btn--primary admin-w-full"
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </button>
          </form>
        </div>
      ) : (
        !error && <p className="admin-text-sm admin-text-muted">Preparing your enrollment…</p>
      )}
    </div>
  );
}