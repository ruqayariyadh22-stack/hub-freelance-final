import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { LanguageProvider } from "./LanguageContext";

export default function AdminLayout() {
  return (
    <LanguageProvider>
      <div className="admin-layout">
        <Sidebar />
        <div className="admin-main-wrapper">
          <Topbar />
          <Outlet />
        </div>
      </div>
    </LanguageProvider>
  );
}
