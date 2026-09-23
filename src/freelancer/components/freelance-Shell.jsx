import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Bell, BriefcaseBusiness, ChevronDown, FileText, Globe2, LayoutDashboard, Menu, MessageCircle, ShieldCheck, Sparkles, Store, UserRound, WalletCards, Zap, Star, Settings, Flag, X, Search, Receipt } from 'lucide-react';
import { t } from '../freelance-i18n';
import { img } from '../freelance-data';
import HubLogo from '../../shared/HubLogo';

const nav = [
  ['dashboard','/freelancer','الرئيسية','Dashboard',LayoutDashboard],
  ['projects','/freelancer/projects','تصفح المشاريع','Browse Projects',BriefcaseBusiness],
  ['proposals','/freelancer/proposals','العروض والمطابقة','Proposals & Matching',Receipt,'3','green'],
  ['workspace','/freelancer/workspace','مساحة العمل والعقود','Workspace & Contracts',BriefcaseBusiness,'تعديل','amber'],
  ['services','/freelancer/services','خدماتي','My Services',Store],
  ['profile','/freelancer/profile','ملفي الشخصي والأعمال','Profile & Portfolio',UserRound],
  ['wallet','/freelancer/wallet','المحفظة والضمان','Wallet & Escrow',WalletCards],
  ['subscriptions','/freelancer/subscriptions','الاشتراكات','Subscriptions',Zap],
  ['reviews','/freelancer/reviews','التقييمات','Reviews & Ratings',Star],
  ['disputes','/freelancer/disputes','البلاغات والنزاعات','Reports & Disputes',Flag],
  ['notifications','/freelancer/notifications','الإشعارات','Notifications',Bell,'4','red'],
  ['settings','/freelancer/settings','الإعدادات','Settings',Settings]
];

export function AppShell({lang,setLang,setAiOpen,mobileOpen,setMobileOpen,children}){
  const location=useLocation();
  React.useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';},[lang]);
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen?'open':''}`}>
      <div className="brand"><HubLogo showText subtitle={t(lang,'بوابة المستقل','Freelancer Portal')} /><button className="mobile-close" onClick={()=>setMobileOpen(false)}><X size={18}/></button></div>
      <button className="side-cta primary"><BriefcaseBusiness size={16}/>{t(lang,'تصفح المشاريع','Browse Projects')}</button>
      <div className="side-section">{t(lang,'مساحة العمل','WORKSPACE')}</div>
      <nav>{nav.map(([key,path,ar,en,Icon,badge,tone])=>{const active=path==='/freelancer'?location.pathname==='/freelancer':location.pathname.startsWith(path);return <NavLink key={key} to={path} className={`side-link ${active?'active':''}`} onClick={()=>setMobileOpen(false)}><Icon size={17}/><span>{t(lang,ar,en)}</span>{badge!==undefined&&<span className={`nav-badge ${tone||''}`}>{badge}</span>}</NavLink>})}</nav>
      <div className="side-profile"><img src={img.avatar}/><div><b>عمر كريم</b><small>{t(lang,'حساب مستقل موثّق','Verified freelancer')}</small></div><span className="online-dot"/></div>
    </aside>
    <div className="app-main">
      <header className="topbar">
        <button className="mobile-menu" onClick={()=>setMobileOpen(true)}><Menu/></button>
        <div className="breadcrumbs">Hub Freelance <span>/</span> <b>{t(lang,'بوابة المستقل','Freelancer Portal')}</b></div>
        <div className="header-actions">
          <div className="search"><Search size={17}/><input placeholder={t(lang,'ابحث في المشاريع، العروض...','Search projects, proposals...')}/></div>
          <button className="ai-pill" onClick={()=>setAiOpen(true)}><Sparkles size={15}/>{t(lang,'مساعد الذكاء الاصطناعي','AI Assistant')}</button>
          <button className="lang-btn" onClick={()=>setLang(lang==='ar'?'en':'ar')}><Globe2 size={15}/>{lang==='ar'?'English':'عربي'}</button>
          <button className="icon-btn notif"><Bell size={17}/><span>3</span></button>
          <div className="user-top"><img src={img.avatar}/><div><b>{lang==='ar'?'عمر كريم':'Omar Kareem'}</b><small>{t(lang,'حساب مستقل موثّق','Verified freelancer')}</small></div><ChevronDown size={15}/></div>
        </div>
      </header>
      <main className="page-shell">{children}</main>
    </div>
  </div>
}

export function AIHub({lang,onClose,messages,input,setInput,onSend}){
  return <div className="ai-overlay"><aside className="ai-drawer"><div className="ai-header"><div className="ai-brand"><div className="ai-logo"><Sparkles size={17}/></div><div><b>Hub AI</b><small>{t(lang,'مساعد ذكي للمستقلين','Smart assistant for freelancers')}</small></div></div><button className="icon-btn" onClick={onClose}><X size={17}/></button></div><div className="ai-body">{messages.map((m,i)=><div className={`ai-msg ${m.role}`} key={i}><div className="ai-avatar">{m.role==='ai'?<Sparkles size={13}/>:<img src={img.avatar}/>}</div><div><p>{m.text}</p><small>{m.role==='ai'?'Hub AI':'You'}</small></div></div>)}<div className="ai-suggestions">{[t(lang,'حلل مشروعاً','Analyze a project'),t(lang,'حلل الميزانية','Analyze the budget'),t(lang,'اكتب لي مسودة عرض','Draft a proposal'),t(lang,'حسّن وصف خدمتي','Improve my service description')].map(s=><button key={s} onClick={()=>setInput(s)}>{s}</button>)}</div></div><div className="ai-footer"><div className="chat-input"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onSend()} placeholder={t(lang,'اسأل Hub AI...','Ask Hub AI...')}/><button className="primary round" onClick={onSend}><MessageCircle size={15}/></button></div><small>{t(lang,'الـAI يقدم اقتراحات استشارية ولا يتخذ القرار نيابةً عنك.','AI provides advisory suggestions and does not make decisions for you.')}</small></div></aside></div>;
}
