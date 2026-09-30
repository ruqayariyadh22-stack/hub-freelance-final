export const img = {
  avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=180&q=80',
  clientA: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80',
  clientB: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=180&q=80',
  work1: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=80',
  work2: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=900&q=80',
  work3: 'https://images.unsplash.com/photo-1553484771-cc0d9b8c2b33?auto=format&fit=crop&w=900&q=80',
  work4: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80'
};

export const projects = [
  {id:'PRJ-208', titleAr:'تطوير متجر إلكتروني متكامل بـ Next.js وTailwind', titleEn:'Build a complete e-commerce store with Next.js & Tailwind', category:'Development', budget:'$800 - $1,500', duration:'25 يوم', skills:['Next.js','React','Tailwind CSS','Node.js'], client:'Horizon Digital', proposals:6, match:97, descriptionAr:'منصة تجارة إلكترونية سريعة مع لوحة تحكم ودعم بوابات الدفع المحلية والعالمية.', descriptionEn:'A fast e-commerce platform with an admin dashboard and local/global payment gateways.'},
  {id:'PRJ-193', titleAr:'تصميم واجهة وتجربة مستخدم لتطبيق إدارة العقارات', titleEn:'Design UI/UX for a property-management mobile app', category:'Design', budget:'$500 - $900', duration:'14 يوم', skills:['Figma','UX Research','Design System','Prototype'], client:'Apex Properties', proposals:9, match:92, descriptionAr:'تصميم رحلة مستخدم كاملة للوحدات والعقود والتنبيهات ولوحة المتابعة.', descriptionEn:'End-to-end user flows for units, contracts, notifications, and tracking dashboards.'},
  {id:'PRJ-187', titleAr:'كتابة 10 مقالات SEO حول الذكاء الاصطناعي', titleEn:'Write 10 SEO-ready articles about AI', category:'Writing', budget:'$200 - $400', duration:'7 أيام', skills:['SEO','Research','Technical Writing'], client:'Nexa Media', proposals:5, match:86, descriptionAr:'محتوى عربي/إنجليزي منظم وقابل للنشر مع بحث كلمات مفتاحية.', descriptionEn:'Structured Arabic/English content with keyword research and publishing-ready drafts.'},
  {id:'PRJ-174', titleAr:'تحسين الأداء وSEO لمنصة سياحة وسفر', titleEn:'Improve performance and SEO for a travel platform', category:'Marketing', budget:'$300 - $650', duration:'12 يوم', skills:['SEO','Analytics','Core Web Vitals'], client:'Travelio', proposals:8, match:81, descriptionAr:'تدقيق تقني للموقع وخطة عملية لتحسين الأداء وSEO.', descriptionEn:'Technical audit and an actionable performance and SEO improvement plan.'}
];

export const proposals = [
  {id:'OFF-102', projectAr:'تصميم تطبيق إدارة العقارات', projectEn:'Property management app UI/UX', client:'Apex Properties', price:'$720', duration:'12 يوم', status:'pending', date:'2026-09-20'},
  {id:'OFF-097', projectAr:'تطوير متجر إلكتروني بـ Next.js', projectEn:'Next.js E-commerce Development', client:'Horizon Digital', price:'$1,180', duration:'21 يوم', status:'shortlisted', date:'2026-09-18'},
  {id:'OFF-090', projectAr:'لوحة تحكم SaaS للإحصائيات', projectEn:'SaaS Analytics Dashboard', client:'North Star', price:'$640', duration:'10 أيام', status:'rejected', date:'2026-09-14'},
  {id:'OFF-084', projectAr:'تحسين واجهة منصة تعليمية', projectEn:'EdTech UI Improvement', client:'LearnPro', price:'$450', duration:'8 أيام', status:'accepted', date:'2026-09-08'}
];

export const services = [
  {id:'SRV-01', titleAr:'تطوير تطبيقات ويب حديثة بـ React وNext.js', titleEn:'Modern React & Next.js Web Development', category:'Development', price:'$350', days:'7 أيام', status:'active', orders:14, views:328, cover:img.work1},
  {id:'SRV-02', titleAr:'تصميم نظام واجهات UX/UI متكامل', titleEn:'Complete UX/UI Design System', category:'Design', price:'$220', days:'5 أيام', status:'active', orders:21, views:512, cover:img.work2},
  {id:'SRV-03', titleAr:'بناء لوحة تحكم SaaS احترافية', titleEn:'Professional SaaS Admin Dashboard', category:'Development', price:'$280', days:'6 أيام', status:'hidden', orders:8, views:187, cover:img.work3}
];

export const transactions = [
  ['TX-901','تم تحرير دفعة العقد ORD-102','$280','-$14','2026-09-20','completed'],
  ['TX-889','حجز مبلغ المشروع ORD-102','$700','-','2026-09-11','active'],
  ['TX-871','سحب إلى الحساب البنكي','$500','-$5','2026-09-05','completed'],
  ['TX-842','تحويل رصيد من مشروع سابق','$450','-$22','2026-08-28','completed']
];

export const notifications = [
  {titleAr:'لديك رد جديد على أحد عروضك',titleEn:'You have a new proposal response',timeAr:'منذ 12 دقيقة',timeEn:'12 minutes ago',tone:'blue'},
  {titleAr:'تم تحرير دفعة بقيمة $280 إلى رصيدك',titleEn:'A $280 payment was released to your balance',timeAr:'منذ ساعة',timeEn:'1 hour ago',tone:'green'},
  {titleAr:'طلب تعديل نطاق جديد من العميل',titleEn:'New scope change request from a client',timeAr:'منذ 3 ساعات',timeEn:'3 hours ago',tone:'amber'},
  {titleAr:'تمت إضافة تقييم جديد إلى ملفك',titleEn:'A new review was added to your profile',timeAr:'أمس',timeEn:'Yesterday',tone:'purple'}
];
