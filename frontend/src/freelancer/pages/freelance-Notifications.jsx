import React, { useEffect, useState } from 'react';
import { Bell, Check, MoreHorizontal } from 'lucide-react';
import { t } from '../freelance-i18n';
import { Card, Empty, PageHeader } from '../components/freelance-UI';
import { errorMessage, freelancerGet, freelancerPatch } from '../api';

export default function Notifications({ lang, notify }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await freelancerGet('/notifications');
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        errorMessage(err, t(lang, 'تعذر تحميل الإشعارات', 'Failed to load notifications')),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAsRead = async (id) => {
    if (busyId) return;
    setBusyId(id);
    try {
      const updated = await freelancerPatch(`/notifications/${id}/read`, {});
      setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setOpenMenu(null);
      if (notify) notify(t(lang, 'تم تعليم الإشعار كمقروء', 'Notification marked as read'));
    } catch (err) {
      if (notify) {
        notify(errorMessage(err, t(lang, 'فشل التحديث', 'Update failed')));
      }
    } finally {
      setBusyId(null);
    }
  };

  const unread = items.filter((n) => !n.is_read).length;

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="الإشعارات"
        titleEn="Notifications"
        subAr="إشعارات النظام المرتبطة بحسابك."
        subEn="System notifications for your account."
        action={
          <span className="badge-soft blue">
            <Bell size={12} /> {unread} {t(lang, 'غير مقروء', 'unread')}
          </span>
        }
      />

      {loading && <Card><p>{t(lang, 'جاري التحميل...', 'Loading...')}</p></Card>}
      {error && (
        <Card>
          <p className="notice amber">{error}</p>
          <button className="primary" type="button" onClick={load}>
            {t(lang, 'إعادة المحاولة', 'Retry')}
          </button>
        </Card>
      )}
      {!loading && !error && items.length === 0 && (
        <Empty
          lang={lang}
          titleAr="لا إشعارات"
          titleEn="No notifications"
          bodyAr="لا توجد إشعارات حالياً."
          bodyEn="You have no notifications."
        />
      )}

      {!loading && !error && items.length > 0 && (
        <Card>
          {items.map((item) => (
            <div
              className={`toggle-row ${item.is_read ? '' : 'unread'}`}
              key={item.id}
              style={{ position: 'relative' }}
            >
              <div>
                <b>{item.type}</b>
                <p>{item.message}</p>
                <small>
                  {item.created_at ? String(item.created_at).slice(0, 19) : ''}
                  {item.is_read ? '' : ` · ${t(lang, 'غير مقروء', 'unread')}`}
                </small>
              </div>
              <button
                className="icon-btn"
                type="button"
                onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
              >
                <MoreHorizontal size={16} />
              </button>
              {openMenu === item.id && !item.is_read && (
                <div className="notice" style={{ position: 'absolute', insetInlineEnd: 40, top: 8 }}>
                  <button
                    className="ghost"
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => markAsRead(item.id)}
                  >
                    <Check size={14} /> {t(lang, 'تعليمليم كمقروء', 'Mark as read')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
