import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BriefcaseBusiness,
  CircleDollarSign,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { t } from '../freelance-i18n';
import { Card, PageHeader, Stat } from '../components/freelance-UI';
import {
  errorMessage,
  formatMoney,
  freelancerGet,
  getFreelancerProfileId,
  getStoredUser,
} from '../api';

export default function Dashboard({ lang }) {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [wallet, setWallet] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsNote, setStatsNote] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const profileId = getFreelancerProfileId();
        const [walletData, contractsData, projectsData] = await Promise.all([
          freelancerGet('/wallet'),
          freelancerGet('/contracts'),
          freelancerGet('/projects'),
        ]);
        if (cancelled) return;
        setWallet(walletData);
        setContracts(Array.isArray(contractsData) ? contractsData : []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);

        if (profileId != null) {
          try {
            const profileData = await freelancerGet(`/freelancers/${profileId}`);
            if (!cancelled) setProfile(profileData);
          } catch {
            if (!cancelled) setProfile(null);
          }
        }

        try {
          const advanced = await freelancerGet('/freelancers/me/statistics');
          if (!cancelled) {
            setStats(advanced);
            setStatsNote(null);
          }
        } catch (err) {
          if (!cancelled) {
            setStats(null);
            setStatsNote(
              err?.status === 403
                ? t(
                    lang,
                    'الإحصاءات المتقدمة متاحة لمشتركي Freelancer Pro.',
                    'Advanced statistics require Freelancer Pro.',
                  )
                : null,
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            errorMessage(err, t(lang, 'تعذر تحميل لوحة التحكم', 'Failed to load dashboard')),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const activeContracts = contracts.filter((c) => c.status === 'in_progress');
  const rating =
    profile?.rating_avg != null ? Number(profile.rating_avg).toFixed(1) : '—';

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="لوحة التحكم"
        titleEn="Freelancer Dashboard"
        subAr="تابع دخلك، مشاريعك، وعقودك من بيانات النظام."
        subEn="Track income, projects, and contracts from live system data."
      />
      {loading && <Card><p>{t(lang, 'جاري التحميل...', 'Loading...')}</p></Card>}
      {error && <Card><p className="notice amber">{error}</p></Card>}
      {!loading && !error && (
        <>
          <div className="stats-grid">
            <Stat
              lang={lang}
              icon={CircleDollarSign}
              labelAr="الرصيد المتاح"
              labelEn="Available Balance"
              value={formatMoney(wallet?.balance)}
            />
            <Stat
              lang={lang}
              icon={ShieldCheck}
              labelAr="المحجوز بالضمان"
              labelEn="In Escrow"
              value={formatMoney(wallet?.escrow_balance)}
              tone="amber"
            />
            <Stat
              lang={lang}
              icon={BriefcaseBusiness}
              labelAr="العقود النشطة"
              labelEn="Active Contracts"
              value={String(activeContracts.length)}
              tone="green"
            />
            <Stat
              lang={lang}
              icon={Star}
              labelAr="متوسط التقييم"
              labelEn="Average Rating"
              value={rating === '—' ? '—' : `${rating} / 5`}
              tone="purple"
            />
          </div>

          {statsNote && <p className="notice amber">{statsNote}</p>}
          {stats && (
            <Card>
              <div className="card-head">
                <div>
                  <h3>{t(lang, 'إحصاءات Pro', 'Pro Statistics')}</h3>
                  <p>{t(lang, 'من اشتراك Freelancer Pro', 'From Freelancer Pro')}</p>
                </div>
              </div>
              <div className="mini-stats">
                <span>
                  {t(lang, 'إجمالي الأرباح', 'Total earnings')}:{' '}
                  {formatMoney(stats.total_earnings)}
                </span>
                <span>
                  {t(lang, 'العقود', 'Contracts')}: {stats.total_contracts}
                </span>
                <span>
                  {t(lang, 'قبول العروض', 'Acceptance')}:{' '}
                  {stats.proposal_acceptance_rate}%
                </span>
              </div>
            </Card>
          )}

          <div className="grid-2">
            <Card>
              <div className="card-head">
                <div>
                  <h3>{t(lang, 'العقود النشطة', 'Active Contracts')}</h3>
                  <p>{t(lang, 'من قاعدة البيانات', 'From the database')}</p>
                </div>
              </div>
              {activeContracts.length === 0 && (
                <p>{t(lang, 'لا توجد عقود نشطة', 'No active contracts')}</p>
              )}
              {activeContracts.slice(0, 5).map((c) => (
                <div className="contract-row" key={c.id}>
                  <div className="avatar-text">
                    <div>
                      <b>
                        {t(lang, 'عقد', 'Contract')} #{c.id}
                      </b>
                      <small>
                        {t(lang, 'مشروع', 'Project')} #{c.project_id}
                      </small>
                    </div>
                  </div>
                  <div>
                    <strong>{formatMoney(c.contract_value)}</strong>
                    <small>{c.status}</small>
                  </div>
                </div>
              ))}
              <button className="link-btn" type="button" onClick={() => navigate('workspace')}>
                {t(lang, 'فتح مساحة العمل', 'Open workspace')} <ArrowLeft size={13} />
              </button>
            </Card>
            <Card>
              <div className="card-head">
                <div>
                  <h3>{t(lang, 'مشاريع مفتوحة', 'Open Projects')}</h3>
                  <p>{t(lang, 'متاحة للتقديم', 'Available to bid')}</p>
                </div>
              </div>
              {projects.slice(0, 3).map((p) => (
                <div className="recommend" key={p.id}>
                  <div className="recommend-main">
                    <b>{p.title}</b>
                    <span>
                      {formatMoney(p.budget_min)} – {formatMoney(p.budget_max)}
                    </span>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <p>{t(lang, 'لا توجد مشاريع مفتوحة', 'No open projects')}</p>
              )}
              <button className="link-btn" type="button" onClick={() => navigate('projects')}>
                {t(lang, 'تصفح المشاريع', 'Browse projects')} <ArrowLeft size={13} />
              </button>
            </Card>
          </div>

          <Card>
            <div className="card-head">
              <div>
                <h3>{t(lang, 'الملف', 'Profile')}</h3>
                <p>{user?.name || '—'}</p>
              </div>
              <button className="link-btn" type="button" onClick={() => navigate('profile')}>
                {t(lang, 'إدارة الملف', 'Manage profile')} <ArrowLeft size={13} />
              </button>
            </div>
          </Card>
        </>
      )}
    </>
  );
}
