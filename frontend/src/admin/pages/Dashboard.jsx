import { useLanguage } from "../components/LanguageContext";
import {
  Users, FolderKanban, WalletCards, Flag, TrendingUp, ArrowUpRight,
  CheckCircle2, Clock3, AlertTriangle, ShieldCheck, Code2, Palette,
  PenTool, Megaphone
} from "lucide-react";

const stats = [
  { value: "1,248", label: "Total Users", change: "↑ 12.4%", icon: Users, tone: "blue" },
  { value: "892", label: "Total Projects", change: "↑ 8.7%", icon: FolderKanban, tone: "indigo" },
  { value: "$12,450", label: "Total Revenue", change: "↑ 14.2%", icon: WalletCards, tone: "green" },
  { value: "23", label: "Pending Reports", change: "Needs review", icon: Flag, tone: "amber" },
];

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul"];
const bars = [42,55,48,68,62,78,88];

export default function Dashboard() {
  const { isArabic, t } = useLanguage();

  const categories = [
    [Code2, isArabic ? "التطوير البرمجي" : "Development", "284 projects"],
    [Palette, isArabic ? "التصميم و UI/UX" : "Design & UI/UX", "231 projects"],
    [PenTool, isArabic ? "الكتابة والمحتوى" : "Writing & Content", "176 projects"],
    [Megaphone, isArabic ? "التسويق الرقمي" : "Digital Marketing", "121 projects"],
  ];

  return (
    <main className="main-content dashboard-page">
      <section className="welcome-card">
        <div className="welcome-content">
        
          <h1>{isArabic ? "مرحباً بعودتك، زهراء" : "Welcome back, Zahraa"}</h1>
          <p>{isArabic ? "نظرة سريعة على أداء Hub Freelance، المستخدمين، المشاريع والعمليات المالية." : "A quick view of Hub Freelance performance, users, projects and financial operations."}</p>
          <div className="welcome-actions">
  
          </div>
        </div>
        <div className="welcome-visual">
          <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=700&q=80" alt="" referrerPolicy="no-referrer" />
          <div className="welcome-visual-overlay"><TrendingUp size={18} /><strong>+14.2%</strong><span>{isArabic ? "نمو الإيرادات" : "Revenue growth"}</span></div>
        </div>
      </section>

      <section className="stats-grid">
        {stats.map(({ value, label, change, icon: Icon, tone }) => (
          <article className="stat-card" key={label}>
            <div className="stat-top">
              <span>{t(label)}</span>
              <div className={`stat-icon ${tone}`}><Icon size={18} /></div>
            </div>
            <strong>{value}</strong>
            <small className={tone === "amber" ? "warning" : ""}>
              {tone === "amber" ? <AlertTriangle size={12} /> : <ArrowUpRight size={12} />}
              {t(change)}
            </small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card chart-card">
          <div className="card-heading">
            <div><h2>{t("Platform Growth")}</h2><p>{t("Projects and revenue overview")}</p></div>
            <span className="mini-pill">2026</span>
          </div>
          <div className="chart">
            {bars.map((height, index) => (
              <div className="bar-wrap" key={months[index]}>
                <div className="bar-value">{height}%</div>
                <div className="bar-track"><div className="bar" style={{ height: `${height}%` }} /></div>
                <span>{isArabic ? ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو"][index] : months[index]}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="card-heading">
            <div><h2>{t("Project Status")}</h2><p>{t("Current distribution")}</p></div>
            <ShieldCheck size={19} className="card-icon-blue" />
          </div>
          <div className="progress-list">
            <Progress label={isArabic ? "مكتملة" : "Completed"} value={68} tone="green" />
            <Progress label={isArabic ? "قيد التنفيذ" : "In Progress"} value={21} tone="blue" />
            <Progress label={isArabic ? "معلقة" : "Pending"} value={11} tone="amber" />
          </div>
        </article>
      </section>

      <section className="dashboard-card categories-card">
        <div className="card-heading">
          <div><h2>{t("Top Categories")}</h2><p>{t("Most active service categories")}</p></div>
          <span className="soft-label">{isArabic ? "هذا الشهر" : "This month"}</span>
        </div>
        <div className="category-grid">
          {categories.map(([Icon, name, count]) => (
            <div className="category-item" key={name}>
              <span className="category-icon"><Icon size={18} /></span>
              <div><strong>{name}</strong><small>{count}</small></div>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-card activity-card">
          <div className="card-heading"><div><h2>{isArabic ? "آخر النشاطات" : "Recent activity"}</h2><p>{isArabic ? "أهم الأحداث على المنصة" : "Latest platform events"}</p></div></div>
          {[
            [CheckCircle2, isArabic ? "تم اعتماد خدمة جديدة" : "A new service was approved", "2 min"],
            [Users, isArabic ? "انضمام 12 مستخدماً جديداً" : "12 new users joined", "18 min"],
            [WalletCards, isArabic ? "تم تسجيل دفعة بقيمة $500" : "$500 payment recorded", "42 min"],
            [Flag, isArabic ? "بلاغ جديد يحتاج مراجعة" : "A new report needs review", "1 h"],
          ].map(([Icon, text, time]) => (
            <div className="activity-row" key={text}><span className="activity-icon"><Icon size={15} /></span><span>{text}</span><time>{time}</time></div>
          ))}
        </article>

        <article className="dashboard-card">
          <div className="card-heading"><div><h2>{isArabic ? "مؤشرات سريعة" : "Quick health"}</h2><p>{isArabic ? "حالة العمليات الأساسية" : "Core operational health"}</p></div></div>
          <div className="health-grid">
            <Health label={isArabic ? "الخدمات" : "Services"} value="96%" />
            <Health label={isArabic ? "المدفوعات" : "Payments"} value="98%" />
            <Health label={isArabic ? "الطلبات" : "Orders"} value="94%" />
            <Health label={isArabic ? "المستخدمون" : "Users"} value="99%" />
          </div>
        </article>
      </section>
    </main>
  );
}

function Progress({ label, value, tone }) {
  return <div className="progress-item"><div><span>{label}</span><strong>{value}%</strong></div><div className="progress-track"><span className={tone} style={{ width: `${value}%` }} /></div></div>;
}
function Health({ label, value }) {
  return <div className="health-item"><span>{label}</span><strong>{value}</strong><div><span style={{ width: value }} /></div></div>;
}
