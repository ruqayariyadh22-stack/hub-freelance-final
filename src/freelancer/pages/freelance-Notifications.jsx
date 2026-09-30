import React, { useState } from 'react';
import {
  Bell,
  MoreHorizontal,
  RotateCcw,
  Check,
  Trash2,
} from 'lucide-react';

import { t } from '../freelance-i18n';
import { notifications } from '../freelance-data';
import { Card, PageHeader } from '../components/freelance-UI';

export default function Notifications({ lang, notify }) {
  const [items, setItems] = useState(
    notifications.map((item, index) => ({
      ...item,
      id: index + 1,
      read: false,
    }))
  );

  const [openMenu, setOpenMenu] = useState(null);

  const showMessage = (ar, en) => {
    if (notify) {
      notify(t(lang, ar, en));
    }
  };

  const markAsRead = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, read: true }
          : item
      )
    );

    setOpenMenu(null);

    showMessage(
      'تم تعليم الإشعار كمقروء',
      'Notification marked as read'
    );
  };

  const deleteNotification = (id) => {
    setItems((prev) =>
      prev.filter((item) => item.id !== id)
    );

    setOpenMenu(null);

    showMessage(
      'تم حذف الإشعار',
      'Notification deleted'
    );
  };

  const markAllRead = () => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      }))
    );

    setOpenMenu(null);

    showMessage(
      'تم تعليم جميع الإشعارات كمقروءة',
      'All notifications marked as read'
    );
  };

  const toggleMenu = (id) => {
    setOpenMenu((current) =>
      current === id ? null : id
    );
  };

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="الإشعارات"
        titleEn="Notifications"
        subAr="كل التحديثات المهمة حول عروضك وعقودك ومدفوعاتك."
        subEn="Important updates about proposals, contracts, and payments."
        action={
          <button
            type="button"
            className="ghost"
            onClick={() => {
              markAllRead();
            }}
          >
            <RotateCcw size={14} />

            {t(
              lang,
              'تعليم الكل كمقروء',
              'Mark all read'
            )}
          </button>
        }
      />

      <Card>
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="notification"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '11px',
                padding: '13px 0',
                borderBottom: '1px solid #e8edf5',
                background: item.read
                  ? 'transparent'
                  : 'linear-gradient(90deg, transparent, #f9fbff)',
              }}
            >
              <div
                className={`notif-icon ${item.tone}`}
              >
                <Bell size={15} />
              </div>

              <div className="grow">
                <b>
                  {t(
                    lang,
                    item.titleAr,
                    item.titleEn
                  )}
                </b>

                <small>
                  {t(
                    lang,
                    item.timeAr,
                    item.timeEn
                  )}
                </small>
              </div>

              <div
                style={{
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => toggleMenu(item.id)}
                >
                  <MoreHorizontal size={15} />
                </button>

                {openMenu === item.id && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '40px',
                      right: '0',
                      width: '190px',
                      padding: '8px',
                      background: '#ffffff',
                      border: '1px solid #dfe7f5',
                      borderRadius: '12px',
                      boxShadow:
                        '0 8px 24px rgba(16, 33, 59, 0.15)',
                      zIndex: 9999,
                      boxSizing: 'border-box',
                    }}
                  >
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() =>
                          markAsRead(item.id)
                        }
                        style={{
                          width: '100%',
                          height: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '7px',
                          marginBottom: '5px',
                          border: 'none',
                          borderRadius: '8px',
                          background: '#ffffff',
                          color: '#1f64f4',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Check size={15} />

                        {t(
                          lang,
                          'تعليم كمقروء',
                          'Mark as read'
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        deleteNotification(item.id)
                      }
                      style={{
                        width: '100%',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '7px',
                        border: 'none',
                        borderRadius: '8px',
                        background: '#ffffff',
                        color: '#1f64f4',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={15} />

                      {t(
                        lang,
                        'حذف الإشعار',
                        'Delete notification'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty">
            <Bell size={28} />

            <h3>
              {t(
                lang,
                'لا توجد إشعارات',
                'No notifications'
              )}
            </h3>

            <p>
              {t(
                lang,
                'أنت مطّلع على كل شيء حالياً.',
                'You are all caught up.'
              )}
            </p>
          </div>
        )}
      </Card>
    </>
  );
}