import React, { useEffect, useState } from 'react';
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
import { isAdminSession } from './admin/api';
import ClientApp from './client/App';
import FreelancerApp from './freelancer/freelance-App';
import AboutProject from './AboutProject';
function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const GENERIC_LOGIN_ERROR = "Unable to sign in. Please try again.";
  const submit = async (e) => {
    e.preventDefault();
    if (submitting) {
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      const backendMessage =
        payload && typeof payload.message === "string" && payload.message.trim()
          ? payload.message.trim()
          : "";

      if (!response.ok || !payload?.success || !payload?.data?.token || !payload?.data?.user) {
        setError(backendMessage || GENERIC_LOGIN_ERROR);
        return;
      }

      const { user, token } = payload.data;
      const serverRole = user.role;

      if (serverRole !== "client" && serverRole !== "freelancer" && serverRole !== "admin") {
        setError(GENERIC_LOGIN_ERROR);
        return;
      }

      localStorage.setItem("hub_token", token);
      localStorage.setItem("hub_user", JSON.stringify(user));
      localStorage.setItem("hub_role", serverRole);

      if (serverRole === "admin") {
        localStorage.removeItem("hub_admin_authenticated");
        navigate("/admin/dashboard");
      } else if (serverRole === "freelancer") {
        navigate("/freelancer");
      } else {
        navigate("/client");
      }
    } catch {
      setError(GENERIC_LOGIN_ERROR);
    } finally {
      setSubmitting(false);
    }
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

  <button
    className="about-project-btn"
    onClick={() => navigate("/about")}
  >
    About Project
  </button>

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
            <button className="login-submit" type="submit" disabled={submitting}>Continue as {role === 'client' ? 'Client' : 'Freelancer'} {role === 'client' ? <ArrowRight size={15} style={{verticalAlign:'middle',marginLeft:6}}/> : <ArrowRight size={15} style={{verticalAlign:'middle',marginLeft:6}}/>}</button>
          </form>
          <p className="login-hint"><ShieldCheck size={13} style={{verticalAlign:'middle',marginRight:4}}/> Demo login: any valid email and password will open the selected workspace.</p>
        </div>
      </section>
    </div>
  );
}

function WorkspaceGate({ role, children }) {
  const token = localStorage.getItem('hub_token');
  const [authState, setAuthState] = useState(() => (token ? 'checking' : 'unauthenticated'));

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let cancelled = false;

    const verifySession = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('hub_token');
          localStorage.removeItem('hub_user');
          localStorage.removeItem('hub_role');
          if (!cancelled) {
            setAuthState('unauthenticated');
          }
          return;
        }

        let payload = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }

        if (!response.ok || !payload?.success || !payload?.data || typeof payload.data !== 'object') {
          if (!cancelled) {
            setAuthState('error');
          }
          return;
        }

        const user = payload.data;
        localStorage.setItem('hub_user', JSON.stringify(user));

        const serverRole = user.role;
        if (serverRole === 'client' || serverRole === 'freelancer' || serverRole === 'admin') {
          localStorage.setItem('hub_role', serverRole);
        }

        if (!cancelled) {
          setAuthState(serverRole === role ? 'ready' : 'forbidden');
        }
      } catch {
        if (!cancelled) {
          setAuthState('error');
        }
      }
    };

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [role, token]);

  if (!token || authState === 'unauthenticated' || authState === 'forbidden' || authState === 'error') {
    return <Navigate to="/" replace />;
  }

  if (authState !== 'ready') {
    return null;
  }

  return children;
}

function AdminLoginGate() {
  if (isAdminSession()) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <AdminLogin />;
}

function AdminProtectedLayout() {
  if (!isAdminSession()) {
    return <Navigate to="/admin" replace />;
  }
  return <AdminLayout />;
}

function ClientWorkspace() {
  return <WorkspaceGate role="client"><div className="hub-client-root"><ClientApp /></div></WorkspaceGate>;
}

  function Aboutproject() {
    if (showAbout){ return<AboutProject/>} 
  
}
function FreelancerWorkspace() {
  return <WorkspaceGate role="freelancer"><div className="hub-freelancer-root"><FreelancerApp /></div></WorkspaceGate>;
}



export default function App() {
  return (
    <Routes>
      {/* Main Login */}
      <Route path="/" element={<LoginPage />} />

      {/* About Project - available from all pages */}
      <Route path="/about" element={<AboutProject />} />

      {/* Client */}
      <Route path="/client/*" element={<ClientWorkspace />} />

      {/* Freelancer */}
      <Route path="/freelancer/*" element={<FreelancerWorkspace />} />

    {/* Admin */}
<Route path="/admin">
  {/* Admin Login */}
  <Route index element={<AdminLoginGate />} />
  {/* Protected Admin Pages */}
  <Route element={<AdminProtectedLayout />}>
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
</Route>

      

      {/* Unknown pages */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}