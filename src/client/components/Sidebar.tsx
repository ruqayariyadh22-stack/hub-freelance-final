import React from 'react';
import HubLogo from '../../shared/HubLogo';
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck2,
  Briefcase,
  Users,
  Wallet,
  ShieldAlert,
  Star,
  Settings,

  PlusCircle,
  Building2,
  ChevronRight,
  ChevronLeft,
  Handshake
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'projects'
  | 'proposals'
  | 'workspace'
  | 'freelancers'
  | 'wallet'
  | 'disputes'
  | 'reviews'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openNewProjectModal: () => void;
  unreadScopeChangesCount?: number;
  pendingProposalsCount?: number;
  isArabic: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openNewProjectModal,
  unreadScopeChangesCount = 1,
  pendingProposalsCount = 3,
  isArabic
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: isArabic ? 'الرئيسية' : 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'projects' as ActiveTab,
      label: isArabic ? 'إدارة المشاريع' : 'Projects',
      icon: FolderKanban,
      badge: null
    },
    {
      id: 'proposals' as ActiveTab,
      label: isArabic ? 'العروض والمطابقة' : 'Proposals & AI',
      icon: Handshake,
      badge: pendingProposalsCount > 0 ? pendingProposalsCount : null,
      badgeColor: 'bg-emerald-500'
    },
    {
      id: 'workspace' as ActiveTab,
      label: isArabic ? 'مساحة العمل والعقود' : 'Workspace & Orders',
      icon: Briefcase,
      badge: unreadScopeChangesCount > 0 ? isArabic ? 'تعديل' : 'Update' : null,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'freelancers' as ActiveTab,
      label: isArabic ? 'تصفح المستقلين' : 'Find Freelancers',
      icon: Users,
      badge: null
    },
    {
      id: 'wallet' as ActiveTab,
      label: isArabic ? 'المحفظة والضمان' : 'Wallet & Escrow',
      icon: Wallet,
      badge: null
    },
    {
      id: 'disputes' as ActiveTab,
      label: isArabic ? 'البلاغات والنزاعات' : 'Reports & Disputes',
      icon: ShieldAlert,
      badge: null
    },
    {
      id: 'reviews' as ActiveTab,
      label: isArabic ? 'التقييمات' : 'Reviews & Ratings',
      icon: Star,
      badge: null
    },
    {
      id: 'settings' as ActiveTab,
      label: isArabic ? 'الملف الشخصي والإعدادات' : 'Profile & Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 md:w-72 bg-[#122338] text-slate-300 flex flex-col shrink-0 min-h-screen border-e border-slate-800 transition-all duration-300">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HubLogo showText subtitle={isArabic ? 'بوابة العميل' : 'Client Portal'} />
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 pt-5 pb-2">
        <button
          onClick={openNewProjectModal}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all duration-200 group active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
          <span className="text-sm font-semibold">{isArabic ? 'نشر مشروع جديد' : 'Post New Project'}</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
          {isArabic ? 'لوحة التحكم والمشاريع' : 'Workspace & Projects'}
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/90 text-white shadow-sm shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-white ${
                    item.badgeColor || 'bg-blue-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Client Profile Footer Card */}
      <div className="p-3.5 m-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80"
              alt="Company Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover border border-slate-600"
            />
            <span className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#122338]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Horizon Digital</p>
            <p className="text-[11px] text-slate-400 truncate">أحمد علي (Client)</p>
          </div>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {isArabic ? 'رصيد المحفظة: $4,250' : 'Balance: $4,250'}
          </span>
          <button
            onClick={() => setActiveTab('wallet')}
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            {isArabic ? 'إيداع' : 'Deposit'}
          </button>
        </div>
      </div>
    </aside>
  );
};
