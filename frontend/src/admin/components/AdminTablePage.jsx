import { Search } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function AdminTablePage({
  title,
  subtitle,
  searchPlaceholder,
  columns,
  items,
  loading,
  error,
  emptyText = 'No results found',
  search,
  onSearchChange,
  filters,
  page,
  totalPages,
  total,
  onPageChange,
  renderActions,
}) {
  const { isArabic, t } = useLanguage();

  return (
    <main className="main-content">
      <div className="page-header">
        <div>
          <h1>{t(title)}</h1>
          <p>{t(subtitle)}</p>
        </div>
      </div>

      <div className="filter-bar" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <label className="page-search">
          <Search size={16} />
          <input
            value={search || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={t(searchPlaceholder)}
          />
        </label>
        {filters}
      </div>

      {error && (
        <p style={{ color: '#b91c1c', fontWeight: 700, marginBottom: 12 }}>
          {error}
        </p>
      )}

      <div className="table-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{t(column.label)}</th>
                ))}
                {renderActions ? <th>{isArabic ? 'إجراءات' : 'Actions'}</th> : null}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (renderActions ? 1 : 0)}>
                    {isArabic ? 'جاري التحميل...' : 'Loading...'}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (renderActions ? 1 : 0)}>
                    {t(emptyText)}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    {columns.map((column) => (
                      <td key={column.key}>
                        {column.render
                          ? column.render(item)
                          : String(item[column.key] ?? '—')}
                      </td>
                    ))}
                    {renderActions ? <td>{renderActions(item)}</td> : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, gap: 8 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {isArabic ? `الإجمالي: ${total ?? 0}` : `Total: ${total ?? 0}`}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="ghost-button"
              disabled={!page || page <= 1 || loading}
              onClick={() => onPageChange?.(page - 1)}
            >
              {isArabic ? 'السابق' : 'Prev'}
            </button>
            <span style={{ fontSize: 12, alignSelf: 'center' }}>
              {page ?? 1} / {totalPages ?? 1}
            </span>
            <button
              type="button"
              className="ghost-button"
              disabled={!totalPages || page >= totalPages || loading}
              onClick={() => onPageChange?.(page + 1)}
            >
              {isArabic ? 'التالي' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
