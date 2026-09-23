import React, { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import HubLogo from './shared/HubLogo';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/Dashboard';
import AdminLayout from './admin/components/AdminLayout';
import AdminUsers from './admin/pages/Users';
import AdminServices from './admin/pages/Services';
import AdminProjects from './admin/pages/Projects';
import AdminOrders from './admin/pages/Orders';
import AdminSubscriptions from './admin/pages/Subscriptions';
import AdminPayments from './admin/pages/Payments';
import AdminReports from './admin/pages/Reports';
import AdminReviews from './admin/pages/Reviews';
import AdminStatistics from './admin/pages/Statistics';
import AdminSettings from './admin/pages/Settings';
import ClientApp from './client/App';
import FreelancerApp from './freelancer/freelance-App';

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    localStorage.setItem('hub_role', role);
    navigate(role === 'client' ? '/client' : '/freelancer');
  };

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
        <div className="login-card">
          <div className="mobile-brand"><HubLogo showText subtitle="Freelance platform" /></div>
          <h2>Sign in</h2>
          <p className="lead">Choose your workspace and continue to your Freelance Hub account.</p>
          <div className="role-switch">
            <button className={role === 'client' ? 'active' : ''} onClick={() => { setRole('client'); setError(''); }}>Client</button>
            <button className={role === 'freelancer' ? 'active' : ''} onClick={() => { setRole('freelancer'); setError(''); }}>Freelancer</button>
          </div>
          <form onSubmit={submit}>
            <div className="field"><label>Email address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
            <div className="field"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></div>
            {error && <div className="login-error">{error}</div>}
            <button className="login-submit" type="submit">Continue as {role === 'client' ? 'Client' : 'Freelancer'} {role === 'client' ? <ArrowRight size={15} style={{verticalAlign:'middle',marginLeft:6}}/> : <ArrowRight size={15} style={{verticalAlign:'middle',marginLeft:6}}/>}</button>
          </form>
          <p className="login-hint"><ShieldCheck size={13} style={{verticalAlign:'middle',marginRight:4}}/> Demo login: any valid email and password will open the selected workspace.</p>
        </div>
      </section>
    </div>
  );
}

function WorkspaceGate({ role, children }) {
  const currentRole = localStorage.getItem('hub_role');
  if (currentRole !== role) return <Navigate to="/" replace />;
  return children;
}

function AdminLoginGate() {
  if (localStorage.getItem('hub_admin_authenticated') === 'true') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <AdminLogin />;
}

function AdminProtectedLayout() {
  if (localStorage.getItem('hub_admin_authenticated') !== 'true') {
    return <Navigate to="/admin" replace />;
  }
  return <AdminLayout />;
}

function ClientWorkspace() {
  return <WorkspaceGate role="client"><div className="hub-client-root"><ClientApp /></div></WorkspaceGate>;
}

function FreelancerWorkspace() {
  return <WorkspaceGate role="freelancer"><div className="hub-freelancer-root"><FreelancerApp /></div></WorkspaceGate>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      {/* Client and Freelancer have completely separate workspace entry points. */}
      <Route path="/client/*" element={<ClientWorkspace />} />
      <Route path="/freelancer/*" element={<FreelancerWorkspace />} />

      {/* Admin is isolated under /admin/* and never appears in the public login. */}
      <Route path="/admin" element={<AdminLoginGate />} />
      <Route path="/admin" element={<AdminProtectedLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="statistics" element={<AdminStatistics />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
