import {
  ClientProfile,
  Project,
  Proposal,
  Contract,
  FreelancerItem,
  WalletTransaction,
  DisputeRecord,
  ReviewRecord,
  NotificationItem
} from '../types';

export const initialClientProfile: ClientProfile = {
  id: 'client-1',
  userId: 'user-c-101',
  name: 'أحمد علي',
  companyName: 'مؤسسة الأفق للحلول الرقمية (Horizon Digital)',
  email: 'ahmed.ali@horizondigital.com',
  phone: '+964 770 123 4567',
  logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
  bio: 'شركة رائدة في تطوير الحلول البرمجية والمتاجر الإلكترونية للشركات الناشئة في الشرق الأوسط.',
  location: 'بغداد، العراق',
  website: 'https://horizondigital.tech',
  joinedDate: '2024-03-15',
  accountStatus: 'active'
};

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    clientId: 'client-1',
    title: 'تطوير متجر إلكتروني متكامل بـ Next.js و Tailwind',
    description: 'نبحث عن مطور خبير لبناء منصة تجارة إلكترونية سريعة مع لوحة تحكم للتجار ودعم بوابات الدفع المحلية والعالمية وتصميم متجاوب مع جميع الشاشات.',
    category: 'Development',
    budgetMin: 800,
    budgetMax: 1500,
    durationDays: 25,
    requiredSkills: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript', 'Stripe'],
    attachments: ['requirements_v1.pdf', 'wireframe_figma.url'],
    status: 'open',
    proposalsCount: 6,
    publishedAt: '2026-09-18',
    deadline: '2026-10-15'
  },
  {
    id: 'proj-2',
    clientId: 'client-1',
    title: 'تصميم واجهة وتجربة مستخدم لتطبيق جوال لإدارة العقارات',
    description: 'تصميم كامل لأكثر من 30 شاشة في فيجما لتطبيق حجز وشراء العقارات مع نظام تصميم متكامل وأيقونات مخصصة.',
    category: 'Design',
    budgetMin: 500,
    budgetMax: 900,
    durationDays: 14,
    requiredSkills: ['Figma', 'UI/UX Design', 'Design System', 'Mobile App Design'],
    attachments: ['branding_guide.pdf'],
    status: 'in_progress',
    proposalsCount: 9,
    chosenFreelancerId: 'free-1',
    publishedAt: '2026-09-10',
    deadline: '2026-09-30'
  },
  {
    id: 'proj-3',
    clientId: 'client-1',
    title: 'تصميم هوية بصرية كاملة وشعار لعلامة تجارية ناشئة',
    description: 'تصميم شعار عصري، باليت ألوان، خطوط عربية ولاتينية، ونماذج المطبوعات الرقمية والورقية.',
    category: 'Design',
    budgetMin: 350,
    budgetMax: 600,
    durationDays: 10,
    requiredSkills: ['Branding', 'Logo Design', 'Adobe Illustrator', 'Visual Identity'],
    attachments: [],
    status: 'completed',
    proposalsCount: 12,
    chosenFreelancerId: 'free-2',
    publishedAt: '2026-08-20',
    deadline: '2026-09-05'
  },
  {
    id: 'proj-4',
    clientId: 'client-1',
    title: 'كتابة محتوى متوافق مع السيو لـ 10 مقالات في الذكاء الاصطناعي',
    description: 'كتابة مقالات تخصصية دقيقة باللغة العربية حول نماذج الذكاء الاصطناعي وتطبيقات الأعمال بأسلوب مشوق ودقة لغوية.',
    category: 'Writing',
    budgetMin: 200,
    budgetMax: 400,
    durationDays: 7,
    requiredSkills: ['SEO Writing', 'Content Strategy', 'Artificial Intelligence', 'Arabic Copywriting'],
    attachments: ['keywords_plan.xlsx'],
    status: 'in_progress',
    proposalsCount: 5,
    chosenFreelancerId: 'free-3',
    publishedAt: '2026-09-14',
    deadline: '2026-09-24'
  },
  {
    id: 'proj-5',
    clientId: 'client-1',
    title: 'تحسين سرعة الموقع ومحركات البحث SEO لمنصة سياحة وسفر',
    description: 'فحص الأداء وتحسين Core Web Vitals وحل مشاكل الفهرسة وبناء خطة باك لينك أولية.',
    category: 'Marketing',
    budgetMin: 300,
    budgetMax: 550,
    durationDays: 12,
    requiredSkills: ['SEO Technical', 'Speed Optimization', 'Google Search Console'],
    attachments: [],
    status: 'draft',
    proposalsCount: 0,
    publishedAt: '2026-09-19',
    deadline: '2026-10-10'
  }
];

