import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminApiError, adminPatch } from '../api';
import useAdminList from '../hooks/useAdminList';
import AdminTablePage from '../components/AdminTablePage';
import { useLanguage } from '../components/LanguageContext';

export default function Reports() {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const { items, meta, loading, error, params, setParams, reload } =
    useAdminList('/admin/disputes');
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
      { key: 'issue_type', label: 'Type' },
      { key: 'reporter_name', label: 'Reporter' },
      { key: 'reported_against_name', label: 'Against' },
      { key: 'project_title', label: 'Project' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status' },
      { key: 'action_taken', label: 'Action taken' },
    ],
    [],
  );

  return (
    <AdminTablePage
      title="Reports & Disputes"
      subtitle="Manage complaints and reported issues"
      searchPlaceholder="Search disputes..."
      columns={columns}
      items={items}
      loading={loading}
      error={actionError || error}
      emptyText="No disputes found"
      search={searchInput}
      onSearchChange={setSearchInput}
      filters={
        <select
          value={params.status || ''}
          onChange={(e) => setParams((p) => ({ ...p, status: e.target.value, page: 1 }))}
        >
          <option value="">{isArabic ? 'كل الحالات' : 'All statuses'}</option>
          <option value="open">open</option>
          <option value="under_review">under_review</option>
          <option value="resolved">resolved</option>
          <option value="rejected">rejected</option>
        </select>
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
            disabled={busyId === item.id}
            onClick={async () => {
              setBusyId(item.id);
              setActionError('');
              try {
                await adminPatch(`/admin/disputes/${item.id}`, {
                  status: 'under_review',
                  action_taken: 'Marked under review by admin',
                });
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
            {isArabic ? 'مراجعة' : 'Review'}
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={busyId === item.id}
            onClick={async () => {
              setBusyId(item.id);
              setActionError('');
              try {
                await adminPatch(`/admin/disputes/${item.id}`, {
                  status: 'resolved',
                  action_taken: 'Resolved by admin',
                });
                await reload();
              } catch (err) {
                if (err instanceof AdminApiError && err.status === 401) {
                  navigate('/admin', { replace: true });
                  return;
                }
                setActionError(err?.message || 'Resolve failed');
              } finally {
                setBusyId(null);
              }
            }}
          >
            {isArabic ? 'حل' : 'Resolve'}
          </button>
        </div>
      )}
    />
  );
}
