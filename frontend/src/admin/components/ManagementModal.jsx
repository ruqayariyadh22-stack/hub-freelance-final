import { X, Save, Eye } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function ManagementModal({
  title, fields, data, mode, onChange, onSave, onClose,
}) {
  const { isArabic, t } = useLanguage();

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal-box" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-kicker"><Eye size={13} /> {mode === "view" ? t("Details") : "Hub Freelance"}</div>
            <h2>{mode === "view" ? `${t(title)} ${t("Details")}` : `${mode === "edit" ? (isArabic ? "تعديل" : "Edit") : (isArabic ? "إضافة" : "Add")} ${t(title)}`}</h2>
            <p>{mode === "view" ? t("View information") : t("Complete the information below")}</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {mode === "view" ? (
          <div className="details-grid">
            {fields.map((field) => (
              <div className="detail-row" key={field.key}>
                <span>{t(field.label)}</span>
                <strong>{translateValue(data[field.key], isArabic)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <form className="form-grid" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
            {fields.map((field) => (
              <label className={field.full ? "full-field" : ""} key={field.key}>
                <span>{t(field.label)}</span>
                {field.type === "select" ? (
                  <select value={data[field.key] ?? ""} onChange={(e) => onChange(field.key, e.target.value)}>
                    {field.options.map((option) => <option key={option} value={option}>{t(option)}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    value={data[field.key] ?? ""}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    required={field.required !== false}
                  />
                )}
              </label>
            ))}
            <div className="modal-actions full-field">
              <button type="button" className="secondary-button" onClick={onClose}>{t("Cancel")}</button>
              <button type="submit" className="primary-button"><Save size={15} />{mode === "add" ? t("Add") : t("Save Changes")}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function translateValue(value, isArabic) {
  const values = {
    Active: "نشط", Inactive: "غير نشط", Blocked: "محظور",
    Pending: "قيد الانتظار", "In Progress": "قيد التنفيذ",
    Completed: "مكتمل", Cancelled: "ملغى", Paid: "مدفوع",
    Refunded: "مُسترد", Expired: "منتهي", Published: "منشور",
    Flagged: "مُبلّغ عنه", "In Review": "قيد المراجعة",
    Resolved: "تم الحل", Transferred: "تم التحويل",
  };
  return isArabic ? values[value] || value : value;
}
