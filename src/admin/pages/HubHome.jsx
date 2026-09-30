import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Code2, FolderKanban, ClipboardList,
  CreditCard, Flag, Star, BarChart3, Settings, ArrowLeft,
  Sparkles, Globe2
} from "lucide-react";
import { LanguageProvider, useLanguage } from "../components/LanguageContext";

const cards = [
  { title: "Dashboard", ar: "لوحة التحكم", description: "Monitor platform activity, revenue and daily operations.", arDesc: "متابعة نشاط المنصة والإيرادات والعمليات اليومية.", icon: LayoutDashboard, path: "/dashboard" },
  { title: "Users Management", ar: "إدارة المستخدمين", description: "Manage freelancer and client accounts.", arDesc: "إدارة حسابات العملاء والمستقلين.", icon: Users, path: "/users" },
  { title: "Services Management", ar: "إدارة الخدمات", description: "Review and manage published freelance services.", arDesc: "مراجعة وإدارة الخدمات المنشورة.", icon: Code2, path: "/services" },
  { title: "Projects Management", ar: "إدارة المشاريع", description: "Track projects, owners and delivery status.", arDesc: "متابعة المشاريع وحالات التنفيذ.", icon: FolderKanban, path: "/projects" },
  { title: "Orders & Contracts", ar: "الطلبات والعقود", description: "Monitor contracts, values and order progress.", arDesc: "متابعة العقود وقيم الطلبات وتقدمها.", icon: ClipboardList, path: "/orders" },
  { title: "Payments & Commissions", ar: "المدفوعات والعمولات", description: "Monitor transactions and platform revenue.", arDesc: "متابعة العمليات المالية والعمولات.", icon: CreditCard, path: "/payments" },
  { title: "Reports & Disputes", ar: "البلاغات والنزاعات", description: "Review complaints and resolve reported issues.", arDesc: "مراجعة الشكاوى والنزاعات.", icon: Flag, path: "/reports" },
  { title: "Reviews & Comments", ar: "التقييمات والتعليقات", description: "Moderate ratings and user feedback.", arDesc: "مراجعة التقييمات وتعليقات المستخدمين.", icon: Star, path: "/reviews" },
  { title: "Statistics", ar: "الإحصائيات", description: "Explore platform performance and trends.", arDesc: "استكشاف أداء المنصة واتجاهاتها.", icon: BarChart3, path: "/statistics" },
  { title: "Profile & Settings", ar: "الملف الشخصي والإعدادات", description: "Manage your admin profile and preferences.", arDesc: "إدارة ملف الأدمن والإعدادات.", icon: Settings, path: "/settings" },
];

function HomeContent() {
  const navigate = useNavigate();
  const { isArabic, toggleLanguage } = useLanguage();

  return (
    <main className="hub-home">
      <div className="home-glow home-glow-one" />
      <div className="home-glow home-glow-two" />

      <header className="hub-header">
        <div className="hub-brand">
          <div className="hub-logo"><span /><span /></div>
          <div>
            <div className="hub-title">Hub Freelance</div>
            <div className="hub-subtitle">{isArabic ? "لوحة إدارة المنصة" : "ADMIN CONTROL CENTER"}</div>
          </div>
        </div>

        <button className="language-button home-language" onClick={toggleLanguage}>
          <Globe2 size={17} />
          {isArabic ? "English" : "عربي"}
        </button>
      </header>

      <section className="home-hero">
        <div>
          <h1>{isArabic ? " مرحباً بك!" : "Hello Admin."}</h1>
          <p>{isArabic ? " مرحباً بك في بوابة الإدارة." : "Welcome to the admin portal."}</p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80"
          alt=""
          className="home-hero-image"
          referrerPolicy="no-referrer"
        />
      </section>

      <section className="hub-cards">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button className="hub-card" key={card.path} onClick={() => navigate(card.path)}>
              <div className="hub-icon"><Icon size={28} /></div>
              <div className="hub-card-content">
                <h2>{isArabic ? card.ar : card.title}</h2>
                <p>{isArabic ? card.arDesc : card.description}</p>
              </div>
              <span className="hub-arrow"><ArrowLeft size={17} /></span>
            </button>
          );
        })}
      </section>
    </main>
  );
}

export default function HubHome() {
  return <LanguageProvider><HomeContent /></LanguageProvider>;
}
