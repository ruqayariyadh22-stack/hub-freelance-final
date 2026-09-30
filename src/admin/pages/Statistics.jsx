import { useLanguage } from "../components/LanguageContext";
import { BarChart3, Users, FolderKanban, WalletCards, ClipboardList, Star, TrendingUp } from "lucide-react";

export default function Statistics() {
  const { isArabic, t } = useLanguage();
  const statistics = [
    ["1,248", "Total Users", "↑ 12.4%", Users],
    ["892", "Total Projects", "↑ 8.7%", FolderKanban],
    ["324", "Subscriptions", "↑ 10.2%", BarChart3],
    ["$12,450", "Total Revenue", "↑ 14.2%", WalletCards],
    ["156", "Total Orders", "↑ 9.4%", ClipboardList],
    ["1,248", "Reviews", "↑ 11.1%", Star],
  ];
  const values=[42,55,48,68,62,78,88,92,84,96,90,98];
  const labels=isArabic?["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <main className="main-content">
      <div className="page-header">
        <div><div className="page-eyebrow"><span />STATISTICS</div><h1>{isArabic ? "الإحصائيات والتحليلات" : "Statistics & Analytics"}</h1><p>{isArabic ? "متابعة أداء المنصة والمستخدمين والمشاريع والعمليات المالية." : "Track platform, users, projects and financial performance."}</p></div>
      </div>
      <section className="stats-grid six">
        {statistics.map(([value,label,change,Icon]) => <article className="stat-card" key={label}><div className="stat-top"><span>{t(label)}</span><div className="stat-icon blue"><Icon size={18}/></div></div><strong>{value}</strong><small><TrendingUp size={12}/>{change}</small></article>)}
      </section>
      <section className="dashboard-grid">
        <article className="dashboard-card chart-card">
          <div className="card-heading"><div><h2>{isArabic ? "نمو المنصة" : "Platform growth"}</h2><p>{isArabic ? "مؤشر النشاط الشهري" : "Monthly activity index"}</p></div><span className="mini-pill">2026</span></div>
          <div className="chart tall">
            {values.map((height,i)=><div className="bar-wrap" key={labels[i]}><div className="bar-value">{height}</div><div className="bar-track"><div className="bar" style={{height:`${height}%`}}/></div><span>{labels[i]}</span></div>)}
          </div>
        </article>
        <article className="dashboard-card">
          <div className="card-heading"><div><h2>{isArabic ? "توزيع المشاريع" : "Project distribution"}</h2><p>{isArabic ? "حسب الحالة الحالية" : "By current status"}</p></div></div>
          <div className="donut"><div className="donut-center"><strong>892</strong><span>{isArabic?"مشروع":"projects"}</span></div></div>
          <div className="legend"><span><i className="green"/> {isArabic?"مكتملة":"Completed"} <b>68%</b></span><span><i className="blue"/> {isArabic?"قيد التنفيذ":"In Progress"} <b>21%</b></span><span><i className="amber"/> {isArabic?"معلقة":"Pending"} <b>11%</b></span></div>
        </article>
      </section>
    </main>
  );
}