export const initialProposals: Proposal[] = [
  {
    id: 'prop-1',
    projectId: 'proj-1',
    projectTitle: 'تطوير متجر إلكتروني متكامل بـ Next.js و Tailwind',
    freelancerId: 'free-4',
    freelancerName: 'عمر كريم (Omar Kareem)',
    freelancerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    freelancerTitle: 'مطور واجهات أمامية أول و Next.js Specialist',
    freelancerRating: 4.9,
    freelancerCompletedCount: 42,
    proposedPrice: 1100,
    proposedDurationDays: 20,
    coverLetter: 'مرحباً أستاذ أحمد، قمت ببناء أكثر من 8 متاجر إلكترونية عالية الأداء باستخدام Next.js 14 و Tailwind. سأقوم بتنفيذ كود نظيف وتجربة دفع سلسة جداً مع لوحة إدارة ممتازة.',
    status: 'pending',
    submittedAt: '2026-09-18 14:30',
    aiMatching: {
      overallScore: 97,
      skillsMatch: 99,
      experienceMatch: 96,
      specialtyMatch: 98,
      portfolioRelevance: 95,
      aiRecommendation: 'تطابق استثنائي (Top Recommended): المستقل أنجز مشاريع مطابقة تماماً لنفس التقنيات المطلوبة مع تقييم 5 نجوم.',
      aiPros: [
        'خبرة 6 سنوات في Next.js وتطبيقات التجارة',
        'معدل تسليم في الوقت المحدد 99%',
        'أعمال سابقة في معرض الأعمال لنفس المجال'
      ]
    }
  },
  {
    id: 'prop-2',
    projectId: 'proj-1',
    projectTitle: 'تطوير متجر إلكتروني متكامل بـ Next.js و Tailwind',
    freelancerId: 'free-5',
    freelancerName: 'سارة خالد (Sara Khalid)',
    freelancerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    freelancerTitle: 'مطور Full Stack (React + Node.js)',
    freelancerRating: 4.8,
    freelancerCompletedCount: 29,
    proposedPrice: 950,
    proposedDurationDays: 22,
    coverLetter: 'أستطيع تنفيذ المتجر بكل تفاصيله المطلوبة، بما في ذلك سلة المشتريات وإدارة المخزون ونظام التقييمات. الكود سيكون موثقاً بالكامل.',
    status: 'pending',
    submittedAt: '2026-09-18 16:15',
    aiMatching: {
      overallScore: 89,
      skillsMatch: 92,
      experienceMatch: 88,
      specialtyMatch: 90,
      portfolioRelevance: 86,
      aiRecommendation: 'تطابق عالي جداً: مناسب لميزانية المشروع ولديه سجل تسليم ممتاز.',
      aiPros: [
        'سعر تنافسي ومدروس',
        'قدرة على التعامل مع الباك إند والفرونت إند معاً'
      ]
    }
  },
  {
    id: 'prop-3',
    projectId: 'proj-1',
    projectTitle: 'تطوير متجر إلكتروني متكامل بـ Next.js و Tailwind',
    freelancerId: 'free-6',
    freelancerName: 'ليث عدنان (Laith Adnan)',
    freelancerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    freelancerTitle: 'مطور ويب واجهات وتطبيقات تفاعلية',
    freelancerRating: 4.6,
    freelancerCompletedCount: 15,
    proposedPrice: 850,
    proposedDurationDays: 25,
    coverLetter: 'جاهز لبدء العمل فوراً والالتزام بمواعيد التسليم والمتابعة اليومية.',
    status: 'pending',
    submittedAt: '2026-09-19 09:20',
    aiMatching: {
      overallScore: 78,
      skillsMatch: 80,
      experienceMatch: 75,
      specialtyMatch: 82,
      portfolioRelevance: 75,
      aiRecommendation: 'تطابق جيد: مناسب للأعمال ذات الميزانية الاقتصادية، خبرة أقل نسبياً في المشاريع الضخمة.',
      aiPros: [
        'أقل سعر مقدم',
        'تواصل سريع وتفرغ فوري'
      ]
    }
  }
];

