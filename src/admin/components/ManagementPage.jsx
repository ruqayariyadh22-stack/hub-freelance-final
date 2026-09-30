import { useMemo, useState } from "react";
import { Search, Eye, Pencil, Trash2 } from "lucide-react";
import ManagementModal from "./ManagementModal";
import { useLanguage } from "./LanguageContext";

export default function ManagementPage({
  title,
  subtitle,
  addLabel,
  searchPlaceholder,
  initialData = [],
  columns = [],
  fields = [],
  searchKeys = [],
  emptyText = "No results found",
  extraActions,
}) {
  const { isArabic, t } = useLanguage();

  const [items, setItems] = useState(initialData);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((item) =>
      searchKeys.some((key) =>
        String(item[key] ?? "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [items, search, searchKeys]);

  const openAdd = () => {
    const empty = {};

    fields.forEach((field) => {
      empty[field.key] =
        field.defaultValue ??
        (field.options?.length ? field.options[0] : "");
    });

    setSelected(empty);
    setMode("add");
  };

  const save = () => {
    if (!selected) return;

    if (mode === "add") {
      setItems((current) => [
        ...current,
        {
          ...selected,
          id: Date.now(),
        },
      ]);
    } else {
      setItems((current) =>
        current.map((item) =>
          item.id === selected.id ? selected : item
        )
      );
    }

    setSelected(null);
    setMode(null);
  };

  const remove = (item) => {
    const itemName = item[columns[0]?.key] || "";

    const confirmed = window.confirm(
      isArabic
        ? `هل أنت متأكد من حذف "${itemName}"؟`
        : `Delete "${itemName}"?`
    );

    if (!confirmed) return;

    setItems((current) =>
      current.filter((row) => row.id !== item.id)
    );
  };

  return (
    <main className="main-content">
      <div className="page-header">
        <div>
          <h1>{t(title)}</h1>
          <p>{t(subtitle)}</p>
        </div>

        {addLabel && (
          <button className="primary-button" onClick={openAdd}>
            {t(addLabel)}
          </button>
        )}
      </div>

      <div className="filter-bar">
        <label className="page-search">
          <Search size={16} />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(searchPlaceholder)}
          />
        </label>
      </div>

      <div className="table-card">
        <div className="table-card-head">
          <div>
            <strong>
              {isArabic
                ? "سجلات المنصة"
                : "Platform records"}
            </strong>

            <span>
              {isArabic
                ? "إدارة ومراجعة البيانات من مكان واحد"
                : "Manage and review platform data in one place"}
            </span>
          </div>

          <span className="record-count">
            {filtered.length}{" "}
            {isArabic ? "سجل" : "records"}
          </span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>
                    {t(column.label)}
                  </th>
                ))}

                <th>{t("Actions")}</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render ? (
                        column.render(
                          item[column.key],
                          item
                        )
                      ) : column.badge ? (
                        <span
                          className={`status-badge ${String(
                            item[column.key] ?? ""
                          )
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {t(item[column.key])}
                        </span>
                      ) : column.avatar ? (
                        <div className="table-person">
                          <img
                            src={column.avatar(item)}
                            alt=""
                            referrerPolicy="no-referrer"
                          />

                          <span>
                            {item[column.key]}
                          </span>
                        </div>
                      ) : (
                        item[column.key]
                      )}
                    </td>
                  ))}

                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="icon-action"
                        title={t("View")}
                        onClick={() => {
                          setSelected(item);
                          setMode("view");
                        }}
                      >
                        <Eye size={14} />
                      </button>

                      {extraActions?.map((action) => (
                        <button
                          type="button"
                          className="icon-action"
                          key={action.label}
                          title={t(action.label)}
                          onClick={() =>
                            action.onClick(item)
                          }
                        >
                          {action.icon || action.label}
                        </button>
                      ))}

                      {fields.length > 0 && (
                        <button
                          type="button"
                          className="icon-action"
                          title={t("Edit")}
                          onClick={() => {
                            setSelected(item);
                            setMode("edit");
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                      )}

                      {fields.length > 0 && (
                        <button
                          type="button"
                          className="icon-action danger"
                          title={t("Delete")}
                          onClick={() => remove(item)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="empty-state">
              {t(emptyText)}
            </div>
          )}
        </div>
      </div>

      <div className="results-count">
        {t("Showing")} {filtered.length} {t("of")}{" "}
        {items.length} {t("records")}
      </div>

      {mode && selected && (
        <ManagementModal
          title={title}
          fields={fields}
          data={selected}
          mode={mode}
          onChange={(key, value) =>
            setSelected((current) => ({
              ...current,
              [key]: value,
            }))
          }
          onSave={save}
          onClose={() => {
            setSelected(null);
            setMode(null);
          }}
        />
      )}
    </main>
  );
}