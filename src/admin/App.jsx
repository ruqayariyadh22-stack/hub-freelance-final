import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import HubHome from "./pages/HubHome";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import Orders from "./pages/Orders";
import Subscriptions from "./pages/Subscriptions";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Reviews from "./pages/Reviews";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HubHome />} />
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/services" element={<Services />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
