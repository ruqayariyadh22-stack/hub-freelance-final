import React,{useMemo,useState} from 'react';
import { Clock3, Filter, Send } from 'lucide-react';
import { t } from '../freelance-i18n';
import { projects, img } from '../freelance-data';
import { Card, PageHeader } from '../components/freelance-UI';

export default function Projects({lang,notify}){


const [q,setQ]=useState('');
const [cat,setCat]=useState('All');
const [showFilters,setShowFilters]=useState(false);
const [filterCategory,setFilterCategory]=useState('All');
const [filterBudget,setFilterBudget]=useState('All');
const [selectedProject,setSelectedProject]=useState(null);
const [proposalPrice,setProposalPrice]=useState('');
const [proposalDuration,setProposalDuration]=useState('');
const [proposalMessage,setProposalMessage]=useState('');
const list=useMemo(()=>projects.filter(p=>{
  const matchesCategory =
    (cat==='All'||p.category===cat) &&
    (filterCategory==='All'||p.category===filterCategory);

  const budget = Number(String(p.budget).replace(/[^0-9]/g,''));

  const matchesBudget =
    filterBudget==='All' ||
    (filterBudget==='under100' && budget < 100) ||
    (filterBudget==='100-500' && budget >= 100 && budget <= 500) ||
    (filterBudget==='over500' && budget > 500);

  const matchesSearch =
    `${p.titleAr} ${p.titleEn} ${p.skills.join(' ')}`
      .toLowerCase()
      .includes(q.toLowerCase());

  return matchesCategory && matchesBudget && matchesSearch;
}),[q,cat,filterCategory,filterBudget]);
 
 return <>
  <PageHeader lang={lang} titleAr="تصفح المشاريع" titleEn="Browse Projects" subAr="ابحث عن المشاريع المناسبة وأرسل عروضك للعملاء." subEn="Find suitable projects and submit proposals to clients."/>
  <div className="toolbar"><div className="input-search"><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder={t(lang,'ابحث عن مشروع أو مهارة...','Search projects or skills...')}/></div><div className="filters">{['All','Development','Design','Writing','Marketing'].map(c=><button key={c} onClick={()=>setCat(c)} className={cat===c?'selected':''}>{c==='All'?t(lang,'الكل','All'):c}</button>)}
  <button
  className="filter-btn"
  onClick={() => setShowFilters(true)}
>
  <Filter size={14}/>
  {t(lang,'فلاتر','Filters')}
</button>
  </div></div>
  <div className="project-stack">{list.map(p=><Card key={p.id} className="project-card"><div className="project-top"><div><span className="badge-soft blue">{p.category}</span><h3>{t(lang,p.titleAr,p.titleEn)}</h3><p>{t(lang,p.descriptionAr,p.descriptionEn)}</p></div><div className="project-meta"><strong>{p.budget}</strong><span><Clock3 size={13}/>{p.duration}</span><span>{p.proposals} {t(lang,'عروض','proposals')}</span></div></div><div className="tag-row">{p.skills.map(s=><span className="tag" key={s}>{s}</span>)}</div><div className="project-footer"><div className="client"><img src={img.clientB}/><div><b>{p.client}</b><small>{t(lang,'عميل موثّق · نشر حديثاً','Verified client · recently published')}</small></div></div><div className="project-actions">
    
    <button className="primary" onClick={()=>setSelectedProject(p)}>
  <Send size={14}/>
  {t(lang,'إرسال عرض','Submit Proposal')}
</button>

    </div></div></Card>)}</div>
{showFilters && (
  <div className="proposal-overlay">
    <div className="proposal-modal">

      <button
        className="proposal-close"
        onClick={() => setShowFilters(false)}
      >
        ×
      </button>

      <h2>
        {t(lang, 'الفلاتر المتقدمة', 'Advanced Filters')}
      </h2>

      <p className="proposal-project-title">
        {t(
          lang,
          'اختاري الخيارات المناسبة للمشاريع التي تريدين رؤيتها.',
          'Choose the options for the projects you want to see.'
        )}
      </p>

      <div className="proposal-field">
        <label>
          {t(lang, 'نوع المشروع', 'Project Type')}
        </label>
        <select
  value={filterCategory}
  onChange={e => setFilterCategory(e.target.value)}
>
  <option value="All">{t(lang, 'الكل', 'All')}</option>
  <option value="Development">Development</option>
  <option value="Design">Design</option>
  <option value="Writing">Writing</option>
  <option value="Marketing">Marketing</option>
</select>
      </div>

      <div className="proposal-field">
        <label>
          {t(lang, 'الميزانية', 'Budget')}
        </label>
<select
  value={filterBudget}
  onChange={e => setFilterBudget(e.target.value)}
>
  <option value="All">
    {t(lang, 'كل الميزانيات', 'All Budgets')}
  </option>

  <option value="under100">Under $100</option>
  <option value="100-500">$100 - $500</option>
  <option value="over500">Over $500</option>
</select>
        
      </div>

      <div className="proposal-actions">

  <button
    className="proposal-cancel"
    onClick={() => {
      setFilterCategory('All');
      setFilterBudget('All');
      setShowFilters(false);
    }}
  >
    {t(lang, 'إعادة ضبط', 'Reset')}
  </button>

  <button
    className="primary"
    onClick={() => setShowFilters(false)}
  >
    {t(lang, 'تطبيق الفلاتر', 'Apply Filters')}
  </button>

</div>

    </div>
  </div>
)}



{selectedProject && (
  <div className="proposal-overlay">
    <div className="proposal-modal">

      <button
        className="proposal-close"
        onClick={() => setSelectedProject(null)}
      >
        ×
      </button>

      <h2>
        {t(lang, 'إرسال عرض للمشروع', 'Submit Proposal')}
      </h2>

      <p className="proposal-project-title">
        {t(lang, selectedProject.titleAr, selectedProject.titleEn)}
      </p>

      <div className="proposal-field">
        <label>
          {t(lang, 'السعر المقترح', 'Your Price')}
        </label>
        <input
  type="text"
  value={proposalPrice}
  onChange={e=>setProposalPrice(e.target.value)}
  placeholder={t(lang, 'مثال: $500', 'Example: $500')}
/>
      </div>

      <div className="proposal-field">
        <label>
          {t(lang, 'مدة التنفيذ', 'Delivery Time')}
        </label>
        <input
  type="text"
  value={proposalDuration}
  onChange={e=>setProposalDuration(e.target.value)}
  placeholder={t(lang, 'مثال: 7 أيام', 'Example: 7 days')}
/>
      </div>

      <div className="proposal-field">
        <label>
          {t(lang, 'رسالتك للعميل', 'Message to Client')}
        </label>
        <textarea
  rows="5"
  value={proposalMessage}
  onChange={e=>setProposalMessage(e.target.value)}
  placeholder={t(
    lang,
    'اكتب نبذة عن خبرتك وكيف ستنفذ المشروع...',
    'Write about your experience and how you will complete the project...'
  )}
/>
      </div>

      <div className="proposal-actions">
        <button
          className="proposal-cancel"
          onClick={() => setSelectedProject(null)}
        >
          {t(lang, 'إلغاء', 'Cancel')}
        </button>

        <button
          className="primary"
          onClick={() => {
            notify(
              t(
                lang,
                'تم إرسال العرض بنجاح',
                'Proposal submitted successfully'
              )
            );
            setSelectedProject(null);
          }}
        >
          <Send size={14} />
          {t(lang, 'تأكيد إرسال العرض', 'Submit Proposal')}
        </button>
      </div>

    </div>
  </div>
)}

 </>;
}

