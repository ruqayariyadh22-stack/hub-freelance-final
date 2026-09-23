import React,{useMemo,useState} from 'react';
import { Clock3, Filter, Send } from 'lucide-react';
import { t } from '../freelance-i18n';
import { projects, img } from '../freelance-data';
import { Card, PageHeader } from '../components/freelance-UI';

export default function Projects({lang,notify}){
 const [q,setQ]=useState(''); const [cat,setCat]=useState('All');
 const list=useMemo(()=>projects.filter(p=>(cat==='All'||p.category===cat)&&(`${p.titleAr} ${p.titleEn} ${p.skills.join(' ')}`).toLowerCase().includes(q.toLowerCase())),[q,cat]);
 return <>
  <PageHeader lang={lang} titleAr="تصفح المشاريع" titleEn="Browse Projects" subAr="ابحث عن المشاريع المناسبة وأرسل عروضك للعملاء." subEn="Find suitable projects and submit proposals to clients."/>
  <div className="toolbar"><div className="input-search"><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder={t(lang,'ابحث عن مشروع أو مهارة...','Search projects or skills...')}/></div><div className="filters">{['All','Development','Design','Writing','Marketing'].map(c=><button key={c} onClick={()=>setCat(c)} className={cat===c?'selected':''}>{c==='All'?t(lang,'الكل','All'):c}</button>)}<button className="filter-btn"><Filter size={14}/>{t(lang,'فلاتر','Filters')}</button></div></div>
  <div className="project-stack">{list.map(p=><Card key={p.id} className="project-card"><div className="project-top"><div><span className="badge-soft blue">{p.category}</span><h3>{t(lang,p.titleAr,p.titleEn)}</h3><p>{t(lang,p.descriptionAr,p.descriptionEn)}</p></div><div className="project-meta"><strong>{p.budget}</strong><span><Clock3 size={13}/>{p.duration}</span><span>{p.proposals} {t(lang,'عروض','proposals')}</span></div></div><div className="tag-row">{p.skills.map(s=><span className="tag" key={s}>{s}</span>)}</div><div className="project-footer"><div className="client"><img src={img.clientB}/><div><b>{p.client}</b><small>{t(lang,'عميل موثّق · نشر حديثاً','Verified client · recently published')}</small></div></div><div className="project-actions"><button className="primary" onClick={()=>notify(t(lang,`تم فتح عرض ${p.id}`,'Proposal form opened'))}><Send size={14}/>{t(lang,'إرسال عرض','Submit Proposal')}</button></div></div></Card>)}</div>
 </>;
}
