import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import HubLogo from './shared/HubLogo';
import { API_BASE } from './shared/apiConfig.js';

const GENERIC_ERROR = 'Something went wrong. Please try again.';

const postJson = async (path, body) => {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, message: 'Unable to reach the server.' };
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    const details = Array.isArray(payload?.errors)
      ? payload.errors.map((e) => e.message).filter(Boolean).join(' ')
      : '';
    return { ok: false, message: details || payload?.message || GENERIC_ERROR };
  }

  return { ok: true, data: payload.data };
};

export function AuthLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="hub-login">
      <section className="hub-hero">
        <div className="hero-content">
          <div className="hero-logo"><HubLogo size="lg" /></div>
          <h1>Welcome in Freelance Hub</h1>
          <p>One connected workspace for clients and freelancers to build, collaborate, deliver and grow.</p>
          <div className="computer-scene" aria-hidden="true">
            <span className="float-code fc1">&lt;/&gt;</span>
            <span className="float-code fc2">{`{ }`}</span>
            <span className="float-code fc3">&lt;div&gt;</span>
            <span className="float-code fc4">npm</span>
            <span className="float-code fc5">01</span>
            <span className="float-code fc6">#hub</span>
            <div className="computer"><div className="screen-code"><span>const hub = &#123;</span><span>role: "creator",</span><span>connect: true,</span><span>build: "together"</span><span>&#125;;</span></div></div>
            <div className="computer-stand" />
          </div>
        </div>
      </section>
      <section className="login-panel">
        <button className="about-project-btn" onClick={() => navigate('/about')}>
          About Project
        </button>
        <div className="login-card">
          <div className="mobile-brand"><HubLogo showText subtitle="Freelance platform" /></div>
          {children}
        </div>
      </section>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('client');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in your name, email and password.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setSubmitting(true);

    const registered = await postJson('/auth/register', {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role,
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
    });

    if (!registered.ok) {
      setError(registered.message);
      setSubmitting(false);
      return;
    }

    const loggedIn = await postJson('/auth/login', {
      email: form.email.trim(),
      password: form.password,
    });
    setSubmitting(false);

    if (!loggedIn.ok || !loggedIn.data?.token) {
      navigate('/login', { replace: true });
      return;
    }

    const { user, token } = loggedIn.data;
    localStorage.setItem('hub_token', token);
    localStorage.setItem('hub_user', JSON.stringify(user));
    localStorage.setItem('hub_role', user.role);
    navigate(user.role === 'freelancer' ? '/freelancer' : '/client', { replace: true });
  };

  return (
    <AuthLayout>
      <h2>Create account</h2>
      <p className="lead">Join Freelance Hub as a client to hire talent, or as a freelancer to find work.</p>
      <div className="role-switch">
        <button type="button" className={role === 'client' ? 'active' : ''} onClick={() => setRole('client')}>Client</button>
        <button type="button" className={role === 'freelancer' ? 'active' : ''} onClick={() => setRole('freelancer')}>Freelancer</button>
      </div>
      <form onSubmit={submit}>
        <div className="field"><label>Full name</label><input value={form.name} onChange={update('name')} placeholder="Your name" autoComplete="name" /></div>
        <div className="field"><label>Email address</label><input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" autoComplete="email" /></div>
        <div className="field"><label>Phone (optional)</label><input value={form.phone} onChange={update('phone')} placeholder="+964 ..." autoComplete="tel" /></div>
        <div className="field"><label>Password</label><input type="password" value={form.password} onChange={update('password')} placeholder="At least 8 characters" autoComplete="new-password" /></div>
        <div className="field"><label>Confirm password</label><input type="password" value={form.confirm} onChange={update('confirm')} placeholder="Repeat password" autoComplete="new-password" /></div>
        {error && <div className="login-error">{error}</div>}
        <button className="login-submit" type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : `Sign up as ${role === 'client' ? 'Client' : 'Freelancer'}`}
          <ArrowRight size={15} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
        </button>
      </form>
      <p className="auth-links">Already have an account? <Link to="/login">Sign in</Link></p>
    </AuthLayout>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    setError('');
    setSubmitting(true);
    const result = await postJson('/auth/forgot-password', { email: email.trim() });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSent(true);
  };

  return (
    <AuthLayout>
      <h2>Forgot password</h2>
      <p className="lead">Enter the email linked to your account and we will send you a reset link.</p>
      {sent ? (
        <div className="login-success">
          If an account exists for <b>{email.trim()}</b>, a password reset link has been sent. Check your inbox.
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="field"><label>Email address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></div>
          {error && <div className="login-error">{error}</div>}
          <button className="login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="auth-links"><Link to="/login">Back to sign in</Link></p>
    </AuthLayout>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setSubmitting(true);
    const result = await postJson('/auth/reset-password', { token, password });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }
    setDone(true);
  };

  return (
    <AuthLayout>
      <h2>Reset password</h2>
      {!token ? (
        <p className="login-error">This reset link is invalid. Please request a new one.</p>
      ) : done ? (
        <>
          <div className="login-success">Your password has been updated. You can now sign in.</div>
          <button className="login-submit" type="button" onClick={() => navigate('/login', { replace: true })}>
            Go to sign in
          </button>
        </>
      ) : (
        <>
          <p className="lead">Choose a new password for your account.</p>
          <form onSubmit={submit}>
            <div className="field"><label>New password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" /></div>
            <div className="field"><label>Confirm password</label><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" autoComplete="new-password" /></div>
            {error && <div className="login-error">{error}</div>}
            <button className="login-submit" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Update password'}
            </button>
          </form>
        </>
      )}
      <p className="auth-links">
        {!done && <Link to="/forgot-password">Request a new link</Link>}
        {!done && ' · '}
        <Link to="/login">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
