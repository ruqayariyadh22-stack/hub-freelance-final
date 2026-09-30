import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminApiError, adminDelete, adminPatch } from '../api';
import useAdminList from '../hooks/useAdminList';
import AdminTablePage from '../components/AdminTablePage';
import { useLanguage } from '../components/LanguageContext';

export default function Users() {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const { items, meta, loading, error, params, setParams, reload } =
    useAdminList('/admin/users');
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
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Type' },
      { key: 'account_status', label: 'Status' },
    ],
    [],
  );

  const runAction = async (fn) => {
    setActionError('');
    try {
      await fn();
      await reload();
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        navigate('/admin', { replace: true });
        return;
      }
      setActionError(err?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminTablePage
      title="Users Management"
      subtitle="Manage clients and freelancers accounts"
      searchPlaceholder="Search users..."
      columns={columns}
      items={items}
      loading={loading}
      error={actionError || error}
      emptyText="No users found"
      search={searchInput}
      onSearchChange={setSearchInput}
      filters={
        <>
          <select
            value={params.role || ''}
            onChange={(e) => setParams((p) => ({ ...p, role: e.target.value, page: 1 }))}
          >
            <option value="">{isArabic ? 'كل الأدوار' : 'All roles'}</option>
            <option value="client">client</option>
            <option value="freelancer">freelancer</option>
            <option value="admin">admin</option>
          </select>
          <select
            value={params.status || ''}
            onChange={(e) => setParams((p) => ({ ...p, status: e.target.value, page: 1 }))}
          >
            <option value="">{isArabic ? 'كل الحالات' : 'All statuses'}</option>
            <option value="active">active</option>
            <option value="disabled">disabled</option>
          </select>
        </>
      }
      page={meta.page}
      totalPages={meta.total_pages}
      total={meta.total}
      onPageChange={(page) => setParams((p) => ({ ...p, page }))}
      renderActions={(item) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="ghost-button"
            disabled={busyId === item.id || item.account_status === 'active'}
            onClick={() => {
              setBusyId(item.id);
              runAction(() => adminPatch(`/admin/users/${item.id}`, { status: 'active' }));
            }}
          >
            {isArabic ? 'تفعيل' : 'Activate'}
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={busyId === item.id || item.account_status === 'disabled'}
            onClick={() => {
              setBusyId(item.id);
              runAction(() => adminPatch(`/admin/users/${item.id}`, { status: 'disabled' }));
            }}
          >
            {isArabic ? 'تعطيل' : 'Disable'}
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={busyId === item.id}
            onClick={() => {
              if (!window.confirm(isArabic ? 'حذف المستخدم؟' : 'Delete user?')) return;
              setBusyId(item.id);
              runAction(() => adminDelete(`/admin/users/${item.id}`));
            }}
          >
            {isArabic ? 'حذف' : 'Delete'}
          </button>
        </div>
      )}
    />
  );
}
