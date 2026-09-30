import React, { useEffect, useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { t } from '../freelance-i18n';
import { Card, PageHeader } from '../components/freelance-UI';
import { errorMessage, freelancerGet, freelancerPost } from '../api';

export default function Subscriptions({ lang, notify }) {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [noActive, setNoActive] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    setNoActive(false);
    try {
      const planData = await freelancerGet('/subscriptions/plans');
      setPlans(Array.isArray(planData) ? planData : []);
      try {
        const current = await freelancerGet('/subscriptions/me');
        setSubscription(current);
      } catch (err) {
        if (err?.status === 404) {
          setSubscription(null);
          setNoActive(true);
        } else {
          throw err;
        }
      }
    } catch (err) {
      setError(
        errorMessage(err, t(lang, 'تعذر تحميل الاشتراك', 'Failed to load subscription')),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const subscribe = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const created = await freelancerPost('/subscriptions', {});
      setSubscription(created);
      setNoActive(false);
      notify(t(lang, 'تم الاشتراك في Freelancer Pro', 'Subscribed to Freelancer Pro'));
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل الاشتراك', 'Subscription failed')));
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await freelancerPost('/subscriptions/cancel', {});
      setSubscription(updated);
      notify(
        t(lang, 'تم إلغاء التجديد التلقائي', 'Auto-renewal cancelled'),
      );
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل الإلغاء', 'Cancel failed')));
    } finally {
      setBusy(false);
    }
  };

  const renew = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await freelancerPost('/subscriptions/renew', {});
      setSubscription(updated);
      notify(t(lang, 'تم تجديد الاشتراك', 'Subscription renewed'));
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل التجديد', 'Renew failed')));
    } finally {
      setBusy(false);
    }
  };

  const plan = plans[0];

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="الاشتراكات"
        titleEn="Subscriptions"
        subAr="الخطة المعتمدة في النظام: Freelancer Pro فقط."
        subEn="The platform supports Freelancer Pro only."
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

      {!loading && !error && (
        <div className="plans">
          {plan && (
            <Card className="plan popular">
              <div className="between">
                <span className="badge-soft blue">
                  <Zap size={12} /> {plan.plan_type}
                </span>
                {!noActive && subscription && (
                  <span className="badge-soft green">
                    {t(lang, 'نشط', 'Active')}
                  </span>
                )}
              </div>
              <h3>{plan.plan_type}</h3>
              <div className="price">
                <strong>
                  {Number(plan.price).toLocaleString()} {plan.currency || ''}
                </strong>
                <small>
                  / {plan.duration_days} {t(lang, 'يوم', 'days')}
                </small>
              </div>
              <ul>
                {(plan.benefits || []).map((b) => (
                  <li key={b}>
                    <Check size={14} /> {b}
                  </li>
                ))}
              </ul>
              {noActive || !subscription ? (
                <button className="primary" type="button" disabled={busy} onClick={subscribe}>
                  {busy
                    ? t(lang, 'جاري الاشتراك...', 'Subscribing...')
                    : t(lang, 'الاشتراك الآن', 'Subscribe now')}
                </button>
              ) : (
                <div className="modal-actions">
                  <button className="ghost" type="button" disabled={busy} onClick={cancel}>
                    {t(lang, 'إلغاء التجديد', 'Cancel renewal')}
                  </button>
                  <button className="primary" type="button" disabled={busy} onClick={renew}>
                    {t(lang, 'تجديد', 'Renew')}
                  </button>
                </div>
              )}
              {subscription && (
                <p style={{ marginTop: 12 }}>
                  {t(lang, 'الحالة', 'Status')}: {subscription.status} ·{' '}
                  {t(lang, 'ينتهي', 'Ends')}:{' '}
                  {subscription.end_date
                    ? String(subscription.end_date).slice(0, 10)
                    : '—'}
                  {subscription.cancel_at_period_end
                    ? ` · ${t(lang, 'يلغى عند نهاية الفترة', 'Cancels at period end')}`
                    : ''}
                </p>
              )}
            </Card>
          )}
        </div>
      )}
    </>
  );
}