export const initialContracts: Contract[] = [
  {
    id: 'cont-1',
    orderNumber: 'ORD-102',
    projectId: 'proj-2',
    projectTitle: 'تصميم واجهة وتجربة مستخدم لتطبيق جوال لإدارة العقارات',
    clientId: 'client-1',
    clientName: 'أحمد علي',
    freelancerId: 'free-1',
    freelancerName: 'مريم الصالح (Maryam Al-Saleh)',
    freelancerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    freelancerSpecialty: 'Senior Product Designer (UI/UX)',
    contractValue: 700,
    escrowHeld: 700,
    commission: 70,
    status: 'in_progress',
    paymentStatus: 'escrow_held',
    startDate: '2026-09-11',
    deliveryDate: '2026-09-28',
    deliverableNotes: 'تم إنجاز 70% من النماذج الأولية في فيجما وجاري العمل على الشاشات التفاعلية.',
    deliverableFiles: ['prototype_preview.fig', 'styleguide_assets.zip'],
    tasks: [
      {
        id: 'task-1',
        contractId: 'cont-1',
        title: 'أبحاث المستخدم والمخططات الهيكلية (Wireframes)',
        description: 'إنشاء خريطة تدفق المستخدم والتخطيط المبدئي لجميع الشاشات.',
        status: 'completed',
        dueDate: '2026-09-15',
        assignedTo: 'مريم الصالح'
      },
      {
        id: 'task-2',
        contractId: 'cont-1',
        title: 'تصميم الواجهات عالية الدقة (High-Fidelity)',
        description: 'تصميم الشاشات الرئيسية والقوائم وصفحة تفاصيل العقار في فيجما.',
        status: 'in_progress',
        dueDate: '2026-09-22',
        assignedTo: 'مريم الصالح'
      },
      {
        id: 'task-3',
        contractId: 'cont-1',
        title: 'النماذج التفاعلية ونظام التصميم النهائي (Prototype & DS)',
        description: 'ربط الشاشات بالانتقالات التفاعلية وتسليم ملفات التصميم الكاملة.',
        status: 'todo',
        dueDate: '2026-09-28',
        assignedTo: 'مريم الصالح'
      }
    ],
    scopeChanges: [
      {
        id: 'sc-1',
        contractId: 'cont-1',
        requestedBy: 'مريم الصالح',
        description: 'طلب إضافة 6 شاشات جديدة خاصة بنظام المحادثة المباشرة بين المشتري والوكيل العقاري مع الوضع الليلي (Dark Mode) للشاشات كافة.',
        priceAdjustment: 150,
        durationAdjustment: 3,
        status: 'pending',
        requestedAt: '2026-09-19 11:45',
        responseNote: 'العميل يدرس الطلب مع الميزانية الإضافية'
      }
    ],
    messages: [
      {
        id: 'msg-1',
        senderId: 'client-1',
        senderName: 'أحمد علي',
        senderRole: 'client',
        text: 'أهلاً مريم، سعيدين بالبدء معكِ. تم إيداع قيمة العقد بالكامل في حساب الضمان Escrow.',
        timestamp: '11 سبت, 10:00 ص'
      },
      {
        id: 'msg-2',
        senderId: 'free-1',
        senderName: 'مريم الصالح',
        senderRole: 'freelancer',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        text: 'شكراً جزيلاً أستاذ أحمد! تم الانتهاء من المخططات الهيكلية (Wireframes) ويمكنك الاطلاع عليها في تبويب المهام.',
        timestamp: '15 سبت, 04:30 م',
        attachment: {
          name: 'wireframes_preview.pdf',
          size: '4.2 MB',
          type: 'pdf'
        }
      },
      {
        id: 'msg-3',
        senderId: 'free-1',
        senderName: 'مريم الصالح',
        senderRole: 'freelancer',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        text: 'أرسلت لك طلباً لتعديل النطاق لإضافة الشاشات التفاعلية والوضع الليلي Dark Mode، يرجى مراجعته والموافقة للمتابعة.',
        timestamp: '19 سبت, 11:46 ص'
      }
    ]
  },
  {
    id: 'cont-2',
    orderNumber: 'ORD-104',
    projectId: 'proj-4',
    projectTitle: 'كتابة محتوى متوافق مع السيو لـ 10 مقالات في الذكاء الاصطناعي',
    clientId: 'client-1',
    clientName: 'أحمد علي',
    freelancerId: 'free-3',
    freelancerName: 'فاطمة عباس (Fatima Abbas)',
    freelancerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    freelancerSpecialty: 'كاتبة محتوى ومختصة سيو معتمدة',
    contractValue: 300,
    escrowHeld: 300,
    commission: 30,
    status: 'delivered',
    paymentStatus: 'escrow_held',
    startDate: '2026-09-14',
    deliveryDate: '2026-09-20',
    deliverableNotes: 'تم كتابة كافة المقالات العشرة وتدقيقها لغوياً وتنسيق العناوين والروابط وفق معايير السيو.',
    deliverableFiles: ['10_AI_Articles_Final.docx', 'SEO_Keywords_Report.pdf'],
    tasks: [
      {
        id: 'task-4',
        contractId: 'cont-2',
        title: 'البحث عن الكلمات المفتاحية وخطة العناوين',
        status: 'completed',
        dueDate: '2026-09-15',
        assignedTo: 'فاطمة عباس'
      },
      {
        id: 'task-5',
        contractId: 'cont-2',
        title: 'كتابة أول 5 مقالات ومراجعتها',
        status: 'completed',
        dueDate: '2026-09-17',
        assignedTo: 'فاطمة عباس'
      },
      {
        id: 'task-6',
        contractId: 'cont-2',
        title: 'كتابة الدفعة الثانية وتسليم الملفات النهائية',
        status: 'completed',
        dueDate: '2026-09-20',
        assignedTo: 'فاطمة عباس'
      }
    ],
    scopeChanges: [],
    messages: [
      {
        id: 'msg-4',
        senderId: 'free-3',
        senderName: 'فاطمة عباس',
        senderRole: 'freelancer',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        text: 'أهلاً أستاذ أحمد، لقد قمت برفع التسليم الكامل للمشروع ومرفق التقرير الشامل للسيو. بانتظار مراجعتكم الكريمة لتحرير الدفعة.',
        timestamp: 'اليوم, 02:15 م',
        attachment: {
          name: '10_AI_Articles_Final.docx',
          size: '1.8 MB',
          type: 'doc'
        }
      }
    ]
  }
];

