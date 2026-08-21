// src/app/admin/login/page.tsx
import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const metadata = {
  title: 'Admin Login | Hydel',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h1 className="admin-login-title">Hydel Admin</h1>
        <p className="admin-login-subtitle">Sign in to manage products and inquiries.</p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}