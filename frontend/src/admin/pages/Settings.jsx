import { useLanguage } from '../components/LanguageContext';

export default function Settings() {
  const { isArabic, toggleLanguage } = useLanguage();

  let admin = { name: 'Admin', email: '' };
  try {
    const user = JSON.parse(localStorage.getItem('hub_user') || 'null');
    if (user) {
      admin = {
        name: user.name || 'Admin',
        email: user.email || '',
      };
    }
  } catch {
    admin = { name: 'Admin', email: '' };
  }

  return (
    <main className="main-content">
      <div className="page-header">
        <div>
          <h1>{isArabic ? 'الملف والإعدادات' : 'Profile & Settings'}</h1>
          <p>
            {isArabic
              ? 'عرض بيانات حساب الإدارة. لا توجد إعدادات منصة قابلة للتعديل من الواجهة.'
              : 'View the administrator account. No editable platform settings are exposed in this UI.'}
          </p>
        </div>
      </div>

      <div className="table-card" style={{ padding: 20, maxWidth: 520 }}>
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
        <p style={{ marginTop: 16, fontSize: 12, color: '#64748b' }}>
          {isArabic
            ? 'كلمة المرور وإعدادات النظام السرية غير قابلة للتعديل من هذه الصفحة.'
            : 'Password changes and secret system settings are not editable from this page.'}
        </p>
      </div>
    </main>
  );
}
