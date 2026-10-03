import React, { useEffect, useState } from 'react';
import { Paperclip, Plus } from 'lucide-react';
import { t } from '../freelance-i18n';
import { Card, Empty, Modal, PageHeader, Status } from '../components/freelance-UI';
import {
  errorMessage,
  freelancerGet,
  freelancerPost,
  freelancerUpload,
  getStoredUser,
} from '../api';

const ISSUE_TYPES = [
  ['payment', 'مشكلة في الدفع', 'Payment issue'],
  ['delay', 'تأخر في الرد أو المراجعة', 'Delay'],
  ['scope_breach', 'طلبات خارج نطاق العقد', 'Scope breach'],
  ['communication', 'انقطاع التواصل مع العميل', 'Client unresponsive'],
  ['quality', 'خلاف على جودة العمل', 'Quality disagreement'],
  ['other', 'أخرى', 'Other'],
];

const issueLabel = (lang, value) => {
  const match = ISSUE_TYPES.find(([key]) => key === value);
  return match ? t(lang, match[1], match[2]) : value || '—';
};

const EMPTY_FORM = { project_id: '', issue_type: 'payment', description: '' };

export default function Disputes({ lang, notify }) {
  const user = getStoredUser();
  const [open, setOpen] = useState(false);
  const [disputes, setDisputes] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [evidence, setEvidence] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [disputeData, contractData] = await Promise.all([
        freelancerGet('/disputes'),
        freelancerGet('/contracts'),
      ]);
      setDisputes(Array.isArray(disputeData) ? disputeData : []);
      setContracts(Array.isArray(contractData) ? contractData : []);
    } catch (err) {
      setError(errorMessage(err, t(lang, 'تعذر تحميل النزاعات', 'Failed to load disputes')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const uploadEvidence = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const uploaded = await freelancerUpload('/uploads', file);
        setEvidence((prev) => [...prev, { name: uploaded.file_name, url: uploaded.file_url }]);
      }
    } catch (err) {
      notify(errorMessage(err, t(lang, 'تعذر رفع الملف', 'Failed to upload file')));
    } finally {
      setUploading(false);
    }
  };

  const submitDispute = async () => {
    if (busy || uploading) return;
    if (!form.project_id || !form.description.trim()) {
      notify(t(lang, 'يرجى اختيار المشروع ووصف المشكلة', 'Please select a project and describe the issue'));
      return;
    }
    const contract = contracts.find((c) => String(c.project_id) === String(form.project_id));
    setBusy(true);
    try {
      const payload = {
        project_id: Number(form.project_id),
        issue_type: form.issue_type,
        description: form.description.trim(),
        ...(evidence.length ? { evidence_attachments: evidence.map((item) => item.url) } : {}),
      };
      if (contract?.client_id != null) {
        try {
          const client = await freelancerGet(`/clients/${contract.client_id}`);
          if (client?.user_id != null) {
            payload.reported_against = Number(client.user_id);
          }
        } catch {
          // reported_against is optional
        }
      }
      await freelancerPost('/disputes', payload);
      setOpen(false);
      setForm(EMPTY_FORM);
      setEvidence([]);
      notify(t(lang, 'تم فتح النزاع', 'Dispute opened'));
      load();
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل فتح النزاع', 'Failed to open dispute')));
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
        subAr="النزاعات المرتبطة بمشاريعك وقرارات فريق الإدارة."
        subEn="Disputes on your projects and decisions from the admin team."
        action={
          <button className="primary" type="button" onClick={() => setOpen(true)}>
            <Plus size={15} />
            {t(lang, 'فتح نزاع', 'Open dispute')}
          </button>
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

      {!loading && !error && disputes.length === 0 && (
        <Empty
          lang={lang}
          titleAr="لا توجد نزاعات"
          titleEn="No disputes"
          bodyAr="لم يتم فتح أي نزاع على مشاريعك."
          bodyEn="No disputes have been opened on your projects."
        />
      )}

      {!loading && !error && disputes.length > 0 && (
        <Card>
          {disputes.map((d) => (
            <div className="review" key={d.id}>
              <div className="review-head">
                <b>
                  DSP-{d.id} · {d.project_title || `${t(lang, 'مشروع', 'Project')} #${d.project_id}`}
                </b>
                <Status lang={lang} type={d.status || 'under_review'} />
              </div>
              <p>{d.description}</p>
              <small>
                {issueLabel(lang, d.issue_type)}
                {' · '}
                {String(d.reported_by) === String(user?.id)
                  ? t(lang, 'مقدم منك', 'Filed by you')
                  : `${t(lang, 'مقدم من', 'Filed by')} ${d.reported_by_name || '—'}`}
                {d.created_at ? ` · ${String(d.created_at).slice(0, 10)}` : ''}
              </small>
              {Array.isArray(d.evidence_attachments) && d.evidence_attachments.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                  {d.evidence_attachments.map((url, i) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer">
                      <Paperclip size={12} /> {t(lang, `دليل ${i + 1}`, `Evidence ${i + 1}`)}
                    </a>
                  ))}
                </div>
              )}
              {d.action_taken && (
                <p className="notice">
                  <b>{t(lang, 'قرار الإدارة: ', 'Admin decision: ')}</b>
                  {d.action_taken}
                </p>
              )}
            </div>
          ))}
        </Card>
      )}

      {open && (
        <Modal lang={lang} titleAr="فتح نزاع" titleEn="Open dispute" onClose={() => !busy && setOpen(false)}>
          <div className="form-grid">
            <label>
              {t(lang, 'المشروع', 'Project')}
              <select name="project_id" value={form.project_id} onChange={handleChange}>
                <option value="">{t(lang, 'اختر مشروعاً من عقودك', 'Select from your contracts')}</option>
                {contracts.map((c) => (
                  <option key={c.id} value={c.project_id}>
                    {c.project_title || `Project #${c.project_id}`} ({t(lang, 'عقد', 'Contract')} #{c.id})
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t(lang, 'نوع المشكلة', 'Issue type')}
              <select name="issue_type" value={form.issue_type} onChange={handleChange}>
                {ISSUE_TYPES.map(([value, ar, en]) => (
                  <option key={value} value={value}>
                    {t(lang, ar, en)}
                  </option>
                ))}
              </select>
            </label>
            <label className="full">
              {t(lang, 'الوصف', 'Description')}
              <textarea name="description" value={form.description} onChange={handleChange} />
            </label>
            <label className="full">
              {t(lang, 'مرفقات وأدلة (اختياري)', 'Evidence (optional)')}
              <input type="file" multiple accept="image/*,application/pdf" disabled={uploading} onChange={uploadEvidence} />
            </label>
            {evidence.length > 0 && (
              <div className="full">
                {evidence.map((item) => (
                  <div className="toggle-row" key={item.url}>
                    <small>{item.name}</small>
                    <button
                      className="icon-btn"
                      type="button"
                      onClick={() => setEvidence((prev) => prev.filter((e) => e.url !== item.url))}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-actions">
            <button className="ghost" type="button" disabled={busy} onClick={() => setOpen(false)}>
              {t(lang, 'إلغاء', 'Cancel')}
            </button>
            <button className="primary" type="button" disabled={busy || uploading} onClick={submitDispute}>
              {busy ? t(lang, 'جاري الإرسال...', 'Submitting...') : t(lang, 'إرسال', 'Submit')}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
