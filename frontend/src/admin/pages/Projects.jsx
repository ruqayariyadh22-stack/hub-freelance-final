import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminApiError, adminDelete, adminPatch } from '../api';
import useAdminList from '../hooks/useAdminList';
import AdminTablePage from '../components/AdminTablePage';
import { useLanguage } from '../components/LanguageContext';

const PROJECT_STATUSES = [
  'draft',
  'open',
  'pending_approval',
  'in_progress',
  'completed',
  'cancelled',
];

export default function Projects() {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const { items, meta, loading, error, params, setParams, reload } =
    useAdminList('/admin/projects');
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
      { key: 'title', label: 'Project' },
      { key: 'client_name', label: 'Client' },
      {
        key: 'budget',
        label: 'Budget',
        render: (item) => `$${item.budget_min ?? 0} - $${item.budget_max ?? 0}`,
      },
      { key: 'status', label: 'Status' },
      { key: 'category', label: 'Category' },
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
      title="Projects Management"
      subtitle="Manage client projects and freelancers"
      searchPlaceholder="Search projects..."
      columns={columns}
      items={items}
      loading={loading}
      error={actionError || error}
      emptyText="No projects found"
      search={searchInput}
      onSearchChange={setSearchInput}
      filters={
        <select
          value={params.status || ''}
          onChange={(e) => setParams((p) => ({ ...p, status: e.target.value, page: 1 }))}
        >
          <option value="">{isArabic ? 'كل الحالات' : 'All statuses'}</option>
          {PROJECT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      }
      page={meta.page}
      totalPages={meta.total_pages}
      total={meta.total}
      onPageChange={(page) => setParams((p) => ({ ...p, page }))}
      renderActions={(item) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <select
            disabled={busyId === item.id}
            value={item.status || ''}
            onChange={(e) => {
              const status = e.target.value;
              setBusyId(item.id);
              runAction(() => adminPatch(`/admin/projects/${item.id}`, { status }));
            }}
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="ghost-button danger"
            disabled={busyId === item.id}
            onClick={() => {
              if (!window.confirm(isArabic ? 'حذف المشروع؟' : 'Delete project?')) return;
              setBusyId(item.id);
              runAction(() => adminDelete(`/admin/projects/${item.id}`));
            }}
          >
            {isArabic ? 'حذف' : 'Delete'}
          </button>
        </div>
      )}
    />
  );
}
