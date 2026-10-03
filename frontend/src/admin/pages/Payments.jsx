import { useEffect, useMemo, useState } from 'react';
import useAdminList from '../hooks/useAdminList';
import AdminTablePage from '../components/AdminTablePage';
import { useLanguage } from '../components/LanguageContext';

export default function Payments() {
  const { isArabic } = useLanguage();
  const { items, meta, loading, error, params, setParams } =
    useAdminList('/admin/payments');
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
      { key: 'type', label: 'Type' },
      {
        key: 'amount',
        label: 'Amount',
        render: (item) => (item.amount == null ? '—' : `$${item.amount}`),
      },
      {
        key: 'commission',
        label: 'Commission',
        render: (item) => (item.commission == null ? '—' : `$${item.commission}`),
      },
      { key: 'wallet_user_name', label: 'Wallet user' },
      { key: 'wallet_user_role', label: 'Role' },
      { key: 'project_title', label: 'Project' },
      { key: 'contract_id', label: 'Contract' },
    ],
    [],
  );

  return (
    <AdminTablePage
      title="Payments & Commissions"
      subtitle="Monitor payments and platform commissions"
      searchPlaceholder="Search payments..."
      columns={columns}
      items={items}
      loading={loading}
      error={error}
      emptyText="No payments found"
      search={searchInput}
      onSearchChange={setSearchInput}
      filters={
        <select
          value={params.type || ''}
          onChange={(e) => setParams((p) => ({ ...p, type: e.target.value, page: 1 }))}
        >
          <option value="">{isArabic ? 'كل الأنواع' : 'All types'}</option>
          <option value="deposit">deposit</option>
          <option value="escrow">escrow</option>
          <option value="release">release</option>
          <option value="payout">payout</option>
          <option value="withdrawal">withdrawal</option>
        </select>
      }
      page={meta.page}
      totalPages={meta.total_pages}
      total={meta.total}
      onPageChange={(page) => setParams((p) => ({ ...p, page }))}
    />
  );
}
