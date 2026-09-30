import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { t } from '../freelance-i18n';
import { services as initialServices } from '../freelance-data';
import { Card, Modal, PageHeader, Status } from '../components/freelance-UI';
export default function Services({ lang, notify }) {
  const [serviceList, setServiceList] = useState(initialServices);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const emptyForm = {
    titleAr: '',
    titleEn: '',
    category: 'Development',
    price: '',
    days: '',
    descriptionAr: '',
    descriptionEn: ''
  };
  const [form, setForm] = useState(emptyForm);
  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (service) => {
    setEditingId(service.id);
    setForm({
      titleAr: service.titleAr,
      titleEn: service.titleEn,
      category: service.category,
      price: service.price,
      days: service.days,
      descriptionAr: service.descriptionAr || '',
      descriptionEn: service.descriptionEn || ''
    });
    setOpen(true);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const saveService = () => {
    if (!form.titleAr || !form.titleEn || !form.price || !form.days) {
      notify(
        t(
          lang,
          'يرجى إكمال الحقول الأساسية',
          'Please complete the required fields'
        )
      );
      return;
    }
    if (editingId) {
      setServiceList(prev =>
        prev.map(service =>
          service.id === editingId
            ? {
                ...service,
                titleAr: form.titleAr,
                titleEn: form.titleEn,
                category: form.category,
                price: form.price,
                days: form.days,
                descriptionAr: form.descriptionAr,
                descriptionEn: form.descriptionEn
              }
            : service
        )
      );
      notify(
        t(
          lang,
          'تم حفظ تعديلات الخدمة',
          'Service changes saved'
        )
      );
    } else {
      const newService = {
        id: `SRV-${String(serviceList.length + 1).padStart(2, '0')}`,
        titleAr: form.titleAr,
        titleEn: form.titleEn,
        category: form.category,
        price: form.price,
        days: form.days,
        status: 'active',
        orders: 0,
        views: 0,
        cover: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=80',
        descriptionAr: form.descriptionAr,
        descriptionEn: form.descriptionEn
      };
      setServiceList(prev => [...prev, newService]);
      notify(
        t(
          lang,
          'تم إنشاء الخدمة محلياً',
          'Service created locally'
        )
      );
    }
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };
  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="خدماتي"
        titleEn="My Services"
        subAr="أدر الخدمات والأسعار ومدة التسليم وحالة الظهور على المنصة."
        subEn="Manage services, pricing, delivery time, and visibility."
        action={
          <button className="primary" onClick={openAdd}>
            <Plus size={15} />
            {t(lang, 'إضافة خدمة', 'Add Service')}
          </button>
        }
      />
      <div className="service-grid">
        {serviceList.map(service => (
          <Card className="service-card" key={service.id}>
            <div
              className="service-thumb"
              style={{
                backgroundImage: `url(${service.cover})`
              }}
            />
            <div className="service-body">
              <div className="between">
                <span className="badge-soft blue">
                  {service.category}
                </span>
                <Status
                  lang={lang}
                  type={service.status}
                />
              </div>
              <h3>
                {t(
                  lang,
                  service.titleAr,
                  service.titleEn
                )}
              </h3>
              <p>
                {t(
                  lang,
                  service.descriptionAr ||
                    'خدمة موثقة مع تسليم منظم وتحديثات واضحة.',
                  service.descriptionEn ||
                    'Verified service with structured delivery and clear updates.'
                )}
              </p>
              <div className="service-stats">
                <span>
                  <strong>{service.price}</strong> starting
                </span>
                <span>
                  <strong>{service.orders}</strong> orders
                </span>
                <span>
                  <strong>{service.views}</strong> views
                </span>
              </div>
              <div className="card-foot">
                <small>{service.days}</small>
                <button
                  className="ghost"
                  onClick={() => openEdit(service)}
                >
                  {t(lang, 'تعديل', 'Edit')}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {open && (
        <Modal
          lang={lang}
          titleAr={
            editingId
              ? 'تعديل الخدمة'
              : 'إضافة خدمة جديدة'
          }
          titleEn={
            editingId
              ? 'Edit Service'
              : 'Create a new service'
          }
          onClose={() => {
            setOpen(false);
            setEditingId(null);
          }}
        >
          <div className="form-grid">
            <label>
              {t(lang, 'عنوان الخدمة بالعربي', 'Arabic service title')}
              <input
                name="titleAr"
                value={form.titleAr}
                onChange={handleChange}
                placeholder="مثال: تطوير متجر إلكتروني"
              />
            </label>
            <label>
              {t(lang, 'عنوان الخدمة بالإنجليزي', 'English service title')}
              <input
                name="titleEn"
                value={form.titleEn}
                onChange={handleChange}
                placeholder="e.g. Build a modern website"
              />
            </label>
            <label>
              {t(lang, 'التصنيف', 'Category')}
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>Development</option>
                <option>Design</option>
                <option>Writing</option>
                <option>Marketing</option>
              </select>
            </label>
            <label>
              {t(lang, 'السعر الابتدائي', 'Starting price')}
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="$350"
              />
            </label>
            <label>
              {t(lang, 'مدة التسليم', 'Delivery time')}
              <input
                name="days"
                value={form.days}
                onChange={handleChange}
                placeholder="7 أيام"
              />
            </label>
            <label>
              {t(lang, 'وصف الخدمة بالعربي', 'Arabic description')}
              <textarea
                name="descriptionAr"
                value={form.descriptionAr}
                onChange={handleChange}
                placeholder="اكتب وصفاً واضحاً للخدمة..."
              />
            </label>
            <label>
              {t(lang, 'وصف الخدمة بالإنجليزي', 'English description')}
              <textarea
                name="descriptionEn"
                value={form.descriptionEn}
                onChange={handleChange}
                placeholder="Describe the service and deliverables..."
              />
            </label>
          </div>
          <div className="modal-actions">
            <button
              className="ghost"
              onClick={() => {
                setOpen(false);
                setEditingId(null);
              }}
            >
              {t(lang, 'إلغاء', 'Cancel')}
            </button>
            <button
              className="primary"
              onClick={saveService}
            >
              {editingId
                ? t(lang, 'حفظ التعديلات', 'Save Changes')
                : t(lang, 'حفظ الخدمة', 'Save service')}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}