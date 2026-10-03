import React, { useEffect, useState } from 'react';
import { Bell, LockKeyhole, UserRound } from 'lucide-react';
import { t } from '../freelance-i18n';
import { Card, PageHeader } from '../components/freelance-UI';
import {
  errorMessage,
  freelancerGet,
  freelancerPatch,
  freelancerPost,
  getStoredUser,
} from '../api';

const PREFERENCE_ROWS = [
  ['proposal_updates', 'العروض والدعوات', 'Proposals & invitations', 'قبول أو رفض عروضك ودعوات العملاء', 'Proposal decisions and client invitations'],
  ['project_updates', 'تحديثات العقود', 'Contract updates', 'العقود الجديدة وتعديلات النطاق والتسليم', 'New contracts, scope changes and deliveries'],
  ['payment_updates', 'تحديثات الدفعات', 'Payment updates', 'تحرير الدفعات والسحب والاشتراكات', 'Payment releases, withdrawals and subscriptions'],
  ['dispute_updates', 'تحديثات النزاعات', 'Dispute updates', 'فتح النزاعات وقرارات الإدارة', 'New disputes and admin decisions'],
];

export default function Settings({ lang, notify }) {
  const user = getStoredUser();
  const [prefs, setPrefs] = useState(null);
  const [prefsError, setPrefsError] = useState(null);
  const [savingKey, setSavingKey] = useState(null);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    freelancerGet('/users/me/preferences')
      .then(setPrefs)
      .catch((err) =>
        setPrefsError(errorMessage(err, t(lang, 'تعذر تحميل التفضيلات', 'Failed to load preferences'))),
      );
  }, []);

  const togglePref = async (key) => {
    if (!prefs || savingKey) return;
    const next = !prefs[key];
    setSavingKey(key);
    setPrefs((s) => ({ ...s, [key]: next }));
    try {
      const saved = await freelancerPatch('/users/me/preferences', { [key]: next });
      setPrefs(saved);
      setPrefsError(null);
    } catch (err) {
      setPrefs((s) => ({ ...s, [key]: !next }));
      setPrefsError(errorMessage(err, t(lang, 'تعذر حفظ التفضيل', 'Failed to save preference')));
    } finally {
      setSavingKey(null);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordBusy) return;
    if (!passwords.current || !passwords.next) {
      setPasswordError(t(lang, 'يرجى ملء جميع الحقول', 'Please fill in all fields'));
      return;
    }
    if (passwords.next.length < 8) {
      setPasswordError(t(lang, 'كلمة المرور الجديدة 8 أحرف على الأقل', 'New password must be at least 8 characters'));
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError(t(lang, 'كلمتا المرور غير متطابقتين', 'Passwords do not match'));
      return;
    }
    setPasswordBusy(true);
    setPasswordError(null);
    try {
      await freelancerPost('/auth/change-password', {
        current_password: passwords.current,
        new_password: passwords.next,
      });
      setPasswords({ current: '', next: '', confirm: '' });
      notify(t(lang, 'تم تحديث كلمة المرور', 'Password updated'));
    } catch (err) {
      setPasswordError(errorMessage(err, t(lang, 'تعذر تحديث كلمة المرور', 'Failed to update password')));
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="الإعدادات"
        titleEn="Settings"
        subAr="بيانات الحساب والأمان وتفضيلات الإشعارات."
        subEn="Account details, security and notification preferences."
      />
      <div className="settings-grid">
        <Card>
          <div className="section-title">
            <UserRound size={17} />
            <div>
              <h3>{t(lang, 'بيانات الحساب', 'Account profile')}</h3>
              <p>{t(lang, 'يمكن تعديل الاسم والنبذة من صفحة الملف الشخصي', 'Edit your public details from the Profile page')}</p>
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
              <p>{t(lang, 'تغيير كلمة مرور حسابك', 'Change your account password')}</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={changePassword}>
            <label className="full">
              {t(lang, 'كلمة المرور الحالية', 'Current password')}
              <input
                type="password"
                autoComplete="current-password"
                value={passwords.current}
                onChange={(e) => setPasswords((s) => ({ ...s, current: e.target.value }))}
              />
            </label>
            <label>
              {t(lang, 'كلمة المرور الجديدة', 'New password')}
              <input
                type="password"
                autoComplete="new-password"
                value={passwords.next}
                onChange={(e) => setPasswords((s) => ({ ...s, next: e.target.value }))}
              />
            </label>
            <label>
              {t(lang, 'تأكيد كلمة المرور', 'Confirm password')}
              <input
                type="password"
                autoComplete="new-password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((s) => ({ ...s, confirm: e.target.value }))}
              />
            </label>
            {passwordError && <p className="notice amber full">{passwordError}</p>}
            <div className="modal-actions full">
              <button className="primary" type="submit" disabled={passwordBusy}>
                {passwordBusy ? t(lang, 'جاري الحفظ...', 'Saving...') : t(lang, 'تحديث كلمة المرور', 'Update password')}
              </button>
            </div>
          </form>
        </Card>
        <Card className="full-card">
          <div className="section-title">
            <Bell size={17} />
            <div>
              <h3>{t(lang, 'تفضيلات الإشعارات', 'Notification preferences')}</h3>
              <p>{t(lang, 'يتم حفظها في حسابك وتطبق على الإشعارات الجديدة', 'Saved to your account and applied to new notifications')}</p>
            </div>
          </div>
          {prefsError && <p className="notice amber">{prefsError}</p>}
          {!prefs && !prefsError && <p>{t(lang, 'جاري التحميل...', 'Loading...')}</p>}
          {prefs &&
            PREFERENCE_ROWS.map(([key, ar, en, subAr, subEn]) => (
              <div className="toggle-row" key={key}>
                <div>
                  <b>{t(lang, ar, en)}</b>
                  <small>{t(lang, subAr, subEn)}</small>
                </div>
                <button
                  className={`switch ${prefs[key] ? 'on' : ''}`}
                  type="button"
                  disabled={savingKey !== null}
                  aria-pressed={prefs[key]}
                  onClick={() => togglePref(key)}
                >
                  <span />
                </button>
              </div>
            ))}
        </Card>
      </div>
    </>
  );
}
