import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, Code2, FolderKanban, ClipboardList,
  CreditCard, Flag, Star, BarChart3, Settings,
  Sparkles, ChevronLeft, ChevronRight,
  Bookmark,
  Handshake
} from "lucide-react";
import { useLanguage } from "./LanguageContext";
import HubLogo from "../../shared/HubLogo";

const links = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Users Management", path: "/admin/users" },
  { icon: Code2, label: "Services Management", path: "/admin/services" },
  { icon: FolderKanban, label: "Projects Management", path: "/admin/projects" },
  { icon: ClipboardList, label: "Orders & Contracts", path: "/admin/orders" },
  { icon: Handshake, label: "Subscriptions", path: "/admin/subscriptions" },
  { icon: CreditCard, label: "Payments & Commissions", path: "/admin/payments" },
  { icon: Flag, label: "Reports & Disputes", path: "/admin/reports" },
  { icon: Star, label: "Reviews & Comments", path: "/admin/reviews" },
  { icon: BarChart3, label: "Statistics", path: "/admin/statistics" },
  { icon: Settings, label: "Profile & Settings", path: "/admin/settings" },
];

export default function Sidebar() {
  const { isArabic, t } = useLanguage();

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <HubLogo showText subtitle={isArabic ? "لوحة الأدمن" : "Admin Panel"} />
      </div>

      <div className="sidebar-section-label">
        {isArabic ? "الإدارة والمساحة" : "Management Workspace"}
      </div>

      <nav className="sidebar-nav">
        {links.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/admin/dashboard"}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            <Icon className="nav-icon" />
            <span>{t(label)}</span>
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}