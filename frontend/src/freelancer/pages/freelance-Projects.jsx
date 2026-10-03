import React, { useEffect, useMemo, useState } from 'react';
import { Clock3, Filter, MailOpen, Send } from 'lucide-react';
import { t } from '../freelance-i18n';
import { Card, Empty, PageHeader, Status } from '../components/freelance-UI';
import {
  errorMessage,
  formatMoney,
  freelancerGet,
  freelancerPatch,
  freelancerPost,
} from '../api';

export default function Projects({ lang, notify }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterBudget, setFilterBudget] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [proposalPrice, setProposalPrice] = useState('');
  const [proposalDuration, setProposalDuration] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [invitations, setInvitations] = useState([]);

  const loadInvitations = async () => {
    try {
      const data = await freelancerGet('/invitations');
      setInvitations(Array.isArray(data) ? data : []);
    } catch {
      setInvitations([]);
    }
  };

  const declineInvitation = async (invitation) => {
    try {
      const updated = await freelancerPatch(`/invitations/${invitation.id}/decline`, {});
      setInvitations((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      notify(t(lang, 'تم رفض الدعوة', 'Invitation declined'));
    } catch (err) {
      notify(errorMessage(err, t(lang, 'تعذر رفض الدعوة', 'Failed to decline invitation')));
    }
  };

  const respondToInvitation = (invitation) => {
    const project = projects.find((p) => String(p.id) === String(invitation.project_id));
    if (project) {
      openProposal(project);
    } else {
      notify(t(lang, 'هذا المشروع لم يعد مفتوحاً', 'This project is no longer open'));
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await freelancerGet('/projects');
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(errorMessage(err, t(lang, 'تعذر تحميل المشاريع', 'Failed to load projects')));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadInvitations();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [projects]);

  const list = useMemo(
    () =>
      projects.filter((p) => {
        const matchesCategory =
          (cat === 'All' || p.category === cat) &&
          (filterCategory === 'All' || p.category === filterCategory);
        const budgetMax = Number(p.budget_max ?? p.budget_min ?? 0);
        const matchesBudget =
          filterBudget === 'All' ||
          (filterBudget === 'under100' && budgetMax < 100) ||
          (filterBudget === '100-500' && budgetMax >= 100 && budgetMax <= 500) ||
          (filterBudget === 'over500' && budgetMax > 500);
        const haystack = `${p.title || ''} ${p.description || ''} ${(p.required_skills || []).join(' ')}`.toLowerCase();
        const matchesSearch = haystack.includes(q.toLowerCase());
        return matchesCategory && matchesBudget && matchesSearch;
      }),
    [projects, q, cat, filterCategory, filterBudget],
  );

  const openProposal = (project) => {
    setSelectedProject(project);
    setProposalPrice('');
    setProposalDuration('');
    setProposalMessage('');
    setSubmitError(null);
  };

  const submitProposal = async () => {
    if (!selectedProject || submitting) return;
    const price = Number(String(proposalPrice).replace(/[^0-9.]/g, ''));
    const duration = Number(String(proposalDuration).replace(/[^0-9]/g, ''));
    if (!price || price <= 0 || !Number.isInteger(duration) || duration <= 0) {
      setSubmitError(
        t(
          lang,
          'أدخل سعراً أكبر من صفر ومدة بعدد أيام صحيحة',
          'Enter a price greater than 0 and a valid duration in days',
        ),
      );
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await freelancerPost(`/projects/${selectedProject.id}/proposals`, {
        proposed_price: price,
        proposed_duration: duration,
        message: proposalMessage.trim() || null,
      });
      notify(t(lang, 'تم إرسال العرض بنجاح', 'Proposal submitted successfully'));
      setSelectedProject(null);
      loadInvitations();
    } catch (err) {
      setSubmitError(errorMessage(err, t(lang, 'فشل إرسال العرض', 'Failed to submit proposal')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="تصفح المشاريع"
        titleEn="Browse Projects"
        subAr="ابحث عن المشاريع المناسبة وأرسل عروضك للعملاء."
        subEn="Find suitable projects and submit proposals to clients."
      />
      {invitations.some((inv) => inv.status === 'pending') && (
        <Card>
          <div className="card-head">
            <div>
              <h3>
                <MailOpen size={16} /> {t(lang, 'دعوات من العملاء', 'Client invitations')}
              </h3>
              <p>{t(lang, 'عملاء دعوك للتقديم على مشاريعهم', 'Clients invited you to send a proposal')}</p>
            </div>
          </div>
          {invitations
            .filter((inv) => inv.status === 'pending')
            .map((inv) => (
              <div className="toggle-row" key={inv.id}>
                <div>
                  <b>{inv.project_title || `#${inv.project_id}`}</b>
                  <small>
                    {inv.client_name ? `${inv.client_name} · ` : ''}
                    {formatMoney(inv.budget_min)} – {formatMoney(inv.budget_max)}
                  </small>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {inv.project_status !== 'open' ? (
                    <Status lang={lang} type={inv.project_status} />
                  ) : (
                    <button className="primary" type="button" onClick={() => respondToInvitation(inv)}>
                      <Send size={13} />
                      {t(lang, 'تقديم عرض', 'Send proposal')}
                    </button>
                  )}
                  <button className="ghost" type="button" onClick={() => declineInvitation(inv)}>
                    {t(lang, 'رفض', 'Decline')}
                  </button>
                </div>
              </div>
            ))}
        </Card>
      )}
      <div className="toolbar">
        <div className="input-search">
          <span>⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(lang, 'ابحث عن مشروع أو مهارة...', 'Search projects or skills...')}
          />
        </div>
        <div className="filters">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={cat === c ? 'selected' : ''}
            >
              {c === 'All' ? t(lang, 'الكل', 'All') : c}
            </button>
          ))}
          <button className="filter-btn" type="button" onClick={() => setShowFilters(true)}>
            <Filter size={14} />
            {t(lang, 'فلاتر', 'Filters')}
          </button>
        </div>
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
          titleAr="لا توجد مشاريع مفتوحة"
          titleEn="No open projects"
          bodyAr="لا توجد مشاريع مفتوحة مطابقة حالياً."
          bodyEn="There are no matching open projects right now."
        />
      )}

      <div className="project-stack">
        {list.map((p) => (
          <Card key={p.id} className="project-card">
            <div className="project-top">
              <div>
                <span className="badge-soft blue">{p.category || '—'}</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </div>
              <div className="project-meta">
                <strong>
                  {formatMoney(p.budget_min)} – {formatMoney(p.budget_max)}
                </strong>
                <span>
                  <Clock3 size={13} />
                  {p.duration != null
                    ? `${p.duration} ${t(lang, 'يوم', 'days')}`
                    : '—'}
                </span>
                <span>{p.status}</span>
              </div>
            </div>
            <div className="tag-row">
              {(p.required_skills || []).map((s) => (
                <span className="tag" key={s}>
                  {s}
                </span>
              ))}
            </div>
            <div className="project-footer">
              <div className="client">
                <div>
                  <b>#{p.id}</b>
                  <small>
                    {t(lang, 'مشروع مفتوح', 'Open project')}
                    {p.published_at ? ` · ${String(p.published_at).slice(0, 10)}` : ''}
                  </small>
                </div>
              </div>
              <div className="project-actions">
                <button className="primary" type="button" onClick={() => openProposal(p)}>
                  <Send size={14} />
                  {t(lang, 'إرسال عرض', 'Submit Proposal')}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showFilters && (
        <div className="proposal-overlay">
          <div className="proposal-modal">
            <button className="proposal-close" type="button" onClick={() => setShowFilters(false)}>
              ×
            </button>
            <h2>{t(lang, 'الفلاتر المتقدمة', 'Advanced Filters')}</h2>
            <div className="proposal-field">
              <label>{t(lang, 'نوع المشروع', 'Project Type')}</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? t(lang, 'الكل', 'All') : c}
                  </option>
                ))}
              </select>
            </div>
            <div className="proposal-field">
              <label>{t(lang, 'الميزانية', 'Budget')}</label>
              <select
                value={filterBudget}
                onChange={(e) => setFilterBudget(e.target.value)}
              >
                <option value="All">{t(lang, 'كل الميزانيات', 'All Budgets')}</option>
                <option value="under100">Under $100</option>
                <option value="100-500">$100 - $500</option>
                <option value="over500">Over $500</option>
              </select>
            </div>
            <div className="proposal-actions">
              <button
                className="proposal-cancel"
                type="button"
                onClick={() => {
                  setFilterCategory('All');
                  setFilterBudget('All');
                  setShowFilters(false);
                }}
              >
                {t(lang, 'إعادة ضبط', 'Reset')}
              </button>
              <button className="primary" type="button" onClick={() => setShowFilters(false)}>
                {t(lang, 'تطبيق الفلاتر', 'Apply Filters')}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProject && (
        <div className="proposal-overlay">
          <div className="proposal-modal">
            <button
              className="proposal-close"
              type="button"
              onClick={() => !submitting && setSelectedProject(null)}
            >
              ×
            </button>
            <h2>{t(lang, 'إرسال عرض للمشروع', 'Submit Proposal')}</h2>
            <p className="proposal-project-title">{selectedProject.title}</p>
            {submitError && <p className="notice amber">{submitError}</p>}
            <div className="proposal-field">
              <label>{t(lang, 'السعر المقترح', 'Your Price')}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={proposalPrice}
                onChange={(e) => setProposalPrice(e.target.value)}
                placeholder="500"
                disabled={submitting}
              />
            </div>
            <div className="proposal-field">
              <label>{t(lang, 'مدة التنفيذ (أيام)', 'Delivery Time (days)')}</label>
              <input
                type="number"
                min="1"
                step="1"
                value={proposalDuration}
                onChange={(e) => setProposalDuration(e.target.value)}
                placeholder="7"
                disabled={submitting}
              />
            </div>
            <div className="proposal-field">
              <label>{t(lang, 'رسالتك للعميل', 'Message to Client')}</label>
              <textarea
                rows="5"
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="proposal-actions">
              <button
                className="proposal-cancel"
                type="button"
                disabled={submitting}
                onClick={() => setSelectedProject(null)}
              >
                {t(lang, 'إلغاء', 'Cancel')}
              </button>
              <button className="primary" type="button" disabled={submitting} onClick={submitProposal}>
                <Send size={14} />
                {submitting
                  ? t(lang, 'جاري الإرسال...', 'Submitting...')
                  : t(lang, 'تأكيد إرسال العرض', 'Submit Proposal')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
