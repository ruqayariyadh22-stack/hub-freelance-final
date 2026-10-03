import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminApiError, adminDelete } from '../api';
import useAdminList from '../hooks/useAdminList';
import AdminTablePage from '../components/AdminTablePage';
import { useLanguage } from '../components/LanguageContext';

export default function Reviews() {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const { items, meta, loading, error, params, setParams, reload } =
    useAdminList('/admin/reviews');
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
      { key: 'reviewer_name', label: 'Reviewer' },
      { key: 'reviewee_name', label: 'Reviewee' },
      { key: 'rating', label: 'Rating' },
      { key: 'comment', label: 'Comment' },
      { key: 'contract_id', label: 'Contract' },
    ],
    [],
  );

  return (
    <AdminTablePage
      title="Reviews & Comments"
      subtitle="Monitor ratings and user comments"
      searchPlaceholder="Search reviews..."
      columns={columns}
      items={items}
      loading={loading}
      error={actionError || error}
      emptyText="No reviews found"
      search={searchInput}
      onSearchChange={setSearchInput}
      page={meta.page}
      totalPages={meta.total_pages}
      total={meta.total}
      onPageChange={(page) => setParams((p) => ({ ...p, page }))}
      renderActions={(item) => (
        <button
          type="button"
          className="ghost-button danger"
          disabled={busyId === item.id}
          onClick={async () => {
            if (!window.confirm(isArabic ? 'حذف التقييم؟' : 'Delete review?')) return;
            setBusyId(item.id);
            setActionError('');
            try {
              await adminDelete(`/admin/reviews/${item.id}`);
              await reload();
            } catch (err) {
              if (err instanceof AdminApiError && err.status === 401) {
                navigate('/admin', { replace: true });
                return;
              }
              setActionError(err?.message || 'Delete failed');
            } finally {
              setBusyId(null);
            }
          }}
        >
          {isArabic ? 'حذف' : 'Delete'}
        </button>
      )}
    />
  );
}
