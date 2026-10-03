import React, { useEffect, useRef, useState } from 'react';
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
import { clientRequest, errorText, uploadFile } from '../../api';

type NotificationPreferences = {
  email_notifications: boolean;
  proposal_updates: boolean;
  project_updates: boolean;
  payment_updates: boolean;
  dispute_updates: boolean;
};

interface SettingsViewProps {
  clientProfile: ClientProfile;
  onUpdateProfile: (updated: Partial<ClientProfile>) => Promise<boolean> | boolean;
  isArabic: boolean;
  toggleLanguage: () => void;
  profileLoading?: boolean;
  profileError?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  clientProfile,
  onUpdateProfile,
  isArabic,
  toggleLanguage,
  profileLoading = false,
  profileError = ''
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
  const [isSaving, setIsSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState('');

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [preferencesError, setPreferencesError] = useState('');
  const [savingPreference, setSavingPreference] = useState<string | null>(null);

  useEffect(() => {
    if (activeSubTab !== 'notifications' || preferences) {
      return;
    }
    clientRequest<NotificationPreferences>('/users/me/preferences')
      .then((data) => {
        setPreferences(data);
        setPreferencesError('');
      })
      .catch((err) =>
        setPreferencesError(errorText(err, isArabic ? 'تعذر تحميل التفضيلات' : 'Unable to load preferences'))
      );
  }, [activeSubTab, preferences, isArabic]);

  const togglePreference = async (key: keyof NotificationPreferences) => {
    if (!preferences || savingPreference) {
      return;
    }
    const nextValue = !preferences[key];
    setSavingPreference(key);
    setPreferences({ ...preferences, [key]: nextValue });
    try {
      const data = await clientRequest<NotificationPreferences>('/users/me/preferences', {
        method: 'PATCH',
        body: { [key]: nextValue }
      });
      setPreferences(data);
      setPreferencesError('');
    } catch (err) {
      setPreferences({ ...preferences, [key]: !nextValue });
      setPreferencesError(errorText(err, isArabic ? 'تعذر حفظ التفضيل' : 'Unable to save preference'));
    } finally {
      setSavingPreference(null);
    }
  };

  const handleLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      setLogoError(isArabic ? 'يرجى اختيار صورة' : 'Please choose an image file');
      return;
    }
    setLogoUploading(true);
    setLogoError('');
    try {
      const uploaded = await uploadFile(file);
      const ok = await onUpdateProfile({ logo: uploaded.file_url });
      if (!ok) {
        setLogoError(isArabic ? 'تعذر حفظ الشعار' : 'Unable to save logo');
      }
    } catch (err) {
      setLogoError(errorText(err, isArabic ? 'تعذر رفع الشعار' : 'Unable to upload logo'));
    } finally {
      setLogoUploading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordSaving) {
      return;
    }
    if (!passwords.current || !passwords.next) {
      setPasswordMessage({ ok: false, text: isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields' });
      return;
    }
    if (passwords.next.length < 8) {
      setPasswordMessage({
        ok: false,
        text: isArabic ? 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' : 'New password must be at least 8 characters'
      });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordMessage({ ok: false, text: isArabic ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match' });
      return;
    }
    setPasswordSaving(true);
    setPasswordMessage(null);
    try {
      await clientRequest('/auth/change-password', {
        method: 'POST',
        body: { current_password: passwords.current, new_password: passwords.next }
      });
      setPasswords({ current: '', next: '', confirm: '' });
      setPasswordMessage({ ok: true, text: isArabic ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully' });
    } catch (err) {
      setPasswordMessage({
        ok: false,
        text: errorText(err, isArabic ? 'تعذر تحديث كلمة المرور' : 'Unable to update password')
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  useEffect(() => {
    setFormData({
      name: clientProfile.name,
      companyName: clientProfile.companyName,
      email: clientProfile.email,
      phone: clientProfile.phone,
      bio: clientProfile.bio,
      location: clientProfile.location,
      website: clientProfile.website
    });
  }, [clientProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const { email: _email, ...editable } = formData;
      const succeeded = await onUpdateProfile(editable);
      if (succeeded) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } finally {
      setIsSaving(false);
    }
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
        {profileLoading && (
          <p className="text-xs text-slate-500 mt-2">
            {isArabic ? 'جاري تحميل الملف الشخصي...' : 'Loading profile...'}
          </p>
        )}
        {profileError && (
          <p className="text-xs font-bold text-red-600 mt-2">
            {isArabic
              ? profileError === 'Unable to load profile.'
                ? 'تعذر تحميل الملف الشخصي.'
                : profileError === 'Unable to update profile.'
                  ? 'تعذر حفظ الملف الشخصي.'
                  : profileError
              : profileError}
          </p>
        )}
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
              <h3 className="text-sm font-bold text-slate-900">{clientProfile.companyName || clientProfile.name}</h3>
              <p className="text-xs text-slate-400">{isArabic ? 'حساب عميل رسمي معتمد' : 'Verified Client Entity'}</p>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={handleLogoSelected}
              />
              <button
                type="button"
                disabled={logoUploading}
                onClick={() => logoInputRef.current?.click()}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 disabled:opacity-50"
              >
                {logoUploading
                  ? isArabic ? 'جاري الرفع...' : 'Uploading...'
                  : isArabic ? 'تغيير الشعار' : 'Change Logo'}
              </button>
              {logoError && <p className="text-[11px] font-bold text-red-600">{logoError}</p>}
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
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <input
                type="email"
                value={formData.email}
                readOnly
                title={isArabic ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 outline-none cursor-not-allowed"
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
                {isArabic ? 'يتم حفظ التغييرات في حسابك على الخادم' : 'Changes are saved to your account'}
              </span>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isArabic ? 'حفظ التعديلات' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Security Tab */}
      {activeSubTab === 'security' && (
        <form
          onSubmit={handleChangePassword}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 max-w-xl text-xs"
        >
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
          </h3>

          <div className="space-y-3">
            {([
              ['current', isArabic ? 'كلمة المرور الحالية' : 'Current Password', 'current-password'],
              ['next', isArabic ? 'كلمة المرور الجديدة' : 'New Password', 'new-password'],
              ['confirm', isArabic ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password', 'new-password']
            ] as const).map(([key, label, autoComplete]) => (
              <div key={key}>
                <label className="font-bold text-slate-700 block mb-1">{label}</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  autoComplete={autoComplete}
                  value={passwords[key]}
                  onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
                />
              </div>
            ))}
          </div>

          {passwordMessage && (
            <p className={`text-xs font-bold ${passwordMessage.ok ? 'text-emerald-600' : 'text-red-600'}`}>
              {passwordMessage.text}
            </p>
          )}

          <button
            type="submit"
            disabled={passwordSaving}
            className="bg-[#122338] text-white font-bold px-4 py-2 rounded-xl text-xs disabled:opacity-50"
          >
            {passwordSaving
              ? isArabic ? 'جاري الحفظ...' : 'Saving...'
              : isArabic ? 'تحديث كلمة المرور' : 'Update Password'}
          </button>
        </form>
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
            {preferencesError && <p className="text-xs font-bold text-red-600">{preferencesError}</p>}
            {!preferences && !preferencesError && (
              <p className="text-xs text-slate-500">{isArabic ? 'جاري تحميل التفضيلات...' : 'Loading preferences...'}</p>
            )}
            {preferences &&
              ([
                ['proposal_updates', isArabic ? 'إشعارات العروض الجديدة فوراً' : 'Instant proposal alerts', isArabic ? 'تنبيه فور تقديم فريلانسر لعرض على مشاريعك' : 'Get notified when freelancers submit proposals'],
                ['project_updates', isArabic ? 'تحديثات المشاريع وتعديل النطاق' : 'Project & scope change alerts', isArabic ? 'تنبيه عند طلب تعديل النطاق أو تسليم العمل' : 'Scope change requests, deliveries and contract updates'],
                ['payment_updates', isArabic ? 'تحديثات الدفعات والمحفظة' : 'Payment updates', isArabic ? 'الضمان وتحرير الدفعات والاشتراكات' : 'Escrow, releases and subscription changes'],
                ['dispute_updates', isArabic ? 'تحديثات النزاعات' : 'Dispute updates', isArabic ? 'فتح النزاعات وقرارات الإدارة' : 'New disputes and admin decisions']
              ] as const).map(([key, title, subtitle]) => (
                <label key={key} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences[key]}
                    disabled={savingPreference !== null}
                    onChange={() => togglePreference(key)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">{title}</span>
                    <span className="text-[11px] text-slate-400">{subtitle}</span>
                  </div>
                </label>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
