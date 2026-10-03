import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminApiError, adminDelete, adminGet, adminPatch } from '../api';
import useAdminList from '../hooks/useAdminList';
import AdminTablePage from '../components/AdminTablePage';
import { useLanguage } from '../components/LanguageContext';

export default function Services() {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const { items, meta, loading, error, params, setParams, reload } =
    useAdminList('/admin/services');
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pendingSpecialties, setPendingSpecialties] = useState([]);
  const [specialtyError, setSpecialtyError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setParams]);

  const loadSpecialties = async () => {
    try {
      const data = await adminGet('/admin/specialties/pending');
      setPendingSpecialties(Array.isArray(data) ? data : []);
      setSpecialtyError('');
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        navigate('/admin', { replace: true });
        return;
      }
      setSpecialtyError(err?.message || 'Unable to load pending specialties');
    }
  };

  useEffect(() => {
    loadSpecialties();
  }, []);

  const columns = useMemo(
    () => [
      { key: 'title', label: 'Service' },
      { key: 'freelancer_name', label: 'Freelancer' },
      { key: 'category', label: 'Category' },
      { key: 'price', label: 'Price' },
      { key: 'delivery_time', label: 'Delivery' },
      { key: 'status', label: 'Status' },
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
    <>
      <AdminTablePage
        title="Services Management"
        subtitle="Manage freelancer services"
        searchPlaceholder="Search services..."
        columns={columns}
        items={items}
        loading={loading}
        error={actionError || error}
        emptyText="No services found"
        search={searchInput}
        onSearchChange={setSearchInput}
        filters={
          <select
            value={params.status || ''}
            onChange={(e) => setParams((p) => ({ ...p, status: e.target.value, page: 1 }))}
          >
            <option value="">{isArabic ? 'كل الحالات' : 'All statuses'}</option>
            <option value="active">active</option>
            <option value="hidden">hidden</option>
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
              disabled={busyId === item.id || item.status === 'active'}
              onClick={() => {
                setBusyId(item.id);
                runAction(() => adminPatch(`/admin/services/${item.id}`, { status: 'active' }));
              }}
            >
              active
            </button>
            <button
              type="button"
              className="ghost-button"
              disabled={busyId === item.id || item.status === 'hidden'}
              onClick={() => {
                setBusyId(item.id);
                runAction(() => adminPatch(`/admin/services/${item.id}`, { status: 'hidden' }));
              }}
            >
              hidden
            </button>
            <button
              type="button"
              className="ghost-button danger"
              disabled={busyId === item.id}
              onClick={() => {
                if (!window.confirm(isArabic ? 'حذف الخدمة؟' : 'Delete service?')) return;
                setBusyId(item.id);
                runAction(() => adminDelete(`/admin/services/${item.id}`));
              }}
            >
              {isArabic ? 'حذف' : 'Delete'}
            </button>
          </div>
        )}
      />

      <main className="main-content" style={{ paddingTop: 0 }}>
        <div className="page-header">
          <div>
            <h2>{isArabic ? 'التخصصات المعلقة' : 'Pending specialties'}</h2>
            <p>{isArabic ? 'موافقة أو رفض طلبات التخصص' : 'Approve or reject specialty requests'}</p>
          </div>
        </div>
        {specialtyError ? <p style={{ color: '#b91c1c' }}>{specialtyError}</p> : null}
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>{isArabic ? 'الاسم' : 'Name'}</th>
                <th>{isArabic ? 'الحالة' : 'Status'}</th>
                <th>{isArabic ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {pendingSpecialties.length === 0 ? (
                <tr>
                  <td colSpan={4}>{isArabic ? 'لا توجد تخصصات معلقة' : 'No pending specialties'}</td>
                </tr>
              ) : (
                pendingSpecialties.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>{row.status}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={async () => {
                          try {
                            await adminPatch(`/admin/specialties/${row.id}/approve`);
                            await loadSpecialties();
                          } catch (err) {
                            setSpecialtyError(err?.message || 'Approve failed');
                          }
                        }}
                      >
                        {isArabic ? 'موافقة' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={async () => {
                          try {
                            await adminPatch(`/admin/specialties/${row.id}/reject`);
                            await loadSpecialties();
                          } catch (err) {
                            setSpecialtyError(err?.message || 'Reject failed');
                          }
                        }}
                      >
                        {isArabic ? 'رفض' : 'Reject'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