export const initialFreelancers: FreelancerItem[] = [
  {
    id: 'free-1',
    name: 'مريم الصالح',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialty: 'Senior Product & UI/UX Designer',
    category: 'Design',
    bio: 'أكثر من 7 سنوات في تصميم واجهات وتجارب المستخدم للتطبيقات الكبرى وحاصلة على عدة جوائز تصميم عالمية.',
    experienceYears: 7,
    hourlyRate: 45,
    ratingAvg: 4.95,
    completedProjectsCount: 58,
    skills: ['Figma', 'Mobile Design', 'Design Systems', 'Prototyping', 'User Research'],
    badge: 'Top Rated Plus',
    portfolio: [
      { title: 'Fintech Banking App', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80' },
      { title: 'Food Delivery Experience', image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'free-4',
    name: 'عمر كريم',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialty: 'Full-Stack Web Architect (Next.js/React)',
    category: 'Development',
    bio: 'خبير في بناء وتطوير منصات الويب الحديثة وحلول الـ SaaS السحابية مع اهتمام فائق بالأداء وتجربة الاستخدام.',
    experienceYears: 6,
    hourlyRate: 50,
    ratingAvg: 4.9,
    completedProjectsCount: 42,
    skills: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
    badge: 'Verified Pro',
    portfolio: [
      { title: 'SaaS Analytics Dashboard', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80' },
      { title: 'Multi-Vendor Marketplace', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'free-5',
    name: 'سارة خالد',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    specialty: 'Mobile App Developer (Flutter & iOS)',
    category: 'Development',
    bio: 'مطورة تطبيقات هواتف ذكية بخبرة 5 سنوات في إطلاق تطبيقات متجر آبل وجوجل بلاي بأنظمة دفع وخوادم سحابية.',
    experienceYears: 5,
    hourlyRate: 40,
    ratingAvg: 4.85,
    completedProjectsCount: 29,
    skills: ['Flutter', 'Dart', 'Firebase', 'RESTful API', 'State Management'],
    badge: 'Rising Talent',
    portfolio: [
      { title: 'Fitness Tracker App', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'free-3',
    name: 'فاطمة عباس',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    specialty: 'Content Strategist & SEO Lead',
    category: 'Writing',
    bio: 'كتابة محتوى إبداعي وتسويقي متخصص، دراسات حالة، ومقالات تهيئة محركات البحث في مجالات التقنية والأعمال.',
    experienceYears: 4,
    hourlyRate: 30,
    ratingAvg: 4.9,
    completedProjectsCount: 64,
    skills: ['SEO Copywriting', 'Content Strategy', 'Social Media', 'Blogging'],
    badge: 'Top Rated',
    portfolio: [
      { title: 'Tech Magazine Articles', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'free-2',
    name: 'حيدر الجبوري',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    specialty: 'Brand Identity & Visual Designer',
    category: 'Design',
    bio: 'أصنع هويات بصرية لا تُنسى للشركات الصاعدة مع أدلة هوية متكاملة تضمن تميزك في السوق.',
    experienceYears: 8,
    hourlyRate: 55,
    ratingAvg: 5.0,
    completedProjectsCount: 78,
    skills: ['Logo Design', 'Brand Identity', 'Typography', 'Illustrator', 'Packaging'],
    badge: 'Expert Master',
    portfolio: [
      { title: 'Eco Coffee Branding', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80' }
    ]
  }
];

export const initialTransactions: WalletTransaction[] = [
  {
    id: 'tx-1',
    transactionNumber: 'TX-901',
    type: 'deposit',
    amount: 5000,
    platformFee: 0,
    status: 'completed',
    date: '2026-09-08',
    description: 'شحن رصيد المحفظة عبر البطاقة البنكية (Visa **** 4120)'
  },
  {
    id: 'tx-2',
    transactionNumber: 'TX-902',
    contractId: 'cont-1',
    projectTitle: 'تصميم واجهة وتجربة مستخدم لتطبيق جوال لإدارة العقارات',
    counterpartyName: 'مريم الصالح',
    type: 'escrow_lock',
    amount: 700,
    platformFee: 0,
    status: 'completed',
    date: '2026-09-11',
    description: 'حجز قيمة العقد في نظام الضمان المالي (Escrow)'
  },
  {
    id: 'tx-3',
    transactionNumber: 'TX-903',
    contractId: 'cont-2',
    projectTitle: 'كتابة محتوى متوافق مع السيو لـ 10 مقالات في الذكاء الاصطناعي',
    counterpartyName: 'فاطمة عباس',
    type: 'escrow_lock',
    amount: 300,
    platformFee: 0,
    status: 'completed',
    date: '2026-09-14',
    description: 'حجز قيمة العقد في نظام الضمان المالي (Escrow)'
  },
  {
    id: 'tx-4',
    transactionNumber: 'TX-890',
    counterpartyName: 'حيدر الجبوري',
    projectTitle: 'تصميم هوية بصرية كاملة وشعار لعلامة تجارية ناشئة',
    type: 'release',
    amount: 450,
    platformFee: 45,
    status: 'completed',
    date: '2026-09-05',
    description: 'تحرير الدفعة للمستقل بعد الموافقة على استلام المشروع'
  },
  {
    id: 'tx-5',
    transactionNumber: 'TX-880',
    type: 'deposit',
    amount: 3000,
    platformFee: 0,
    status: 'completed',
    date: '2026-08-28',
    description: 'شحن رصيد المحفظة عبر تحويل مصرفي مباشر'
  }
];

export const initialDisputes: DisputeRecord[] = [
  {
    id: 'disp-1',
    disputeNumber: 'DSP-001',
    contractId: 'cont-old-1',
    projectTitle: 'تطوير موقع وردبريس لمكتب استشارات',
    freelancerName: 'علي حسن (Ali Hassan)',
    freelancerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    issueType: 'delay',
    description: 'تأخر المستقل عن موعد التسليم المتفق عليه لأكثر من 12 يوماً مع انقطاع التواصل وعدم تسليم أي كود أولي صالح للتشغيل.',
    evidenceAttachments: ['chat_log_whatsapp.pdf', 'deadline_agreement.png'],
    status: 'resolved',
    filedAt: '2026-08-15',
    resolution: 'تم إلغاء العقد من قبل إدارة المنصة واسترداد كامل المبلغ المحجوز في الضمان (350$) إلى محفظة العميل.'
  }
];

export const initialReviews: ReviewRecord[] = [
  {
    id: 'rev-1',
    contractId: 'cont-3',
    projectTitle: 'تصميم هوية بصرية كاملة وشعار لعلامة تجارية ناشئة',
    freelancerId: 'free-2',
    freelancerName: 'حيدر الجبوري',
    freelancerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    freelancerSpecialty: 'Brand Identity Designer',
    rating: 5,
    feedback: 'تجربة ممتازة جداً مع حيدر. أفكار إبداعية للشعار والتزام دقيق جداً بالتعديلات والمواعيد. تم تسليم الملفات بصيغها المتعددة وبأعلى جودة ممكنة. أنصح بالتعامل معه بشدة!',
    createdAt: '2026-09-06',
    tags: ['دقة بالمواعيد', 'احترافية عالية', 'جودة استثنائية', 'تواصل ممتاز']
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'طلب تعديل نطاق عمل جديد',
    message: 'قدمت المستقلة مريم الصالح طلب تعديل النطاق على مشروع "تصميم واجهة وتجربة مستخدم" (+150$).',
    type: 'scope_change',
    isRead: false,
    createdAt: 'منذ 3 ساعات',
    linkTab: 'workspace'
  },
  {
    id: 'notif-2',
    title: 'تم تسليم المشروع',
    message: 'قامت فاطمة عباس برفع المخرجات النهائية لمشروع "كتابة محتوى السيو"، يرجى المراجعة لتحرير الدفعة.',
    type: 'milestone',
    isRead: false,
    createdAt: 'منذ 5 ساعات',
    linkTab: 'workspace'
  },
  {
    id: 'notif-3',
    title: 'عرض جديد مع تطابق ذكاء اصطناعي 97%',
    message: 'تلقيت عرضاً جديداً ومميزاً من المستقل عمر كريم على مشروع متجر Next.js.',
    type: 'proposal',
    isRead: true,
    createdAt: 'أمس',
    linkTab: 'proposals'
  },
  {
    id: 'notif-4',
    title: 'شحن رصيد ناجح',
    message: 'تم إيداع مبلغ 5,000$ في محفظتك الرقمية بنجاح.',
    type: 'payment',
    isRead: true,
    createdAt: 'منذ 3 أيام',
    linkTab: 'wallet'
  }
];
