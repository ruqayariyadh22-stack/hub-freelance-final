import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Globe2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import HubLogo from "../../shared/HubLogo";
import { LanguageProvider, useLanguage } from "../components/LanguageContext";

function AdminLoginContent() {
  const navigate = useNavigate();
  const { isArabic, toggleLanguage } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("hub_admin_authenticated") === "true") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const submit = (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(isArabic ? "يرجى إدخال البريد الإلكتروني وكلمة المرور." : "Please enter your email and password.");
      return;
    }

    localStorage.setItem("hub_admin_authenticated", "true");
    localStorage.removeItem("hub_role");
    navigate("/admin/dashboard", { replace: true });
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-glow admin-login-glow-one" />
      <div className="admin-login-glow admin-login-glow-two" />

      <header className="admin-login-header">
        <HubLogo showText subtitle={isArabic ? "بوابة الإدارة" : "Admin Portal"} />
        <button className="language-button" onClick={toggleLanguage} type="button">
          <Globe2 size={16} />
          {isArabic ? "English" : "عربي"}
        </button>
      </header>

      <section className="admin-login-card" aria-label={isArabic ? "تسجيل دخول الأدمن" : "Admin login"}>
        <div className="admin-login-icon"><ShieldCheck size={25} /></div>
        <div className="admin-login-eyebrow">{isArabic ? "مساحة خاصة" : "PRIVATE WORKSPACE"}</div>
        <h1>{isArabic ? "تسجيل دخول الأدمن" : "Admin Login"}</h1>
        <p>{isArabic ? "ادخل إلى لوحة إدارة Freelance Hub من المسار المخصص للأدمن." : "Access the Freelance Hub administration workspace through the dedicated admin portal."}</p>

        <form onSubmit={submit} className="admin-login-form">
          <label>
            <span>{isArabic ? "البريد الإلكتروني" : "Email address"}</span>
            <div className="admin-login-field">
              <Mail size={17} />
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="admin@example.com" autoComplete="username" />
            </div>
          </label>

          <label>
            <span>{isArabic ? "كلمة المرور" : "Password"}</span>
            <div className="admin-login-field">
              <LockKeyhole size={17} />
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" autoComplete="current-password" />
            </div>
          </label>

          {error && <div className="admin-login-error">{error}</div>}

          <button className="admin-login-submit" type="submit">
            {isArabic ? "دخول إلى لوحة التحكم" : "Sign in to Dashboard"}
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="admin-login-note">
          <ShieldCheck size={14} />
          {isArabic ? "تسجيل تجريبي: أي بريد وكلمة مرور غير فارغين يعملان بدون Backend." : "Demo login: any non-empty email and password work without a backend."}
        </div>
      </section>
    </main>
  );
}

export default function AdminLogin() {
  return <LanguageProvider><AdminLoginContent /></LanguageProvider>;
}
