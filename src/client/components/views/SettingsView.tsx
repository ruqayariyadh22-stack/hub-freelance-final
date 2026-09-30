import React, { useState } from 'react';
import {
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  Lock,
  Bell,
  Save,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ClientProfile } from '../../types';

interface SettingsViewProps {
  clientProfile: ClientProfile;
  onUpdateProfile: (updated: Partial<ClientProfile>) => void;
  isArabic: boolean;
  toggleLanguage: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  clientProfile,
  onUpdateProfile,
  isArabic,
  toggleLanguage
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [formData, setFormData] = useState({
    name: clientProfile.name,
    companyName: clientProfile.companyName,
    email: clientProfile.email,
    phone: clientProfile.phone,
    bio: clientProfile.bio,
    location: clientProfile.location,
    website: clientProfile.website
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header matching Screen 10 */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {isArabic ? 'الملف الشخصي وإعدادات الشركة (Profile & Settings)' : 'Profile & Settings'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {isArabic
            ? 'إدارة بيانات حساب العميل، تفاصيل الشركة والمؤسسة، وتفضيلات الأمان والإشعارات'
            : 'Manage company information, account preferences, and security credentials'}
        </p>
      </div>

      {/* Tabs matching Screen 10 */}
      <div className="flex border-b border-slate-200 gap-3">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{isArabic ? 'بيانات الشركة والعميل' : 'Company Profile'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>{isArabic ? 'كلمة المرور والأمان' : 'Security & Password'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'notifications'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{isArabic ? 'تفضيلات الإشعارات واللغة' : 'Preferences & Language'}</span>
        </button>
      </div>

      {/* Profile Form matching Screen 10 */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          {/* Logo & Avatar section */}
          <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
            <img
              src={clientProfile.logo}
              alt="Company Logo"
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
            />
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">{clientProfile.companyName}</h3>
              <p className="text-xs text-slate-400">{isArabic ? 'حساب عميل رسمي معتمد' : 'Verified Client Entity'}</p>
              <button
                type="button"
                onClick={() => alert(isArabic ? 'تم تفعيل اختيار الشعار الجديد' : 'Logo upload triggered')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200"
              >
                {isArabic ? 'تغيير الشعار' : 'Change Logo'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isArabic ? 'اسم المسؤول (Client Name)' : 'Contact Name'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isArabic ? 'اسم الشركة أو المؤسسة' : 'Company Name'}
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isArabic ? 'رقم الهاتف للتواصل' : 'Phone Number'}
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isArabic ? 'الموقع الجغرافي / الدولة' : 'Location / Country'}
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isArabic ? 'رابط الموقع الإلكتروني' : 'Website URL'}
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                {isArabic ? 'نبذة تعريفية عن نشاط الشركة' : 'Company Bio & Activity'}
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" />
                {isArabic ? 'تم حفظ التعديلات بنجاح!' : 'Changes saved successfully!'}
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                {isArabic ? 'يتم حفظ التغييرات على مستوى الجلسة' : 'Profile updates sync automatically'}
              </span>
            )}

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isArabic ? 'حفظ التعديلات' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Security Tab */}
      {activeSubTab === 'security' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 max-w-xl text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isArabic ? 'كلمة المرور الحالية' : 'Current Password'}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert(isArabic ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated')}
            className="bg-[#122338] text-white font-bold px-4 py-2 rounded-xl text-xs"
          >
            {isArabic ? 'تحديث كلمة المرور' : 'Update Password'}
          </button>
        </div>
      )}

      {/* Preferences Tab */}
      {activeSubTab === 'notifications' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 max-w-xl text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            {isArabic ? 'إعدادات النظام واللغة' : 'System Preferences'}
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-800 block">
                {isArabic ? 'لغة الواجهة (Language)' : 'Interface Language'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isArabic ? 'التبديل بين العربية والإنجليزية واتجاه الشاشة' : 'Switch between Arabic and English'}
              </span>
            </div>
            <button
              onClick={toggleLanguage}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold"
            >
              {isArabic ? 'English' : 'عربي'}
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600" />
              <div>
                <span className="font-bold text-slate-800 block">
                  {isArabic ? 'إشعارات العروض الجديدة فورا' : 'Instant proposal alerts'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isArabic ? 'إرسال تنبيه فور تقديم فريلانسر لعرض على مشاريعك' : 'Receive instant notification when bids arrive'}
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600" />
              <div>
                <span className="font-bold text-slate-800 block">
                  {isArabic ? 'تنبيهات طلبات تعديل النطاق (Scope Changes)' : 'Scope change alerts'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isArabic ? 'تنبيه مباشر عند طلب المستقل تعديل سعر أو موعد تسليم' : 'Instant alert on price/schedule adjustments'}
                </span>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
