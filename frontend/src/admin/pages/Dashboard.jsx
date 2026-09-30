import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FolderKanban, CreditCard, Flag } from 'lucide-react';
import { AdminApiError, adminGet } from '../api';
import { useLanguage } from '../components/LanguageContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isArabic, t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminGet('/admin/stats');
        if (!cancelled) {
          setStats(data);
          setError('');
        }
      } catch (err) {
        if (err instanceof AdminApiError && err.status === 401) {
          navigate('/admin', { replace: true });
          return;
        }
        if (!cancelled) {
          setError(err?.message || 'Unable to load stats');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const cards = [
    { label: isArabic ? 'المستخدمون' : 'Users', value: stats?.users, icon: Users },
    { label: isArabic ? 'المشاريع' : 'Projects', value: stats?.projects, icon: FolderKanban },
    { label: isArabic ? 'الخدمات' : 'Services', value: stats?.services, icon: FolderKanban },
    { label: isArabic ? 'العقود' : 'Contracts', value: stats?.contracts, icon: CreditCard },
    { label: isArabic ? 'المعاملات' : 'Payments', value: stats?.payments, icon: CreditCard },
    { label: isArabic ? 'الاشتراكات' : 'Subscriptions', value: stats?.subscriptions, icon: CreditCard },
    { label: isArabic ? 'النزاعات' : 'Disputes', value: stats?.disputes, icon: Flag },
    { label: isArabic ? 'التقييمات' : 'Reviews', value: stats?.reviews, icon: Flag },
  ];

  return (
    <main className="main-content">
      <div className="page-header">
        <div>
          <h1>{t('Dashboard')}</h1>
          <p>
            {isArabic
              ? 'نظرة سريعة على أداء Hub Freelance من قاعدة البيانات.'
              : 'A live view of Hub Freelance performance from the database.'}
          </p>
        </div>
      </div>

      {error ? <p style={{ color: '#b91c1c', fontWeight: 700 }}>{error}</p> : null}
      {loading ? <p>{isArabic ? 'جاري التحميل...' : 'Loading...'}</p> : null}

      {!loading && stats ? (
        <>
          <div className="stats-grid">
            {cards.map((card) => (
              <div className="stat-card" key={card.label}>
                <div className="stat-icon">
                  <card.icon size={18} />
                </div>
                <div>
                  <span>{card.label}</span>
                  <strong>{card.value ?? 0}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="stats-grid" style={{ marginTop: 16 }}>
            <div className="stat-card">
              <div>
                <span>{isArabic ? 'إجمالي مبالغ المعاملات' : 'Total transaction amount'}</span>
                <strong>${Number(stats.total_transaction_amount || 0).toFixed(2)}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <span>{isArabic ? 'إجمالي عمولة المنصة' : 'Total platform commission'}</span>
                <strong>${Number(stats.total_commission || 0).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}
