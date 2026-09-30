import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { t } from '../freelance-i18n';
import { Card, Empty, Modal, PageHeader, Status } from '../components/freelance-UI';
import {
  errorMessage,
  freelancerGet,
  freelancerPost,
} from '../api';

export default function Disputes({ lang, notify }) {
  const [open, setOpen] = useState(false);
  const [lookupId, setLookupId] = useState('');
  const [lookedUp, setLookedUp] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [form, setForm] = useState({
    project_id: '',
    issue_type: 'Payment issue',
    description: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await freelancerGet('/contracts');
        setContracts(Array.isArray(data) ? data : []);
      } catch {
        setContracts([]);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitDispute = async () => {
    if (busy) return;
    if (!form.project_id || !form.description.trim()) {
      notify(
        t(
          lang,
          'يرجى اختيار المشروع ووصف المشكلة',
          'Please select a project and describe the issue',
        ),
      );
      return;
    }
    const contract = contracts.find((c) => String(c.project_id) === String(form.project_id));
    setBusy(true);
    setError(null);
    try {
      const payload = {
        project_id: Number(form.project_id),
        issue_type: form.issue_type,
        description: form.description.trim(),
      };
      if (contract?.client_id != null) {
        // reported_against must be a user entity id in some flows; skip if unsure
      }
      const data = await freelancerPost('/disputes', payload);
      setCreated((prev) => [data, ...prev]);
      setOpen(false);
      setForm({ project_id: '', issue_type: 'Payment issue', description: '' });
      notify(t(lang, 'تم فتح النزاع', 'Dispute opened'));
    } catch (err) {
      const msg = errorMessage(err, t(lang, 'فشل فتح النزاع', 'Failed to open dispute'));
      setError(msg);
      notify(msg);
    } finally {
      setBusy(false);
    }
  };

  const lookup = async () => {
    if (!lookupId.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const data = await freelancerGet(`/disputes/${lookupId.trim()}`);
      setLookedUp(data);
    } catch (err) {
      setLookedUp(null);
      setError(errorMessage(err, t(lang, 'تعذر جلب النزاع', 'Failed to fetch dispute')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="البلاغات والنزاعات"
        titleEn="Reports & Disputes"
        subAr="إنشاء نزاع أو جلب نزاع برقمّه. لا توجد واجهة قائمة للمستقل حالياً."
        subEn="Create a dispute or fetch one by ID. No freelancer list endpoint exists."
        action={
          <button className="primary" type="button" onClick={() => setOpen(true)}>
            <Plus size={15} />
            {t(lang, 'فتح نزاع', 'Open dispute')}
          </button>
        }
      />

      <Card>
        <p className="notice amber">
          {t(
            lang,
            'لا يوجد GET /api/disputes (قائمة). يمكن الإنشاء وجلب النزاع بالمعرّف فقط.',
            'There is no GET /api/disputes collection. Create and fetch-by-id only.',
          )}
        </p>
        <div className="form-grid">
          <label>
            {t(lang, 'رقم النزاع', 'Dispute ID')}
            <input value={lookupId} onChange={(e) => setLookupId(e.target.value)} />
          </label>
          <button className="primary" type="button" disabled={busy} onClick={lookup}>
            {t(lang, 'جلب', 'Fetch')}
          </button>
        </div>
        {error && <p className="notice amber">{error}</p>}
        {lookedUp && (
          <div className="review">
            <div className="review-head">
              <b>#{lookedUp.id}</b>
              <Status lang={lang} type={lookedUp.status} />
            </div>
            <p>{lookedUp.description}</p>
            <small>
              {lookedUp.issue_type} · project #{lookedUp.project_id}
            </small>
          </div>
        )}
      </Card>

      {created.length === 0 && !lookedUp ? (
        <Empty
          lang={lang}
          titleAr="لا قائمة نزاعات"
          titleEn="No dispute list"
          bodyAr="افتح نزاعاً جديداً أو اجلب نزاعاً بالمعرّف."
          bodyEn="Open a new dispute or fetch one by ID."
        />
      ) : (
        created.length > 0 && (
          <Card>
            <div className="card-head">
              <div>
                <h3>{t(lang, 'نزاعات أُنشئت في هذه الجلسة', 'Created this session')}</h3>
                <p>
                  {t(
                    lang,
                    'ليست قائمة دائمة من الخادم',
                    'Not a persistent server-side list',
                  )}
                </p>
              </div>
            </div>
            {created.map((d) => (
              <div className="review" key={d.id}>
                <div className="review-head">
                  <b>#{d.id}</b>
                  <Status lang={lang} type={d.status} />
                </div>
                <p>{d.description}</p>
              </div>
            ))}
          </Card>
        )
      )}

      {open && (
        <Modal
          lang={lang}
          titleAr="فتح نزاع"
          titleEn="Open dispute"
          onClose={() => !busy && setOpen(false)}
        >
          <div className="form-grid">
            <label>
              {t(lang, 'المشروع', 'Project')}
              <select name="project_id" value={form.project_id} onChange={handleChange}>
                <option value="">{t(lang, 'اختر مشروعاً من عقودك', 'Select from your contracts')}</option>
                {contracts.map((c) => (
                  <option key={c.id} value={c.project_id}>
                    Project #{c.project_id} (Contract #{c.id})
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t(lang, 'نوع المشكلة', 'Issue type')}
              <select name="issue_type" value={form.issue_type} onChange={handleChange}>
                <option>Payment issue</option>
                <option>Delivery delay</option>
                <option>Service scope</option>
                <option>Other</option>
              </select>
            </label>
            <label className="full">
              {t(lang, 'الوصف', 'Description')}
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="modal-actions">
            <button className="ghost" type="button" disabled={busy} onClick={() => setOpen(false)}>
              {t(lang, 'إلغاء', 'Cancel')}
            </button>
            <button className="primary" type="button" disabled={busy} onClick={submitDispute}>
              {busy
                ? t(lang, 'جاري الإرسال...', 'Submitting...')
                : t(lang, 'إرسال', 'Submit')}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
