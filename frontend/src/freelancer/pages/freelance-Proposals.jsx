import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { t } from '../freelance-i18n';
import { Card, Empty, PageHeader, Status } from '../components/freelance-UI';
import {
  errorMessage,
  formatMoney,
  freelancerGet,
  freelancerPatch,
  getFreelancerProfileId,
} from '../api';

export default function Proposals({ lang, notify }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const load = async () => {
    const profileId = getFreelancerProfileId();
    if (profileId == null) {
      setError(t(lang, 'تعذر تحديد ملف المستقل', 'Freelancer profile not found'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await freelancerGet(`/freelancers/${profileId}/proposals`);
      setProposals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(errorMessage(err, t(lang, 'تعذر تحميل العروض', 'Failed to load proposals')));
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const list =
    filter === 'all' ? proposals : proposals.filter((p) => p.status === filter);

  const openDetails = (proposal) => {
    setSelected(proposal);
    setEditPrice(proposal.proposed_price ?? '');
    setEditDuration(proposal.proposed_duration ?? '');
    setEditMessage(proposal.message ?? '');
    setSaveError(null);
  };

  const saveEdit = async () => {
    if (!selected || selected.status !== 'pending' || saving) return;
    const price = Number(editPrice);
    const duration = Number(editDuration);
    if (!price || price <= 0 || !Number.isInteger(duration) || duration <= 0) {
      setSaveError(
        t(lang, 'أدخل سعراً ومدة صحيحة', 'Enter a valid price and duration'),
      );
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await freelancerPatch(`/proposals/${selected.id}`, {
        proposed_price: price,
        proposed_duration: duration,
        message: editMessage.trim() || null,
      });
      setProposals((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
      setSelected(updated);
      notify(t(lang, 'تم تحديث العرض', 'Proposal updated'));
    } catch (err) {
      setSaveError(errorMessage(err, t(lang, 'فشل التحديث', 'Update failed')));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="العروض"
        titleEn="Proposals"
        subAr="تابع عروضك وحالاتها الفعلية من النظام."
        subEn="Track your proposals and their real statuses."
      />
      <div className="tabs">
        {[
          ['all', 'الكل', 'All'],
          ['pending', 'قيد المراجعة', 'Pending'],
          ['accepted', 'مقبولة', 'Accepted'],
          ['rejected', 'مرفوضة', 'Rejected'],
        ].map(([k, ar, en]) => (
          <button
            key={k}
            type="button"
            className={filter === k ? 'active' : ''}
            onClick={() => setFilter(k)}
          >
            {t(lang, ar, en)}
          </button>
        ))}
      </div>

      {loading && <Card><p>{t(lang, 'جاري التحميل...', 'Loading...')}</p></Card>}
      {error && (
        <Card>
          <p className="notice amber">{error}</p>
          <button className="primary" type="button" onClick={load}>
            {t(lang, 'إعادة المحاولة', 'Retry')}
          </button>
        </Card>
      )}
      {!loading && !error && list.length === 0 && (
        <Empty
          lang={lang}
          titleAr="لا توجد عروض"
          titleEn="No proposals"
          bodyAr="لم ترسل أي عروض بعد في هذه الحالة."
          bodyEn="You have no proposals in this filter."
        />
      )}

      {!loading && !error && list.length > 0 && (
        <Card>
          <div className="card-head">
            <div>
              <h3>{t(lang, 'سجل العروض', 'Proposal history')}</h3>
              <p>{t(lang, 'كل عرض مع حالته الحالية', 'Every proposal with its current status')}</p>
            </div>
            <span className="badge-soft blue">
              <FileText size={12} /> {list.length}
            </span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t(lang, 'رقم العرض', 'Proposal')}</th>
                  <th>{t(lang, 'المشروع', 'Project')}</th>
                  <th>{t(lang, 'القيمة', 'Value')}</th>
                  <th>{t(lang, 'المدة', 'Duration')}</th>
                  <th>{t(lang, 'الحالة', 'Status')}</th>
                  <th>{t(lang, 'إجراء', 'Action')}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <b>#{p.id}</b>
                      <small>
                        {p.submitted_at
                          ? String(p.submitted_at).slice(0, 10)
                          : '—'}
                      </small>
                    </td>
                    <td>
                      <b>#{p.project_id}</b>
                    </td>
                    <td>
                      <strong>{formatMoney(p.proposed_price)}</strong>
                    </td>
                    <td>
                      {p.proposed_duration != null
                        ? `${p.proposed_duration} ${t(lang, 'يوم', 'days')}`
                        : '—'}
                    </td>
                    <td>
                      <Status lang={lang} type={p.status} />
                    </td>
                    <td>
                      <button
                        className="icon-btn"
                        type="button"
                        onClick={() => openDetails(p)}
                      >
                        ↗
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selected && (
        <div className="proposal-overlay">
          <div className="proposal-modal">
            <button
              className="proposal-close"
              type="button"
              onClick={() => !saving && setSelected(null)}
            >
              ×
            </button>
            <h2>{t(lang, 'تفاصيل العرض', 'Proposal Details')}</h2>
            <p className="proposal-project-title">
              {t(lang, 'مشروع', 'Project')} #{selected.project_id}
            </p>
            {saveError && <p className="notice amber">{saveError}</p>}
            <div className="proposal-field">
              <label>{t(lang, 'الحالة', 'Status')}</label>
              <input value={selected.status} readOnly />
            </div>
            <div className="proposal-field">
              <label>{t(lang, 'القيمة', 'Value')}</label>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                disabled={selected.status !== 'pending' || saving}
              />
            </div>
            <div className="proposal-field">
              <label>{t(lang, 'مدة التنفيذ', 'Duration')}</label>
              <input
                type="number"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                disabled={selected.status !== 'pending' || saving}
              />
            </div>
            <div className="proposal-field">
              <label>{t(lang, 'الرسالة', 'Message')}</label>
              <textarea
                rows="4"
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                disabled={selected.status !== 'pending' || saving}
              />
            </div>
            <div className="proposal-actions">
              <button
                className="proposal-cancel"
                type="button"
                disabled={saving}
                onClick={() => setSelected(null)}
              >
                {t(lang, 'إغلاق', 'Close')}
              </button>
              {selected.status === 'pending' && (
                <button
                  className="primary"
                  type="button"
                  disabled={saving}
                  onClick={saveEdit}
                >
                  {saving
                    ? t(lang, 'جاري الحفظ...', 'Saving...')
                    : t(lang, 'حفظ التعديلات', 'Save changes')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
