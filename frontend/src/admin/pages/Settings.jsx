import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { AdminApiError, adminPost, getAdminUser } from '../api';

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #cbd5e1',
  marginTop: 6,
  fontSize: 14,
};

export default function Settings() {
  const { isArabic, toggleLanguage } = useLanguage();
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  let admin = { name: 'Admin', email: '' };
  try {
    const user = getAdminUser();
    if (user) {
      admin = {
        name: user.name || 'Admin',
        email: user.email || '',
      };
    }
  } catch {
    admin = { name: 'Admin', email: '' };
  }

  const changePassword = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!passwords.current || !passwords.next) {
      setMessage({ ok: false, text: isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields' });
      return;
    }
    if (passwords.next.length < 8) {
      setMessage({
        ok: false,
        text: isArabic ? 'كلمة المرور الجديدة 8 أحرف على الأقل' : 'New password must be at least 8 characters',
      });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setMessage({ ok: false, text: isArabic ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await adminPost('/auth/change-password', {
        current_password: passwords.current,
        new_password: passwords.next,
      });
      setPasswords({ current: '', next: '', confirm: '' });
      setMessage({ ok: true, text: isArabic ? 'تم تحديث كلمة المرور' : 'Password updated' });
    } catch (err) {
      setMessage({
        ok: false,
        text:
          err instanceof AdminApiError && err.message
            ? err.message
            : isArabic
              ? 'تعذر تحديث كلمة المرور'
              : 'Unable to update password',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="main-content">
      <div className="page-header">
        <div>
          <h1>{isArabic ? 'الملف والإعدادات' : 'Profile & Settings'}</h1>
          <p>
            {isArabic
              ? 'بيانات حساب الإدارة وتغيير كلمة المرور.'
              : 'Administrator account details and password.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div className="table-card" style={{ padding: 20, maxWidth: 420, flex: '1 1 300px' }}>
          <div style={{ marginBottom: 12 }}>
            <strong>{isArabic ? 'الاسم' : 'Name'}</strong>
            <p>{admin.name}</p>
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>{isArabic ? 'البريد' : 'Email'}</strong>
            <p>{admin.email || '—'}</p>
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>{isArabic ? 'الدور' : 'Role'}</strong>
            <p>admin</p>
          </div>
          <button type="button" className="primary-button" onClick={toggleLanguage}>
            {isArabic ? 'تبديل اللغة' : 'Toggle language'}
          </button>
        </div>

        <form
          className="table-card"
          style={{ padding: 20, maxWidth: 420, flex: '1 1 300px' }}
          onSubmit={changePassword}
        >
          <strong>{isArabic ? 'تغيير كلمة المرور' : 'Change password'}</strong>
          {[
            ['current', isArabic ? 'كلمة المرور الحالية' : 'Current password', 'current-password'],
            ['next', isArabic ? 'كلمة المرور الجديدة' : 'New password', 'new-password'],
            ['confirm', isArabic ? 'تأكيد كلمة المرور' : 'Confirm password', 'new-password'],
          ].map(([key, label, autoComplete]) => (
            <label key={key} style={{ display: 'block', marginTop: 14, fontSize: 13 }}>
              {label}
              <input
                type="password"
                autoComplete={autoComplete}
                value={passwords[key]}
                onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                style={inputStyle}
              />
            </label>
          ))}
          {message && (
            <p style={{ marginTop: 12, fontSize: 13, color: message.ok ? '#059669' : '#dc2626' }}>
              {message.text}
            </p>
          )}
          <button type="submit" className="primary-button" disabled={saving} style={{ marginTop: 16 }}>
            {saving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : isArabic ? 'تحديث كلمة المرور' : 'Update password'}
          </button>
        </form>
      </div>
    </main>
  );
}
