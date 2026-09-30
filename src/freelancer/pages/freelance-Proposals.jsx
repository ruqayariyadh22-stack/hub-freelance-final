import React,{useState} from 'react';
import { FileText } from 'lucide-react';
import { t } from '../freelance-i18n';
import { proposals } from '../freelance-data';
import { Card, PageHeader, Status } from '../components/freelance-UI';

export default function Proposals({lang,notify}){const [filter,setFilter]=useState('all');
const [selectedProposal,setSelectedProposal]=useState(null);
const list=filter==='all'?proposals:proposals.filter(p=>p.status===filter);return <><PageHeader lang={lang} titleAr="العروض والمطابقة" titleEn="Proposals & Matching" subAr="تابع عروضك وقارن مدى ملاءمتها مع المشاريع المفتوحة." subEn="Track your proposals and compare their fit with open projects."/><div className="tabs">{[['all','الكل','All'],['pending','قيد المراجعة','Pending'],['shortlisted','القائمة القصيرة','Shortlisted'],['accepted','مقبولة','Accepted'],['rejected','مرفوضة','Rejected']].map(([k,ar,en])=><button key={k} className={filter===k?'active':''} onClick={()=>setFilter(k)}>{t(lang,ar,en)}</button>)}</div><Card><div className="card-head"><div><h3>{t(lang,'سجل العروض','Proposal history')}</h3><p>{t(lang,'كل عرض مع حالة المرحلة الحالية','Every proposal with its current stage')}</p></div><span className="badge-soft blue"><FileText size={12}/> {list.length}</span></div><div className="table-wrap"><table><thead><tr><th>{t(lang,'رقم العرض','Proposal')}</th><th>{t(lang,'المشروع','Project')}</th><th>{t(lang,'العميل','Client')}</th><th>{t(lang,'القيمة','Value')}</th><th>{t(lang,'المدة','Duration')}</th><th>{t(lang,'الحالة','Status')}</th><th>{t(lang,'إجراء','Action')}</th></tr></thead><tbody>{list.map(p=><tr key={p.id}><td><b>{p.id}</b><small>{p.date}</small></td><td><b>{t(lang,p.projectAr,p.projectEn)}</b></td><td>{p.client}</td><td><strong>{p.price}</strong></td><td>{p.duration}</td><td><Status lang={lang} type={p.status}/></td><td>
   <button
  className="icon-btn"
  onClick={() => setSelectedProposal(p)}
>
  ↗
</button> 
    </td></tr>)}</tbody></table></div></Card>
    {selectedProposal && (
  <div className="proposal-overlay">
    <div className="proposal-modal">

      <button
        className="proposal-close"
        onClick={() => setSelectedProposal(null)}
      >
        ×
      </button>

      <h2>
        {t(lang, 'تفاصيل العرض', 'Proposal Details')}
      </h2>

      <p className="proposal-project-title">
        {t(
          lang,
          selectedProposal.projectAr,
          selectedProposal.projectEn
        )}
      </p>

      <div className="proposal-field">
        <label>{t(lang, 'رقم العرض', 'Proposal ID')}</label>
        <input
          value={selectedProposal.id}
          readOnly
        />
      </div>

      <div className="proposal-field">
        <label>{t(lang, 'العميل', 'Client')}</label>
        <input
          value={selectedProposal.client}
          readOnly
        />
      </div>

      <div className="proposal-field">
        <label>{t(lang, 'القيمة', 'Value')}</label>
        <input
          value={selectedProposal.price}
          readOnly
        />
      </div>

      <div className="proposal-field">
        <label>{t(lang, 'مدة التنفيذ', 'Duration')}</label>
        <input
          value={selectedProposal.duration}
          readOnly
        />
      </div>

      <div className="proposal-actions">
        <button
          className="proposal-cancel"
          onClick={() => setSelectedProposal(null)}
        >
          {t(lang, 'إغلاق', 'Close')}
        </button>
      </div>

    </div>
  </div>
)}
    
    
    
    </>}
