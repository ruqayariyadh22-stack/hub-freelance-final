import React,{useState} from 'react';
import { Bell, MoreHorizontal, RotateCcw } from 'lucide-react';
import { t } from '../freelance-i18n';
import { notifications } from '../freelance-data';
import { Card, PageHeader } from '../components/freelance-UI';

export default function Notifications({lang}){const [items,setItems]=useState(notifications);return <><PageHeader lang={lang} titleAr="الإشعارات" titleEn="Notifications" subAr="كل التحديثات المهمة حول عروضك وعقودك ومدفوعاتك." subEn="Important updates about proposals, contracts, and payments." action={<button className="ghost" onClick={()=>setItems([])}><RotateCcw size={14}/>{t(lang,'تعليم الكل كمقروء','Mark all read')}</button>}/><Card>{items.length?items.map((n,i)=><div className={`notification ${i===0?'unread':''}`} key={n.titleEn}><div className={`notif-icon ${n.tone}`}><Bell size={15}/></div><div className="grow"><b>{t(lang,n.titleAr,n.titleEn)}</b><small>{t(lang,n.timeAr,n.timeEn)}</small></div><button className="icon-btn"><MoreHorizontal size={15}/></button></div>):<div className="empty"><Bell size={28}/><h3>{t(lang,'لا توجد إشعارات جديدة','No new notifications')}</h3><p>{t(lang,'أنت مطّلع على كل شيء حالياً.','You are all caught up.')}</p></div>}</Card></>}
