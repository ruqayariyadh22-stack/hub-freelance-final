import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  Flag,
  Globe2,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Receipt,
  Search,
  Settings,
  Sparkles,
  Star,
  Store,
  UserRound,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';
import { t } from '../freelance-i18n';
import { img } from '../freelance-data';
import {
  clearFreelancerSession,
  freelancerGet,
  getStoredUser,
} from '../api';
import HubLogo from '../../shared/HubLogo';

const nav = [
  ['dashboard', '/freelancer', 'الرئيسية', 'Dashboard', LayoutDashboard],
  ['projects', '/freelancer/projects', 'تصفح المشاريع', 'Browse Projects', BriefcaseBusiness],
  ['proposals', '/freelancer/proposals', 'العروض', 'Proposals', Receipt],
  ['workspace', '/freelancer/workspace', 'مساحة العمل والعقود', 'Workspace & Contracts', BriefcaseBusiness],
  ['services', '/freelancer/services', 'خدماتي', 'My Services', Store],
  ['profile', '/freelancer/profile', 'ملفي الشخصي والأعمال', 'Profile & Portfolio', UserRound],
  ['wallet', '/freelancer/wallet', 'المحفظة والضمان', 'Wallet & Escrow', WalletCards],
  ['subscriptions', '/freelancer/subscriptions', 'الاشتراكات', 'Subscriptions', Zap],
  ['reviews', '/freelancer/reviews', 'التقييمات', 'Reviews & Ratings', Star],
  ['disputes', '/freelancer/disputes', 'البلاغات والنزاعات', 'Reports & Disputes', Flag],
  ['notifications', '/freelancer/notifications', 'الإشعارات', 'Notifications', Bell],
  ['settings', '/freelancer/settings', 'الإعدادات', 'Settings', Settings],
];

export function AppShell({
  lang,
  setLang,
  setAiOpen,
  mobileOpen,
  setMobileOpen,
  children,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
  const displayName = user?.name || t(lang, 'مستقل', 'Freelancer');
  const avatar = user?.profile_image || img.placeholder;
  const [unread, setUnread] = React.useState(0);

  React.useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await freelancerGet('/notifications');
        if (!cancelled && Array.isArray(data)) {
          setUnread(data.filter((n) => !n.is_read).length);
        }
      } catch {
        if (!cancelled) setUnread(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const logout = () => {
    clearFreelancerSession();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <HubLogo showText subtitle={t(lang, 'بوابة المستقل', 'Freelancer Portal')} />
          <button className="mobile-close" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <button
          className="side-cta primary"
          onClick={() => {
            navigate('/freelancer/projects');
            setMobileOpen(false);
          }}
        >
          <BriefcaseBusiness size={16} />
          {t(lang, 'تصفح المشاريع', 'Browse Projects')}
        </button>

        <div className="side-section">{t(lang, 'مساحة العمل', 'WORKSPACE')}</div>
        <nav>
          {nav.map(([key, path, ar, en, Icon]) => {
            const active =
              path === '/freelancer'
                ? location.pathname === '/freelancer'
                : location.pathname.startsWith(path);
            return (
              <NavLink
                key={key}
                to={path}
                className={`side-link ${active ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={17} />
                <span>{t(lang, ar, en)}</span>
                {key === 'notifications' && unread > 0 && (
                  <span className="nav-badge red">{unread}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="side-profile">
          <img src={avatar} alt="" />
          <div>
            <b>{displayName}</b>
            <small>{t(lang, 'حساب مستقل', 'Freelancer account')}</small>
          </div>
          <span className="online-dot" />
        </div>

        <button className="logout-btn" onClick={logout}>
          <LogOut size={17} />
          {t(lang, 'تسجيل الخروج', 'Logout')}
        </button>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)}>
            <Menu />
          </button>
          <div className="breadcrumbs">
            Hub Freelance <span>/</span>{' '}
            <b>{t(lang, 'بوابة المستقل', 'Freelancer Portal')}</b>
          </div>
          <div className="header-actions">
            <div className="search">
              <Search size={17} />
              <input
                placeholder={t(
                  lang,
                  'ابحث في المشاريع، العروض...',
                  'Search projects, proposals...',
                )}
              />
            </div>
            <button className="ai-pill" onClick={() => setAiOpen(true)}>
              {t(lang, 'مساعد الذكاء الاصطناعي', 'AI Assistant')}
            </button>
            <button
              className="lang-btn"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            >
              <Globe2 size={15} />
              {lang === 'ar' ? 'English' : 'عربي'}
            </button>
            <button
              className="icon-btn notif"
              onClick={() => navigate('/freelancer/notifications')}
            >
              <Bell size={17} />
              {unread > 0 && <span>{unread}</span>}
            </button>
            <div className="user-top">
              <img src={avatar} alt="" />
              <div>
                <b>{displayName}</b>
                <small>{t(lang, 'حساب مستقل', 'Freelancer account')}</small>
              </div>
              <ChevronDown size={15} />
            </div>
          </div>
        </header>
        <main className="page-shell">{children}</main>
      </div>
    </div>
  );
}

export function AIHub({
  lang,
  onClose,
  messages,
  input,
  setInput,
  onSend,
  sending,
  aiError,
}) {
  return (
    <div className="ai-overlay">
      <aside className="ai-drawer">
        <div className="ai-header">
          <div className="ai-brand">
            <div className="ai-logo">
              <Sparkles size={17} />
            </div>
            <div>
              <b>Hub AI</b>
              <small>
                {t(lang, 'تحليل المشروع والميزانية', 'Project & budget analysis')}
              </small>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <div className="ai-body">
          {messages.map((m, i) => (
            <div className={`ai-msg ${m.role}`} key={i}>
              <div className="ai-avatar">
                {m.role === 'ai' ? (
                  <Sparkles size={13} />
                ) : (
                  <img src={getStoredUser()?.profile_image || img.placeholder} alt="" />
                )}
              </div>
              <div>
                <p>{m.text}</p>
                <small>{m.role === 'ai' ? 'Hub AI' : 'You'}</small>
              </div>
            </div>
          ))}
          {aiError && <p className="notice amber">{aiError}</p>}
          <div className="ai-suggestions">
            {[
              t(lang, 'حلل مشروعاً', 'Analyze a project'),
              t(lang, 'حلل الميزانية', 'Analyze the budget'),
            ].map((s) => (
              <button key={s} type="button" onClick={() => setInput(s)} disabled={sending}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="ai-footer">
          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !sending && onSend()}
              placeholder={t(lang, 'اسأل Hub AI...', 'Ask Hub AI...')}
              disabled={sending}
            />
            <button className="primary round" onClick={onSend} disabled={sending}>
              <MessageCircle size={15} />
            </button>
          </div>
          <small>
            {t(
              lang,
              'الـAI يقدم اقتراحات استشارية ولا يتخذ القرار نيابةً عنك. حد يومي: 5.',
              'AI is advisory only and does not decide for you. Daily limit: 5.',
            )}
          </small>
        </div>
      </aside>
    </div>
  );
}
