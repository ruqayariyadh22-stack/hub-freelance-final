import React, { useState } from 'react';
import { Bell, LockKeyhole, UserRound } from 'lucide-react';
import { t } from '../freelance-i18n';
import { Card, PageHeader } from '../components/freelance-UI';
import { getStoredUser } from '../api';

export default function Settings({ lang, notify }) {
  const user = getStoredUser();
  const [prefs, setPrefs] = useState({
    email: true,
    proposal: true,
    payment: true,
  });

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="الإعدادات"
        titleEn="Settings"
        subAr="بيانات الحساب من الجلسة. لا توجد واجهة حفظ إعدادات إشعارات في الخادم."
        subEn="Account data from session. No notification-settings persistence API exists."
      />
      <div className="settings-grid">
        <Card>
          <div className="section-title">
            <UserRound size={17} />
            <div>
              <h3>{t(lang, 'بيانات الحساب', 'Account profile')}</h3>
              <p>{t(lang, 'من جلسة تسجيل الدخول', 'From your login session')}</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              {t(lang, 'الاسم', 'Name')}
              <input value={user?.name || ''} readOnly />
            </label>
            <label>
              {t(lang, 'البريد الإلكتروني', 'Email')}
              <input value={user?.email || ''} readOnly />
            </label>
            <label>
              {t(lang, 'الهاتف', 'Phone')}
              <input value={user?.phone || ''} readOnly />
            </label>
            <label>
              {t(lang, 'الدور', 'Role')}
              <input value={user?.role || ''} readOnly />
            </label>
          </div>
        </Card>
        <Card>
          <div className="section-title">
            <LockKeyhole size={17} />
            <div>
              <h3>{t(lang, 'الأمان', 'Security')}</h3>
              <p>
                {t(
                  lang,
                  'تغيير كلمة المرور غير موصول بواجهة Freelancer هنا.',
                  'Password change is not wired in the Freelancer settings UI.',
                )}
              </p>
            </div>
          </div>
        </Card>
        <Card className="full-card">
          <div className="section-title">
            <Bell size={17} />
            <div>
              <h3>{t(lang, 'تفضيلات محلية', 'Local preferences')}</h3>
              <p>
                {t(
                  lang,
                  'هذه المفاتيح محلية للواجهة فقط وليست مصدر حقيقة في الخادم.',
                  'These toggles are UI-local only and are not backend persistence.',
                )}
              </p>
            </div>
          </div>
          {[
            ['email', 'البريد الإلكتروني', 'Email notifications'],
            ['proposal', 'ردود وعروض جديدة', 'Proposal responses'],
            ['payment', 'تحديثات الدفعات', 'Payment updates'],
          ].map(([k, ar, en]) => (
            <div className="toggle-row" key={k}>
              <div>
                <b>{t(lang, ar, en)}</b>
                <small>{t(lang, 'واجهة فقط', 'UI only')}</small>
              </div>
              <button
                className={`switch ${prefs[k] ? 'on' : ''}`}
                type="button"
                onClick={() => setPrefs((s) => ({ ...s, [k]: !s[k] }))}
              >
                <span />
              </button>
            </div>
          ))}
          <div className="modal-actions">
            <button
              className="ghost"
              type="button"
              onClick={() =>
                notify(
                  t(
                    lang,
                    'لا يوجد حفظ إعدادات على الخادم',
                    'No server-side settings save exists',
                  ),
                )
              }
            >
              {t(lang, 'لا يوجد حفظ على الخادم', 'No server save')}
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
