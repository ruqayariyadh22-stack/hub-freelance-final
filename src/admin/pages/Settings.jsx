import { useState } from "react";
import { UserRound, ShieldCheck, BellRing, Save, CheckCircle2, Globe2 } from "lucide-react";
import { useLanguage } from "../components/LanguageContext";

export default function Settings() {
  const { isArabic, t, toggleLanguage } = useLanguage();
  const [notifications, setNotifications] = useState({ email:true, reports:true, payments:false });
  const [saved, setSaved] = useState(false);
  const save = (e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 1800); };

  const rows = [
    ["email", "Email Notifications", "Receive general platform notifications."],
    ["reports", "New Report Alerts", "Get notified when a complaint is submitted."],
    ["payments", "Payment Notifications", "Receive updates about payments and commissions."],
  ];

  return (
    <main className="main-content">
      <div className="page-header">
        <div><div className="page-eyebrow"><span />SETTINGS</div><h1>{t("Profile & Settings")}</h1><p>{t("Manage your administrator account and system preferences")}</p></div>
      </div>

      <form onSubmit={save} className="settings-grid">
        <section className="settings-card">
          <div className="section-title"><div className="section-icon blue"><UserRound size={18}/></div><div><h2>{t("Admin Profile")}</h2><p>{t("Personal account information")}</p></div></div>
          <label><span>{t("Full Name")}</span><input defaultValue="Zahraa Ali" /></label>
          <label><span>{t("Email")}</span><input type="email" defaultValue="admin@hubfreelance.com" /></label>
          <label><span>{t("Phone")}</span><input defaultValue="+964 770 000 0000" /></label>
        </section>

        <section className="settings-card">
          <div className="section-title"><div className="section-icon indigo"><ShieldCheck size={18}/></div><div><h2>{t("Security")}</h2><p>{t("Update your password")}</p></div></div>
          <label><span>{t("Current Password")}</span><input type="password" placeholder="••••••••" /></label>
          <label><span>{t("New Password")}</span><input type="password" placeholder="••••••••" /></label>
          <label><span>{t("Confirm Password")}</span><input type="password" placeholder="••••••••" /></label>
        </section>

        <section className="settings-card full-settings">
          <div className="section-title"><div className="section-icon green"><BellRing size={18}/></div><div><h2>{t("System Notifications")}</h2><p>{t("Choose which notifications the administrator receives")}</p></div></div>
          {rows.map(([key,title,text]) => <div className="setting-row" key={key}><div><strong>{t(title)}</strong><span>{t(text)}</span></div><button type="button" className={notifications[key]?"toggle on":"toggle"} onClick={()=>setNotifications(v=>({...v,[key]:!v[key]}))}><span/></button></div>)}
          <div className="settings-actions">
            <button type="button" className="secondary-button" onClick={toggleLanguage}><Globe2 size={15}/>{isArabic ? "English" : "عربي"}</button>
            <button className="primary-button" type="submit"><Save size={15}/>{t("Save Changes")}</button>
            {saved && <span className="save-message"><CheckCircle2 size={14}/>{t("Changes saved successfully")}</span>}
          </div>
        </section>
      </form>
    </main>
  );
}
