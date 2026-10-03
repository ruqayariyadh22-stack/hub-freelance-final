import { useLocation } from "react-router-dom";
import { Globe2 } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { getAdminUser } from "../api";

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

  let adminName = "Admin";
  try {
    const user = getAdminUser();
    if (user?.name) adminName = user.name;
  } catch {
    adminName = "Admin";
  }

  return (
    <header className="admin-topbar">
      <div className="topbar-page">
        <div className="topbar-page-name">{t(pageName)}</div>
        <div className="topbar-breadcrumb">
          <span>Hub Freelance</span>
          <span>/</span>
          <strong>{t(pageName)}</strong>
        </div>
      </div>

      <div className="topbar-right">
        <button className="language-button" onClick={toggleLanguage} type="button">
          <Globe2 size={16} />
          <span>{isArabic ? "English" : "عربي"}</span>
        </button>
        <div className="admin-info">
          <div className="admin-details">
            <strong>{adminName}</strong>
            <span>{t("Administrator")}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
