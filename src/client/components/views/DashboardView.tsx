import React from 'react';
import {
  DollarSign,
  Briefcase,
  Users,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FolderPlus,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Project, Contract, Proposal, ClientProfile } from '../../types';
import { ActiveTab } from '../Sidebar';

interface DashboardViewProps {
  clientProfile: ClientProfile;
  projects: Project[];
  contracts: Contract[];
  proposals: Proposal[];
  setActiveTab: (tab: ActiveTab) => void;
  openNewProjectModal: () => void;
  onSelectProjectProposals: (projectId: string) => void;
  onSelectContract: (contractId: string) => void;
  isArabic: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clientProfile,
  projects,
  contracts,
  proposals,
  setActiveTab,
  openNewProjectModal,
  onSelectProjectProposals,
  onSelectContract,
  isArabic
}) => {
  const activeContracts = contracts.filter((c) => c.status === 'in_progress' || c.status === 'delivered');
  const openProjects = projects.filter((p) => p.status === 'open');
  const pendingProposalsCount = proposals.filter((p) => p.status === 'pending').length;
  const totalEscrow = contracts
    .filter((c) => c.paymentStatus === 'escrow_held')
    .reduce((acc, c) => acc + c.escrowHeld, 0);

  // Status calculation for project distribution
  const completedProjectsCount = projects.filter((p) => p.status === 'completed').length;
  const inProgressProjectsCount = projects.filter((p) => p.status === 'in_progress').length;
  const draftProjectsCount = projects.filter((p) => p.status === 'draft').length;

  const categories = [
    { name: isArabic ? 'تطوير البرمجيات (Development)' : 'Development', count: 4, percent: 45 },
    { name: isArabic ? 'تصميم واجهات و UI/UX' : 'Design & UI/UX', count: 3, percent: 30 },
    { name: isArabic ? 'كتابة المحتوى والسيو' : 'Writing & SEO', count: 2, percent: 15 },
    { name: isArabic ? 'التسويق الرقمي' : 'Digital Marketing', count: 1, percent: 10 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner matching Screen 1 */}
      <div className="bg-gradient-to-r from-[#122338] via-[#1a3454] to-[#1f4068] rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-400/30">
                {isArabic ? 'بوابة العميل الرسمية' : 'Official Client Portal'}
              </span>
              <span className="text-xs text-slate-300">
                {new Date().toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isArabic ? `مرحباً، ${clientProfile.name}` : `Welcome, ${clientProfile.name}`}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              {isArabic
                ? 'إليك ملخص أداء مشاريعك، العروض الجديدة المقدمة، وحالة العقود المحمية بالضمان المالي اليوم.'
                : "Here is what's happening with your projects, proposals, and escrow-protected contracts today."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={openNewProjectModal}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>{isArabic ? 'نشر مشروع جديد' : 'Post a Project'}</span>
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/15 transition-all"
            >
              {isArabic ? 'إدارة المحفظة' : 'Manage Wallet'}
            </button>
          </div>
        </div>

        {/* Decorative ambient elements */}
        <div className="absolute -end-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute end-1/3 -top-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Top 4 Metrics Cards (matching Screen 1 layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{isArabic ? 'إجمالي الإنفاق' : 'Total Spent'}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">$12,480</div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12% {isArabic ? 'مقارنة بالشهر الماضي' : 'vs last month'}</span>
          </div>
        </div>

        {/* Total Projects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{isArabic ? 'المشاريع المنشورة' : 'Total Projects'}</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{projects.length}</div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="text-emerald-600 font-semibold">{activeContracts.length} {isArabic ? 'عقود نشطة' : 'active'}</span>
            <span>•</span>
            <span>{openProjects.length} {isArabic ? 'مفتوح للعروض' : 'open'}</span>
          </div>
        </div>

        {/* Escrow Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{isArabic ? 'رصيد الضمان المالي (Escrow)' : 'Escrow Protected'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">${totalEscrow.toLocaleString()}</div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            {isArabic ? 'محجوز بأمان لحين استلام المشاريع' : 'Protected until approval'}
          </div>
        </div>

        {/* Pending Proposals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{isArabic ? 'عروض بانتظار المراجعة' : 'Pending Proposals'}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{pendingProposalsCount}</div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 font-semibold cursor-pointer hover:underline" onClick={() => setActiveTab('proposals')}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isArabic ? 'عرض المطابقات الذكية' : 'Review AI Matches'}</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Platform Spend & Project Status Breakdown (matching Screen 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity & Spend Progress */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isArabic ? 'معدل وتيرة المشاريع والإنفاق' : 'Project Spending & Momentum'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic ? 'تحليل مسار الميزانية خلال الفترات السابقة' : 'Historical budget and project delivery trends'}
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {isArabic ? 'آخر 30 يوماً' : 'Last 30 Days'}
            </span>
          </div>

          {/* Simple Visual Bar Chart */}
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2 border-b border-slate-100">
            {[
              { day: isArabic ? 'السبت' : 'Sat', val: 40, spend: '$600' },
              { day: isArabic ? 'الأحد' : 'Sun', val: 65, spend: '$950' },
              { day: isArabic ? 'الإثنين' : 'Mon', val: 50, spend: '$750' },
              { day: isArabic ? 'الثلاثاء' : 'Tue', val: 85, spend: '$1,300' },
              { day: isArabic ? 'الأربعاء' : 'Wed', val: 70, spend: '$1,050' },
              { day: isArabic ? 'الخميس' : 'Thu', val: 95, spend: '$1,500' },
              { day: isArabic ? 'الجمعة' : 'Fri', val: 60, spend: '$800' }
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded transition-opacity">
                  {item.spend}
                </div>
                <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg h-32 flex items-end overflow-hidden p-0.5">
                  <div
                    style={{ height: `${item.val}%` }}
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-md group-hover:from-blue-500 group-hover:to-indigo-400 transition-all duration-300"
                  />
                </div>
                <span className="text-[11px] text-slate-400 font-medium">{item.day}</span>
              </div>
            ))}
          </div>

          {/* Quick Notice regarding Scope Change */}
          <div className="mt-5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <span className="font-bold text-amber-900">
                {isArabic ? 'تنبيه تعديل نطاق عمل قيد المراجعة:' : 'Pending Scope Change Request:'}
              </span>
              <p className="text-amber-800 mt-0.5">
                {isArabic
                  ? 'المستقلة مريم الصالح قدمت طلب تعديل على عقد تطبيق العقارات (+150$ و +3 أيام) لإضافة الوضع الليلي.'
                  : 'Freelancer Maryam requested a scope modification (+ $150 & 3 days) for Real Estate App.'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('workspace')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shrink-0 transition-colors"
            >
              {isArabic ? 'مراجعة الطلب' : 'Review'}
            </button>
          </div>
        </div>

        {/* Right 1 Col: Project Status (Donut simulation) & Top Categories */}
        <div className="space-y-6">
          {/* Status card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              {isArabic ? 'حالة المشاريع' : 'Project Status'}
            </h3>
            <div className="flex items-center gap-6">
              {/* Circular Gauge */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600"
                    strokeDasharray="68, 100"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-lg font-black text-slate-800">68%</span>
                  <span className="block text-[9px] text-slate-400 font-semibold">{isArabic ? 'إنجاز' : 'Done'}</span>
                </div>
              </div>

              {/* Status legend */}
              <div className="space-y-2 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {isArabic ? 'مكتمل' : 'Completed'}
                  </span>
                  <span className="font-bold text-slate-800">{completedProjectsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    {isArabic ? 'قيد التنفيذ' : 'In Progress'}
                  </span>
                  <span className="font-bold text-slate-800">{inProgressProjectsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    {isArabic ? 'مفتوح للعروض' : 'Open'}
                  </span>
                  <span className="font-bold text-slate-800">{openProjects.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    {isArabic ? 'مسودات' : 'Draft'}
                  </span>
                  <span className="font-bold text-slate-800">{draftProjectsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Categories Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              {isArabic ? 'أبرز تصنيفات الأعمال' : 'Top Categories'}
            </h3>
            <div className="space-y-3">
              {categories.map((cat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{cat.name}</span>
                    <span className="text-slate-400">{cat.count} {isArabic ? 'مشاريع' : 'projects'}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${cat.percent}%` }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Contracts & Recent Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isArabic ? 'العقود النشطة ومتابعة التنفيذ' : 'Active Contracts & Workflows'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isArabic ? 'العقود السارية والمخرجات المرفوعة من قبل المستقلين' : 'Ongoing contracts and delivered milestone files'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>{isArabic ? 'عرض كافة المشاريع' : 'View All Projects'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50/80 text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 text-start">{isArabic ? 'رقم العقد / المشروع' : 'Order / Project'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'المستقل المنفذ' : 'Freelancer'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'قيمة العقد' : 'Amount'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'حالة الضمان' : 'Escrow'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'موعد التسليم' : 'Deadline'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 text-end">{isArabic ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {activeContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{contract.orderNumber}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{contract.projectTitle}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={contract.freelancerAvatar}
                        alt={contract.freelancerName}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{contract.freelancerName}</div>
                        <div className="text-[10px] text-slate-400">{contract.freelancerSpecialty}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    ${contract.contractValue}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      {isArabic ? 'محجوز بالضمان' : 'Escrow Locked'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {contract.deliveryDate}
                  </td>
                  <td className="py-3.5 px-4">
                    {contract.status === 'delivered' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        <CheckCircle2 className="w-3 h-3" />
                        {isArabic ? 'تم التسليم للمراجعة' : 'Delivered'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        {isArabic ? 'قيد التنفيذ' : 'In Progress'}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-end">
                    <button
                      onClick={() => {
                        onSelectContract(contract.id);
                        setActiveTab('workspace');
                      }}
                      className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {isArabic ? 'فتح مساحة العمل' : 'Workspace'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
