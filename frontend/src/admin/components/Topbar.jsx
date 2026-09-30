import { useLocation } from "react-router-dom";
import { Search, Bell, Globe2, ChevronDown } from "lucide-react";
import { useLanguage } from "./LanguageContext";

const names = {
  "/admin/dashboard": "Dashboard",
  "/admin/users": "Users Management",
  "/admin/services": "Services Management",
  "/admin/projects": "Projects Management",
  "/admin/orders": "Orders & Contracts",
  "/admin/subscriptions": "Subscriptions",
  "/admin/payments": "Payments & Commissions",
  "/admin/reports": "Reports & Disputes",
  "/admin/reviews": "Reviews & Comments",
  "/admin/statistics": "Statistics",
  "/admin/settings": "Profile & Settings",
};

export default function Topbar() {
  const location = useLocation();
  const { isArabic, toggleLanguage, t } = useLanguage();

  const pageName = names[location.pathname] || "Dashboard";

  return (
    <header className="admin-topbar">
      <div className="topbar-page">
        <div className="topbar-page-name">
          {t(pageName)}
        </div>

        <div className="topbar-breadcrumb">
          <span>Hub Freelance</span>
          <span>/</span>
          <strong>{t(pageName)}</strong>
        </div>
      </div>

      <div className="topbar-right">

        <label className="top-search">
          <Search size={16} />
          <input
            type="text"
            placeholder={t("Search...")}
          />
        </label>

        <button
          className="language-button"
          onClick={toggleLanguage}
          type="button"
          title="Change language"
        >
          <Globe2 size={16} />
          <span>{isArabic ? "English" : "عربي"}</span>
        </button>

        <button
          className="notification-button"
          type="button"
          title={isArabic ? "الإشعارات" : "Notifications"}
        >
          <Bell size={17} />
          <span className="notification-dot" />
        </button>

        <div className="admin-info">
          <img
            className="admin-avatar-image"
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
            alt="Zahraa"
            referrerPolicy="no-referrer"
          />

          <div className="admin-details">
            <strong>Zahraa Ali</strong>
            <span>{t("Administrator")}</span>
          </div>

          <ChevronDown
            size={14}
            className="admin-chevron"
          />
        </div>

      </div>
    </header>
  );
}