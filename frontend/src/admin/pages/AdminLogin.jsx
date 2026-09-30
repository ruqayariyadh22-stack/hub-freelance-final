import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Globe2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import HubLogo from '../../shared/HubLogo';
import { LanguageProvider, useLanguage } from '../components/LanguageContext';
import { clearAdminSession, isAdminSession } from '../api';

function AdminLoginContent() {
  const navigate = useNavigate();
  const { isArabic, toggleLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAdminSession()) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(
        isArabic
          ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.'
          : 'Please enter your email and password.',
      );
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success || !payload.data?.token || !payload.data?.user) {
        setError(payload?.message || (isArabic ? 'فشل تسجيل الدخول' : 'Login failed'));
        return;
      }

      if (payload.data.user.role !== 'admin') {
        clearAdminSession();
        setError(
          isArabic
            ? 'هذا الحساب ليس حساب إدارة'
            : 'This account is not an administrator',
        );
        return;
      }

      localStorage.setItem('hub_token', payload.data.token);
      localStorage.setItem('hub_user', JSON.stringify(payload.data.user));
      localStorage.setItem('hub_role', 'admin');
      localStorage.removeItem('hub_admin_authenticated');
      navigate('/admin/dashboard', { replace: true });
    } catch {
      setError(isArabic ? 'تعذر الاتصال بالخادم' : 'Unable to reach the server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-glow admin-login-glow-one" />
      <div className="admin-login-glow admin-login-glow-two" />

      <header className="admin-login-header">
        <HubLogo showText subtitle={isArabic ? 'بوابة الإدارة' : 'Admin Portal'} />
        <button className="language-button" onClick={toggleLanguage} type="button">
          <Globe2 size={16} />
          {isArabic ? 'English' : 'العربية'}
        </button>
      </header>

      <section className="admin-login-card">
        <div className="admin-login-badge">
          <ShieldCheck size={18} />
          <span>{isArabic ? 'منطقة محمية' : 'Protected area'}</span>
        </div>
        <h1>{isArabic ? 'تسجيل دخول الإدارة' : 'Admin Sign In'}</h1>
        <p>
          {isArabic
            ? 'ادخل إلى لوحة إدارة Freelance Hub باستخدام حساب الإدارة الحقيقي.'
            : 'Access the Freelance Hub administration workspace with a real admin account.'}
        </p>

        <form onSubmit={submit} className="admin-login-form">
          <label>
            <span>{isArabic ? 'البريد الإلكتروني' : 'Email'}</span>
            <div className="field-shell">
              <Mail size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
              />
            </div>
          </label>

          <label>
            <span>{isArabic ? 'كلمة المرور' : 'Password'}</span>
            <div className="field-shell">
              <LockKeyhole size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </label>

          {error ? <p className="admin-login-error">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting
              ? isArabic
                ? 'جاري الدخول...'
                : 'Signing in...'
              : isArabic
                ? 'دخول الإدارة'
                : 'Enter Admin'}
            <ArrowRight size={16} />
          </button>
        </form>
      </section>
    </main>
  );
}

export default function AdminLogin() {
  return (
    <LanguageProvider>
      <AdminLoginContent />
    </LanguageProvider>
  );
}
