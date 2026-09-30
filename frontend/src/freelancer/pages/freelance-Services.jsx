import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { t } from '../freelance-i18n';
import { Card, Empty, Modal, PageHeader, Status } from '../components/freelance-UI';
import {
  errorMessage,
  formatMoney,
  freelancerDelete,
  freelancerGet,
  freelancerPatch,
  freelancerPost,
  getFreelancerProfileId,
} from '../api';

const emptyForm = {
  title: '',
  category: 'Development',
  price: '',
  delivery_time: '',
  description: '',
  status: 'active',
};

export default function Services({ lang, notify }) {
  const profileId = getFreelancerProfileId();
  const [serviceList, setServiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (profileId == null) {
      setError(t(lang, 'تعذر تحديد ملف المستقل', 'Freelancer profile not found'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await freelancerGet(`/freelancers/${profileId}/services`);
      setServiceList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(errorMessage(err, t(lang, 'تعذر تحميل الخدمات', 'Failed to load services')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (service) => {
    setEditingId(service.id);
    setForm({
      title: service.title || '',
      category: service.category || 'Development',
      price: service.price != null ? String(service.price) : '',
      delivery_time: service.delivery_time != null ? String(service.delivery_time) : '',
      description: service.description || '',
      status: service.status || 'active',
    });
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveService = async () => {
    if (saving) return;
    const price = Number(form.price);
    const deliveryTime = Number(form.delivery_time);
    if (!form.title.trim() || !form.description.trim() || !form.category.trim()) {
      notify(t(lang, 'أكمل الحقول المطلوبة', 'Complete required fields'));
      return;
    }
    if (Number.isNaN(price) || price < 0 || !Number.isInteger(deliveryTime) || deliveryTime <= 0) {
      notify(t(lang, 'سعر أو مدة غير صحيحة', 'Invalid price or delivery time'));
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const updated = await freelancerPatch(`/services/${editingId}`, {
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category.trim(),
          price,
          delivery_time: deliveryTime,
          status: form.status,
        });
        setServiceList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        notify(t(lang, 'تم حفظ تعديلات الخدمة', 'Service updated'));
      } else {
        const created = await freelancerPost('/services', {
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category.trim(),
          price,
          delivery_time: deliveryTime,
          status: form.status,
        });
        setServiceList((prev) => [...prev, created]);
        notify(t(lang, 'تم إنشاء الخدمة', 'Service created'));
      }
      setOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل حفظ الخدمة', 'Failed to save service')));
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = async (service) => {
    try {
      const updated = service.is_featured
        ? await freelancerPatch(`/services/${service.id}/unfeature`, {})
        : await freelancerPatch(`/services/${service.id}/feature`, {});
      setServiceList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      notify(
        service.is_featured
          ? t(lang, 'تم إلغاء التمييز', 'Service unfeatured')
          : t(lang, 'تم تمييز الخدمة', 'Service featured'),
      );
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل تحديث التمييز', 'Failed to update featured state')));
    }
  };

  const removeService = async (service) => {
    try {
      await freelancerDelete(`/services/${service.id}`);
      setServiceList((prev) => prev.filter((s) => s.id !== service.id));
      notify(t(lang, 'تم حذف الخدمة', 'Service deleted'));
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل الحذف', 'Failed to delete')));
    }
  };

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="خدماتي"
        titleEn="My Services"
        subAr="أدر الخدمات والأسعار ومدة التسليم وحالة الظهور."
        subEn="Manage services, pricing, delivery time, and visibility."
        action={
          <button className="primary" type="button" onClick={openAdd}>
            <Plus size={15} />
            {t(lang, 'إضافة خدمة', 'Add Service')}
          </button>
        }
      />

      {loading && <Card><p>{t(lang, 'جاري التحميل...', 'Loading...')}</p></Card>}
      {error && (
        <Card>
          <p className="notice amber">{error}</p>
          <button className="primary" type="button" onClick={load}>
            {t(lang, 'إعادة المحاولة', 'Retry')}
          </button>
        </Card>
      )}
      {!loading && !error && serviceList.length === 0 && (
        <Empty
          lang={lang}
          titleAr="لا خدمات"
          titleEn="No services"
          bodyAr="أنشئ خدمتك الأولى."
          bodyEn="Create your first service."
        />
      )}

      <div className="service-grid">
        {serviceList.map((service) => (
          <Card className="service-card" key={service.id}>
            <div className="service-body">
              <div className="between">
                <span className="badge-soft blue">{service.category}</span>
                <Status lang={lang} type={service.status} />
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div className="service-stats">
                <span>
                  <strong>{formatMoney(service.price)}</strong>
                </span>
                <span>
                  <strong>{service.delivery_time}</strong> {t(lang, 'يوم', 'days')}
                </span>
                <span>{service.is_featured ? 'Featured' : '—'}</span>
              </div>
              <div className="card-foot">
                <button className="ghost" type="button" onClick={() => openEdit(service)}>
                  {t(lang, 'تعديل', 'Edit')}
                </button>
                <button className="ghost" type="button" onClick={() => toggleFeature(service)}>
                  {service.is_featured
                    ? t(lang, 'إلغاء التمييز', 'Unfeature')
                    : t(lang, 'تمييز (Pro)', 'Feature (Pro)')}
                </button>
                <button className="ghost" type="button" onClick={() => removeService(service)}>
                  {t(lang, 'حذف', 'Delete')}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {open && (
        <Modal
          lang={lang}
          titleAr={editingId ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
          titleEn={editingId ? 'Edit Service' : 'Create a new service'}
          onClose={() => {
            if (!saving) {
              setOpen(false);
              setEditingId(null);
            }
          }}
        >
          <div className="form-grid">
            <label className="full">
              {t(lang, 'عنوان الخدمة', 'Service title')}
              <input name="title" value={form.title} onChange={handleChange} />
            </label>
            <label>
              {t(lang, 'التصنيف', 'Category')}
              <select name="category" value={form.category} onChange={handleChange}>
                <option>Development</option>
                <option>Design</option>
                <option>Writing</option>
                <option>Marketing</option>
              </select>
            </label>
            <label>
              {t(lang, 'الحالة', 'Status')}
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">active</option>
                <option value="hidden">hidden</option>
              </select>
            </label>
            <label>
              {t(lang, 'السعر', 'Price')}
              <input name="price" type="number" value={form.price} onChange={handleChange} />
            </label>
            <label>
              {t(lang, 'مدة التسليم (أيام)', 'Delivery time (days)')}
              <input
                name="delivery_time"
                type="number"
                value={form.delivery_time}
                onChange={handleChange}
              />
            </label>
            <label className="full">
              {t(lang, 'الوصف', 'Description')}
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="modal-actions">
            <button
              className="ghost"
              type="button"
              disabled={saving}
              onClick={() => {
                setOpen(false);
                setEditingId(null);
              }}
            >
              {t(lang, 'إلغاء', 'Cancel')}
            </button>
            <button className="primary" type="button" disabled={saving} onClick={saveService}>
              {saving
                ? t(lang, 'جاري الحفظ...', 'Saving...')
                : editingId
                  ? t(lang, 'حفظ التعديلات', 'Save Changes')
                  : t(lang, 'حفظ الخدمة', 'Save service')}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
