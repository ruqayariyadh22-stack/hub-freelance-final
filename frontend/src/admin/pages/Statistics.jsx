import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminApiError, adminGet } from '../api';
import { useLanguage } from '../components/LanguageContext';

export default function Statistics() {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
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
        }
      } catch (err) {
        if (err instanceof AdminApiError && err.status === 401) {
          navigate('/admin', { replace: true });
          return;
        }
        if (!cancelled) setError(err?.message || 'Unable to load statistics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const rows = stats
    ? [
        ['Users', stats.users],
        ['Services', stats.services],
        ['Projects', stats.projects],
        ['Contracts', stats.contracts],
        ['Payments / Transactions', stats.payments],
        ['Subscriptions', stats.subscriptions],
        ['Disputes', stats.disputes],
        ['Reviews', stats.reviews],
        ['Transaction amount', `$${Number(stats.total_transaction_amount || 0).toFixed(2)}`],
        ['Platform commission', `$${Number(stats.total_commission || 0).toFixed(2)}`],
      ]
    : [];

  return (
    <main className="main-content">
      <div className="page-header">
        <div>
          <h1>{isArabic ? 'الإحصائيات' : 'Statistics'}</h1>
          <p>
            {isArabic
              ? 'متابعة أداء المنصة من البيانات الحقيقية.'
              : 'Track platform, users, projects and financial performance from live data.'}
          </p>
        </div>
      </div>

      {error ? <p style={{ color: '#b91c1c', fontWeight: 700 }}>{error}</p> : null}
      {loading ? <p>{isArabic ? 'جاري التحميل...' : 'Loading...'}</p> : null}

      {!loading && stats ? (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>{isArabic ? 'المؤشر' : 'Metric'}</th>
                <th>{isArabic ? 'القيمة' : 'Value'}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
