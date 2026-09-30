import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminApiError, adminPatch } from '../api';
import useAdminList from '../hooks/useAdminList';
import AdminTablePage from '../components/AdminTablePage';
import { useLanguage } from '../components/LanguageContext';

export default function Subscriptions() {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const { items, meta, loading, error, params, setParams, reload } =
    useAdminList('/admin/subscriptions');
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setParams]);

  const columns = useMemo(
    () => [
      { key: 'id', label: 'ID' },
      {
        key: 'subscriber',
        label: 'Subscriber',
        render: (item) =>
          item.client_id
            ? `${item.client_name || 'Client'} (Client #${item.client_id})`
            : `${item.freelancer_name || 'Freelancer'} (Freelancer #${item.freelancer_id})`,
      },
      { key: 'plan_type', label: 'Plan' },
      {
        key: 'price',
        label: 'Price',
        render: (item) => (item.price == null ? '—' : String(item.price)),
      },
      { key: 'start_date', label: 'Start' },
      { key: 'end_date', label: 'End' },
      { key: 'status', label: 'Status' },
      { key: 'payment_status', label: 'Payment' },
    ],
    [],
  );

  return (
    <AdminTablePage
      title="Subscriptions"
      subtitle="Manage freelancer and Client AI subscriptions"
      searchPlaceholder="Search subscriptions..."
      columns={columns}
      items={items}
      loading={loading}
      error={actionError || error}
      emptyText="No subscriptions found"
      search={searchInput}
      onSearchChange={setSearchInput}
      filters={
        <>
          <select
            value={params.status || ''}
            onChange={(e) => setParams((p) => ({ ...p, status: e.target.value, page: 1 }))}
          >
            <option value="">{isArabic ? 'كل الحالات' : 'All statuses'}</option>
            <option value="active">active</option>
            <option value="expired">expired</option>
            <option value="cancelled">cancelled</option>
          </select>
          <select
            value={params.plan || ''}
            onChange={(e) => setParams((p) => ({ ...p, plan: e.target.value, page: 1 }))}
          >
            <option value="">{isArabic ? 'كل الخطط' : 'All plans'}</option>
            <option value="Freelancer Pro">Freelancer Pro</option>
            <option value="Client AI">Client AI</option>
          </select>
        </>
      }
      page={meta.page}
      totalPages={meta.total_pages}
      total={meta.total}
      onPageChange={(page) => setParams((p) => ({ ...p, page }))}
      renderActions={(item) => (
        <select
          disabled={busyId === item.id}
          value={item.status || ''}
          onChange={async (e) => {
            const status = e.target.value;
            setBusyId(item.id);
            setActionError('');
            try {
              await adminPatch(`/admin/subscriptions/${item.id}`, { status });
              await reload();
            } catch (err) {
              if (err instanceof AdminApiError && err.status === 401) {
                navigate('/admin', { replace: true });
                return;
              }
              setActionError(err?.message || 'Update failed');
            } finally {
              setBusyId(null);
            }
          }}
        >
          <option value="active">active</option>
          <option value="expired">expired</option>
          <option value="cancelled">cancelled</option>
        </select>
      )}
    />
  );
}
