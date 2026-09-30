import { useEffect, useMemo, useState } from 'react';
import useAdminList from '../hooks/useAdminList';
import AdminTablePage from '../components/AdminTablePage';
import { useLanguage } from '../components/LanguageContext';

export default function Orders() {
  const { isArabic } = useLanguage();
  const { items, meta, loading, error, params, setParams } =
    useAdminList('/admin/contracts');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setParams]);

  const columns = useMemo(
    () => [
      { key: 'id', label: 'Contract ID' },
      { key: 'project_title', label: 'Project' },
      { key: 'client_name', label: 'Client' },
      { key: 'freelancer_name', label: 'Freelancer' },
      {
        key: 'contract_value',
        label: 'Value',
        render: (item) => `$${item.contract_value ?? 0}`,
      },
      {
        key: 'commission',
        label: 'Commission',
        render: (item) => (item.commission == null ? '—' : `$${item.commission}`),
      },
      { key: 'status', label: 'Status' },
      { key: 'payment_status', label: 'Payment' },
      { key: 'start_date', label: 'Start' },
      { key: 'delivery_date', label: 'Delivery' },
    ],
    [],
  );

  return (
    <AdminTablePage
      title="Orders & Contracts"
      subtitle="Monitor contracts, values and order progress"
      searchPlaceholder="Search contracts..."
      columns={columns}
      items={items}
      loading={loading}
      error={error}
      emptyText="No contracts found"
      search={searchInput}
      onSearchChange={setSearchInput}
      filters={
        <select
          value={params.status || ''}
          onChange={(e) => setParams((p) => ({ ...p, status: e.target.value, page: 1 }))}
        >
          <option value="">{isArabic ? 'كل الحالات' : 'All statuses'}</option>
          <option value="in_progress">in_progress</option>
          <option value="delivered">delivered</option>
          <option value="completed">completed</option>
        </select>
      }
      page={meta.page}
      totalPages={meta.total_pages}
      total={meta.total}
      onPageChange={(page) => setParams((p) => ({ ...p, page }))}
    />
  );
}
