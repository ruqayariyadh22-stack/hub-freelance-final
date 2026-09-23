import { useLocation } from "react-router-dom";
import { Search, Bell, Globe2, ChevronDown } from "lucide-react";
import { useLanguage } from "./LanguageContext";

const names = {
  "/dashboard": "Dashboard",
  "/users": "Users Management",
  "/services": "Services Management",
  "/projects": "Projects Management",
  "/orders": "Orders & Contracts",
  "/subscriptions": "Subscriptions",
  "/payments": "Payments & Commissions",
  "/reports": "Reports & Disputes",
  "/reviews": "Reviews & Comments",
  "/statistics": "Statistics",
  "/settings": "Profile & Settings",
};

export default function Topbar() {
  const location = useLocation();
  const { isArabic, toggleLanguage, t } = useLanguage();

  return (
    <header className="admin-topbar">
      <div className="topbar-page">
        <div className="topbar-page-name">{t(names[location.pathname] || "Dashboard")}</div>
        <div className="topbar-breadcrumb">
          <span>Hub Freelance</span>
          <span>/</span>
          <strong>{t(names[location.pathname] || "Dashboard")}</strong>
        </div>
      </div>

      <div className="topbar-right">
        <label className="top-search">
          <Search size={16} />
          <input placeholder={t("Search...")} />
        </label>

        <button className="language-button" onClick={toggleLanguage} title="Change language">
          <Globe2 size={16} />
          <span>{isArabic ? "English" : "عربي"}</span>
        </button>

        <button className="notification-button" title={isArabic ? "الإشعارات" : "Notifications"}>
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
          <ChevronDown size={14} className="admin-chevron" />
        </div>
      </div>
    </header>
  );
}
