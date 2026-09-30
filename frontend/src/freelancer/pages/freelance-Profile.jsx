import React,{useState} from 'react';
import { Check, Plus, X } from 'lucide-react';
import { t } from '../freelance-i18n';
import { img } from '../freelance-data';
import { Card, PageHeader } from '../components/freelance-UI';

export default function Profile({lang,notify}){const [skills,setSkills]=useState(['Next.js','React','TypeScript','Node.js','Tailwind CSS','PostgreSQL']);

const [portfolio,setPortfolio]=useState([
  {title:'SaaS Analytics Dashboard', tech:'React · UX · Design System', image:img.work1},
  {title:'Fintech Banking App', tech:'React · UX · Design System', image:img.work2},
  {title:'Multi-Vendor Marketplace', tech:'React · UX · Design System', image:img.work3},
  {title:'Food Delivery Experience', tech:'React · UX · Design System', image:img.work4}
]);
const [showAddWork,setShowAddWork]=useState(false);
const [workTitle,setWorkTitle]=useState('');
const [workTech,setWorkTech]=useState('');


const [newSkill,setNewSkill]=useState('');return <><PageHeader lang={lang} titleAr="الملف الشخصي والأعمال" titleEn="Profile & Portfolio" subAr="حدّث تخصصك ومهاراتك وأعمالك السابقة لزيادة فرص المطابقة." subEn="Keep your specialty, skills, and portfolio fresh to improve matching." action={<button className="primary" onClick={()=>notify(t(lang,'تم حفظ التغييرات','Changes saved'))}><Check size={15}/>{t(lang,'حفظ التغييرات','Save changes')}</button>}/><Card className="profile-card"><div className="profile-hero"><img src={img.avatar}/><div><span className="badge-soft green">{t(lang,'حساب موثّق','Verified profile')}</span><h2>عمر كريم</h2><p>Full-Stack Web Architect · Next.js / React</p><div className="mini-stats"><span>6 {t(lang,'سنوات خبرة','years')}</span><span>42 {t(lang,'مشروعاً','projects')}</span><span>4.9 ★</span></div></div></div><div className="form-grid"><label>{t(lang,'التخصص الرئيسي','Primary specialty')}<select><option>Full-Stack Development</option><option>Frontend Development</option><option>Backend Development</option></select></label><label>{t(lang,'سنوات الخبرة','Experience years')}<input defaultValue="6"/></label><label className="full">{t(lang,'نبذة عنك','Bio')}<textarea defaultValue={t(lang,'مطور Full-Stack متخصص في بناء منتجات SaaS وتجارب ويب حديثة، مع تركيز على الأداء وأنظمة التصميم.','Full-stack developer focused on SaaS products, modern web experiences, performance, and design systems.')}/></label></div></Card><div className="grid-2"><Card><div className="card-head"><div><h3>{t(lang,'المهارات','Skills')}</h3><p>{t(lang,'تستخدم في المطابقة الذكية','Used by smart matching')}</p></div></div><div className="tag-row large-tags">{skills.map(s=><span className="tag" key={s}>{s}<button onClick={()=>setSkills(skills.filter(x=>x!==s))}><X size={11}/></button></span>)}<div className="skill-add"><input value={newSkill} onChange={e=>setNewSkill(e.target.value)} placeholder={t(lang,'إضافة مهارة','Add skill')}/><button className="icon-btn" onClick={()=>{if(newSkill.trim()){setSkills([...skills,newSkill.trim()]);setNewSkill('');}}}><Plus size={14}/></button></div></div><div className="notice amber"><b>{t(lang,'طلب تخصص جديد','Request new specialty')}</b><p>{t(lang,'التخصصات الجديدة تمر بمراجعة الأدمن قبل ظهورها للعامة.','New specialties go through admin approval before becoming public.')}</p></div></Card><Card><div className="card-head"><div><h3>{t(lang,'المحفظة','Portfolio')}</h3><p>{t(lang,'أعمالك السابقة ونتائجها','Previous work and outcomes')}</p></div>

  <button className="ghost" onClick={()=>setShowAddWork(true)}>
  <Plus size={14}/>
  {t(lang,'إضافة عمل','Add item')}
</button>

</div>
<div className="portfolio-grid">
  
  {[img.work1,img.work2,img.work3,img.work4].map((src,i)=>
  <div className="portfolio-item" key={src}><img src={src}/><div><b>{['SaaS Analytics Dashboard','Fintech Banking App','Multi-Vendor Marketplace','Food Delivery Experience'][i]}</b>
  <small>React · UX · Design System</small></div></div>)}
  
  {portfolio.map((work,i)=>(
  <div className="portfolio-item" key={`${work.title}-${i}`}>
    <img src={work.image}/>
    <div>
      <b>{work.title}</b>
      <small>{work.tech}</small>
    </div>
  </div>
))}
  
  
  </div></Card></div>


{showAddWork && (
  <div className="modal-overlay">
    <div className="modal">
      <div className="modal-header">
        <div>
          <h3>{t(lang,'إضافة عمل جديد','Add Portfolio Item')}</h3>
          <p>{t(lang,'أضف عملاً جديداً إلى محفظتك','Add a new project to your portfolio')}</p>
        </div>

        <button className="icon-btn" onClick={()=>setShowAddWork(false)}>
          <X size={17}/>
        </button>
      </div>

      <div className="form-grid">
        <label className="full">
          {t(lang,'اسم العمل','Project title')}
          <input
            value={workTitle}
            onChange={e=>setWorkTitle(e.target.value)}
            placeholder={t(lang,'مثلاً: موقع شركة','e.g. Company website')}
          />
        </label>

        <label className="full">
          {t(lang,'التقنيات المستخدمة','Technologies')}
          <input
            value={workTech}
            onChange={e=>setWorkTech(e.target.value)}
            placeholder="React · Node.js · UI/UX"
          />
        </label>
      </div>

      <div className="modal-actions">
        <button className="ghost" onClick={()=>setShowAddWork(false)}>
          {t(lang,'إلغاء','Cancel')}
        </button>

        <button
          className="primary"
          onClick={()=>{
            if(!workTitle.trim()) return;

            setPortfolio([
              ...portfolio,
              {
                title:workTitle.trim(),
                tech:workTech.trim() || 'Web Development',
                image:img.work1
              }
            ]);

            setWorkTitle('');
            setWorkTech('');
            setShowAddWork(false);
          }}
        >
          <Check size={15}/>
          {t(lang,'إضافة العمل','Add project')}
        </button>
      </div>
    </div>
  </div>
)}

</>}
