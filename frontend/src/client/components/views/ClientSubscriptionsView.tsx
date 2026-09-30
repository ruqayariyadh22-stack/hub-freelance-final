import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Sparkles, Zap } from 'lucide-react';

type SubscriptionPlan = {
  plan_type?: string;
  price?: number;
  duration_days?: number;
  currency?: string;
  benefits?: string[];
  entitlements?: string[];
};

type SubscriptionRecord = {
  id?: number | string;
  plan_type?: string;
  price?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  payment_status?: string;
  cancel_at_period_end?: boolean;
};

interface ClientSubscriptionsViewProps {
  isArabic: boolean;
}

const API_BASE = 'http://localhost:5000/api';

const authHeaders = () => {
  const token = localStorage.getItem('hub_token');
  return {
    Authorization: `Bearer ${token || ''}`,
    'Content-Type': 'application/json',
  };
};

export const ClientSubscriptionsView: React.FC<ClientSubscriptionsViewProps> = ({
  isArabic,
}) => {
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [noActive, setNoActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setMessage('');
    setNoActive(false);

    try {
      const plansResponse = await fetch(`${API_BASE}/subscriptions/plans`, {
        headers: authHeaders(),
      });
      const plansPayload = await plansResponse.json().catch(() => null);
      if (!plansResponse.ok || !plansPayload?.success || !Array.isArray(plansPayload.data)) {
        throw new Error(
          plansPayload?.message ||
            (isArabic ? 'تعذر تحميل الخطة' : 'Unable to load plan'),
        );
      }
      setPlan(plansPayload.data[0] || null);

      const meResponse = await fetch(`${API_BASE}/subscriptions/me`, {
        headers: authHeaders(),
      });
      const mePayload = await meResponse.json().catch(() => null);

      if (meResponse.status === 404) {
        setSubscription(null);
        setNoActive(true);
      } else if (!meResponse.ok || !mePayload?.success) {
        throw new Error(
          mePayload?.message ||
            (isArabic ? 'تعذر تحميل الاشتراك' : 'Unable to load subscription'),
        );
      } else {
        setSubscription(mePayload.data);
        setNoActive(false);
      }
    } catch (err) {
      setPlan(null);
      setSubscription(null);
      setError(
        err instanceof Error
          ? err.message
          : isArabic
            ? 'تعذر تحميل الاشتراك'
            : 'Unable to load subscription',
      );
    } finally {
      setLoading(false);
    }
  }, [isArabic]);

  useEffect(() => {
    load();
  }, [load]);

  const subscribe = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({}),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success || !payload.data) {
        throw new Error(
          payload?.message ||
            (isArabic ? 'فشل الاشتراك' : 'Subscription failed'),
        );
      }
      setSubscription(payload.data);
      setNoActive(false);
      setMessage(
        isArabic
          ? 'تم تفعيل اشتراك Client AI بنجاح'
          : 'Client AI subscription activated',
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isArabic
            ? 'فشل الاشتراك'
            : 'Subscription failed',
      );
    } finally {
      setBusy(false);
    }
  };

  const priceLabel =
    plan?.price != null
      ? `${Number(plan.price).toLocaleString()} ${plan.currency || 'IQD'}`
      : '15,000 IQD';
  const durationLabel = plan?.duration_days ?? 30;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {isArabic ? 'اشتراك Client AI' : 'Client AI Subscription'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {isArabic
            ? 'فعّل مساعد وصف المشاريع المدفوع عبر محفظتك'
            : 'Unlock the paid Description Assistant through your wallet'}
        </p>
      </div>

      {loading && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-xs text-slate-500">
          {isArabic ? 'جاري التحميل...' : 'Loading...'}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl">
          {error}
          <button
            type="button"
            onClick={load}
            className="ms-3 underline font-bold"
          >
            {isArabic ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {message}
        </div>
      )}

      {!loading && !error && plan && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 max-w-lg">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
              <Zap className="w-3.5 h-3.5" />
              {plan.plan_type || 'Client AI'}
            </span>
            <span className="text-lg font-extrabold text-slate-900">{priceLabel}</span>
          </div>

          <p className="text-xs text-slate-600">
            {isArabic
              ? `المدة: ${durationLabel} يوماً`
              : `Duration: ${durationLabel} days`}
          </p>

          <ul className="space-y-2 text-xs text-slate-700">
            {(plan.benefits || ['Description Assistant']).map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                {benefit}
              </li>
            ))}
          </ul>

          {subscription && !noActive ? (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
              <p className="font-bold text-slate-900">
                {isArabic ? 'الاشتراك نشط' : 'Active subscription'}
              </p>
              <p className="text-slate-600">
                {isArabic ? 'حتى' : 'Until'}: {String(subscription.end_date || '—')}
              </p>
              <p className="text-slate-600">
                {isArabic ? 'الحالة' : 'Status'}: {String(subscription.status || 'active')}
              </p>
              {subscription.cancel_at_period_end ? (
                <p className="text-amber-700 font-semibold">
                  {isArabic
                    ? 'سيتم الإلغاء في نهاية الفترة'
                    : 'Cancels at period end'}
                </p>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={subscribe}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all"
            >
              {busy
                ? isArabic
                  ? 'جاري الاشتراك...'
                  : 'Subscribing...'
                : isArabic
                  ? 'اشترك الآن — 15,000 IQD'
                  : 'Subscribe now — 15,000 IQD'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
