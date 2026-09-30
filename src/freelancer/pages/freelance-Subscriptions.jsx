import React, { useState } from 'react';
import { Check, Zap, X } from 'lucide-react';
import { t } from '../freelance-i18n';
import { Card, Modal, PageHeader } from '../components/freelance-UI';

export default function Subscriptions({ lang, notify }) {
  const plans = [
    {
      name: 'Basic',
      price: 15,
      features: [
        '5 عروض إضافية شهرياً',
        'مطابقة ذكية أساسية',
        'دعم أساسي'
      ]
    },
    {
      name: 'Professional',
      price: 29,
      popular: true,
      features: [
        '15 عرضاً إضافياً',
        'مطابقة ذكية متقدمة',
        'شارة Pro',
        'أولوية في الدعم'
      ]
    },
    {
      name: 'Premium',
      price: 49,
      features: [
        'عروض غير محدودة',
        'مطابقة ذكية متقدمة',
        'شارة Top Rated',
        'أولوية في الظهور'
      ]
    }
  ];

  const [currentPlan, setCurrentPlan] = useState('Professional');
  const [manageOpen, setManageOpen] = useState(false);
  const [confirmPlan, setConfirmPlan] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [active, setActive] = useState(true);

  const selectedPlan = plans.find(
    plan => plan.name === currentPlan
  );

  const choosePlan = (plan) => {
    if (plan.name === currentPlan && active) {
      setManageOpen(true);
      return;
    }

    setConfirmPlan(plan);
  };

  const confirmSubscription = () => {
    if (!confirmPlan) return;

    setCurrentPlan(confirmPlan.name);
    setActive(true);
    setConfirmPlan(null);

    notify(
      t(
        lang,
        `تم الاشتراك في باقة ${confirmPlan.name} بنجاح`,
        `You subscribed to the ${confirmPlan.name} plan`
      )
    );
  };

  const cancelSubscription = () => {
    setActive(false);
    setCancelOpen(false);
    setManageOpen(false);

    notify(
      t(
        lang,
        'تم إلغاء التجديد التلقائي للاشتراك',
        'Automatic subscription renewal has been cancelled'
      )
    );
  };

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="الاشتراكات"
        titleEn="Subscriptions"
        subAr="طوّر حدود الاستخدام ومزايا المطابقة والأدوات الذكية."
        subEn="Unlock more usage, matching, and smart tools."
      />

      <div className="plans">
        {plans.map(plan => (
          <Card
            className={`plan ${plan.popular ? 'popular' : ''}`}
            key={plan.name}
          >
            {plan.popular && (
              <span className="popular-badge">
                {t(lang, 'الأكثر استخداماً', 'Most used')}
              </span>
            )}

            <div className="plan-icon">
              <Zap size={19} />
            </div>

            <h3>{plan.name}</h3>

            <div className="price">
              ${plan.price}
              <small>/month</small>
            </div>

            <div className="divider" />

            {plan.features.map(feature => (
              <div className="feature" key={feature}>
                <Check size={14} />
                {t(
                  lang,
                  feature,
                  feature
                    .replace('عروض إضافية', 'extra offers')
                    .replace('عروضاً إضافية', 'extra offers')
                    .replace('عروض غير محدودة', 'unlimited offers')
                    .replace('مطابقة ذكية أساسية', 'basic smart matching')
                    .replace('مطابقة ذكية متقدمة', 'advanced smart matching')
                    .replace('دعم أساسي', 'basic support')
                    .replace('شارة Pro', 'Pro badge')
                    .replace('شارة Top Rated', 'Top Rated badge')
                    .replace('أولوية في الدعم', 'priority support')
                    .replace('أولوية في الظهور', 'priority visibility')
                )}
              </div>
            ))}

            <button
              className={
                plan.name === currentPlan && active
                  ? 'ghost'
                  : plan.popular
                    ? 'primary'
                    : 'ghost'
              }
              onClick={() => choosePlan(plan)}
            >
              {plan.name === currentPlan && active
                ? t(lang, 'الباقة الحالية', 'Current plan')
                : plan.popular
                  ? t(lang, 'الاشتراك الآن', 'Subscribe now')
                  : t(lang, 'اختيار الباقة', 'Choose plan')}
            </button>
          </Card>
        ))}
      </div>

      <Card className="current-plan">
        <div className="between">
          <div>
            <span
              className={`badge-soft ${
                active ? 'green' : 'red'
              }`}
            >
              {active
                ? t(lang, 'نشطة', 'Active')
                : t(lang, 'ملغاة', 'Cancelled')}
            </span>

            <h3>
              {active
                ? t(
                    lang,
                    `باقة ${currentPlan} الحالية`,
                    `Current ${currentPlan} plan`
                  )
                : t(
                    lang,
                    `باقة ${currentPlan} — غير مجددة`,
                    `${currentPlan} plan — not renewing`
                  )}
            </h3>

            <p>
              {active
                ? t(
                    lang,
                    'تنتهي في 2026-10-01 · الدفع مكتمل',
                    'Renews on 2026-10-01 · Payment completed'
                  )
                : t(
                    lang,
                    'ستبقى المزايا متاحة حتى نهاية فترة الاشتراك الحالية.',
                    'Your benefits remain available until the current billing period ends.'
                  )}
            </p>
          </div>

          <button
            className="ghost"
            onClick={() => setManageOpen(true)}
          >
            {t(lang, 'إدارة الاشتراك', 'Manage subscription')}
          </button>
        </div>
      </Card>

      {confirmPlan && (
        <Modal
          lang={lang}
          titleAr="تأكيد الاشتراك"
          titleEn="Confirm Subscription"
          onClose={() => setConfirmPlan(null)}
        >
          <div className="subscription-confirm">
            <div className="plan-icon">
              <Zap size={19} />
            </div>

            <h3>
              {t(
                lang,
                `باقة ${confirmPlan.name}`,
                `${confirmPlan.name} Plan`
              )}
            </h3>

            <div className="price">
              ${confirmPlan.price}
              <small>/month</small>
            </div>

            <p>
              {t(
                lang,
                'سيتم تفعيل هذه الباقة على حسابك محلياً.',
                'This plan will be activated on your account locally.'
              )}
            </p>

            <div className="confirm-features">
              {confirmPlan.features.map(feature => (
                <div key={feature}>
                  <Check size={14} />
                  {t(lang, feature, feature)}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="ghost"
              onClick={() => setConfirmPlan(null)}
            >
              {t(lang, 'إلغاء', 'Cancel')}
            </button>

            <button
              className="primary"
              onClick={confirmSubscription}
            >
              {t(
                lang,
                'تأكيد الاشتراك',
                'Confirm subscription'
              )}
            </button>
          </div>
        </Modal>
      )}

      {manageOpen && (
        <Modal
          lang={lang}
          titleAr="إدارة الاشتراك"
          titleEn="Manage Subscription"
          onClose={() => setManageOpen(false)}
        >
          <div className="manage-subscription">
            <div className="between">
              <div>
                <span className="badge-soft green">
                  {active
                    ? t(lang, 'نشطة', 'Active')
                    : t(lang, 'ملغاة', 'Cancelled')}
                </span>

                <h3>
                  {t(
                    lang,
                    `باقة ${currentPlan}`,
                    `${currentPlan} Plan`
                  )}
                </h3>
              </div>

              <strong>
                ${selectedPlan?.price}/month
              </strong>
            </div>

            <div className="divider" />

            <div className="manage-info">
              <div>
                <span>
                  {t(lang, 'تاريخ التجديد', 'Renewal date')}
                </span>
                <strong>2026-10-01</strong>
              </div>

              <div>
                <span>
                  {t(lang, 'حالة الدفع', 'Payment status')}
                </span>
                <strong>
                  {t(lang, 'مكتمل', 'Completed')}
                </strong>
              </div>
            </div>

            <div className="manage-features">
              {selectedPlan?.features.map(feature => (
                <div key={feature}>
                  <Check size={14} />
                  {t(lang, feature, feature)}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="ghost"
              onClick={() => {
                setManageOpen(false);
                setConfirmPlan(selectedPlan);
              }}
            >
              {t(lang, 'تغيير الباقة', 'Change plan')}
            </button>

            {active && (
              <button
                className="danger"
                onClick={() => setCancelOpen(true)}
              >
                <X size={15} />
                {t(
                  lang,
                  'إلغاء الاشتراك',
                  'Cancel subscription'
                )}
              </button>
            )}
          </div>
        </Modal>
      )}

      {cancelOpen && (
        <Modal
          lang={lang}
          titleAr="إلغاء الاشتراك"
          titleEn="Cancel Subscription"
          onClose={() => setCancelOpen(false)}
        >
          <div className="cancel-subscription">
            <div className="cancel-icon">
              <X size={22} />
            </div>

            <h3>
              {t(
                lang,
                'هل تريد إلغاء تجديد الاشتراك؟',
                'Do you want to cancel subscription renewal?'
              )}
            </h3>

            <p>
              {t(
                lang,
                'ستبقى مزاياك متاحة حتى نهاية فترة الاشتراك الحالية.',
                'Your benefits will remain available until the end of the current billing period.'
              )}
            </p>
          </div>

          <div className="modal-actions">
            <button
              className="ghost"
              onClick={() => setCancelOpen(false)}
            >
              {t(lang, 'العودة', 'Go back')}
            </button>

            <button
              className="danger"
              onClick={cancelSubscription}
            >
              {t(
                lang,
                'تأكيد الإلغاء',
                'Confirm cancellation'
              )}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}