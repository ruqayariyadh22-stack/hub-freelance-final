import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminApiError, adminGet, buildQuery } from '../api';

export default function useAdminList(path, initialParams = {}) {
  const navigate = useNavigate();
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    search: '',
    ...initialParams,
  });
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminGet(`${path}${buildQuery(params)}`);
      setItems(Array.isArray(data?.items) ? data.items : []);
      setMeta({
        page: data?.page ?? params.page,
        limit: data?.limit ?? params.limit,
        total: data?.total ?? 0,
        total_pages: data?.total_pages ?? 1,
      });
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        navigate('/admin', { replace: true });
        return;
      }
      if (err instanceof AdminApiError && err.status === 403) {
        navigate('/', { replace: true });
        return;
      }
      setItems([]);
      setError(err?.message || 'Unable to load data');
    } finally {
      setLoading(false);
    }
  }, [navigate, params, path]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    meta,
    loading,
    error,
    params,
    setParams,
    reload: load,
  };
}
