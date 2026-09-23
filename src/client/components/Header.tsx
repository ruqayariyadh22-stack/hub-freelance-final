import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  Globe,
  Menu,
  Check,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { NotificationItem, ClientProfile } from '../types';

interface HeaderProps {
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  isArabic: boolean;
  toggleLanguage: () => void;
  openAiAssistantModal: () => void;
  clientProfile: ClientProfile;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  notifications,
  markNotificationRead,
  onNavigateTab,
  isArabic,
  toggleLanguage,
  openAiAssistantModal,
  clientProfile,
  searchQuery,
  setSearchQuery,
  toggleMobileMenu
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu toggle & Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isArabic
                  ? 'ابحث في المشاريع، العروض، مساحات العمل، أو المستقلين...'
                  : 'Search projects, proposals, workspaces, or freelancers...'
              }
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl py-2 ps-10 pe-4 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* AI Helper Quick Trigger */}
          <button
            onClick={openAiAssistantModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100/70 transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>{isArabic ? 'مساعد الذكاء الاصطناعي AI' : 'AI Assistant'}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-all"
            title="Change language / تغيير اللغة"
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span>{isArabic ? 'English' : 'عربي'}</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute end-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">
                      {isArabic ? 'الإشعارات' : 'Notifications'}
                    </span>
                    {unreadCount > 0 && (
                      <span className="bg-blue-100 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} {isArabic ? 'جديد' : 'new'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {isArabic ? 'تحديث تلقائي' : 'Live updates'}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      {isArabic ? 'لا توجد إشعارات حالية' : 'No notifications'}
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          if (notif.linkTab) {
                            onNavigateTab(notif.linkTab);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 ${
                          !notif.isRead ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="mt-1">
                          <span
                            className={`w-2 h-2 rounded-full block ${
                              !notif.isRead ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-300'
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {notif.createdAt}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 pt-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      notifications.forEach((n) => markNotificationRead(n.id));
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {isArabic ? 'تعليم الكل كمقروء' : 'Mark all as read'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Client Profile Header Badge */}
          <div
            onClick={() => onNavigateTab('settings')}
            className="flex items-center gap-2.5 ps-2 border-s border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <img
              src={clientProfile.logo}
              alt={clientProfile.companyName}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-sm"
            />
            <div className="hidden lg:block text-start">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {clientProfile.name}
              </div>
              <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                <span>{isArabic ? 'حساب عميل موثق' : 'Verified Client'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
