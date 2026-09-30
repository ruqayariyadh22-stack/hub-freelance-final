import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { t } from '../freelance-i18n';
import {
  Card,
  Modal,
  PageHeader,
  Status
} from '../components/freelance-UI';

export default function Disputes({ lang, notify }) {
  const [open, setOpen] = useState(false);

  const [rows, setRows] = useState([
    [
      'DSP-001',
      'تأخر التسليم',
      'ORD-102',
      '2026-08-15',
      'resolved'
    ],
    [
      'DSP-008',
      'مشكلة دفع',
      'ORD-088',
      '2026-08-10',
      'pending'
    ]
  ]);

  const [form, setForm] = useState({
    issue: 'Payment issue',
    contract: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getIssueArabic = (issue) => {
    if (issue === 'Payment issue') return 'مشكلة دفع';
    if (issue === 'Delivery delay') return 'تأخر التسليم';
    if (issue === 'Service scope') return 'نطاق الخدمة';
    return 'أخرى';
  };

  const getIssueEnglish = (issue) => {
    if (issue === 'Payment issue') return 'Payment issue';
    if (issue === 'Delivery delay') return 'Delivery delay';
    if (issue === 'Service scope') return 'Service scope';
    return 'Other';
  };

  const submitDispute = () => {
    if (!form.contract || !form.description.trim()) {
      notify(
        t(
          lang,
          'يرجى إكمال رقم العقد ووصف المشكلة',
          'Please enter the contract ID and describe the issue'
        )
      );
      return;
    }

    const nextNumber =
      rows.length + 1;

    const newId = `DSP-${String(nextNumber).padStart(3, '0')}`;

    const today = new Date()
      .toISOString()
      .slice(0, 10);

    const newRow = [
      newId,
      lang === 'ar'
        ? getIssueArabic(form.issue)
        : getIssueEnglish(form.issue),
      form.contract,
      today,
      'pending'
    ];

    setRows(prev => [
      newRow,
      ...prev
    ]);

    notify(
      t(
        lang,
        `تم إنشاء البلاغ ${newId} وإضافته للقائمة`,
        `Dispute ${newId} was created and added to the list`
      )
    );

    setForm({
      issue: 'Payment issue',
      contract: '',
      description: ''
    });

    setOpen(false);
  };

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="البلاغات والنزاعات"
        titleEn="Reports & Disputes"
        subAr="إدارة النزاعات المتعلقة بالعقود والمدفوعات وسير المشروع."
        subEn="Manage contract, payment, and project disputes."
        action={
          <button
            className="danger-btn"
            onClick={() => setOpen(true)}
          >
            <Plus size={14} />
            {t(
              lang,
              'فتح بلاغ جديد',
              'Open new dispute'
            )}
          </button>
        }
      />

      <Card>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  {t(lang, 'رقم البلاغ', 'Report')}
                </th>

                <th>
                  {t(lang, 'نوع المشكلة', 'Issue')}
                </th>

                <th>
                  {t(lang, 'المشروع', 'Project')}
                </th>

                <th>
                  {t(lang, 'تاريخ التقديم', 'Date')}
                </th>

                <th>
                  {t(lang, 'الحالة', 'Status')}
                </th>

                <th>
                  {t(lang, 'الإجراء', 'Resolution')}
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row[0]}>
                  <td>
                    <b>{row[0]}</b>
                  </td>

                  <td>{row[1]}</td>

                  <td>{row[2]}</td>

                  <td>{row[3]}</td>

                  <td>
                    <Status
                      lang={lang}
                      type={row[4]}
                    />
                  </td>

                  <td>
                    {row[4] === 'resolved'
                      ? t(
                          lang,
                          'تم الحل وإغلاق البلاغ',
                          'Resolved & closed'
                        )
                      : t(
                          lang,
                          'قيد المراجعة',
                          'Under review'
                        )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <Modal
          lang={lang}
          titleAr="فتح بلاغ جديد"
          titleEn="Open new dispute"
          onClose={() => setOpen(false)}
        >
          <div className="form-grid">

            <label>
              {t(
                lang,
                'نوع المشكلة',
                'Issue type'
              )}

              <select
                name="issue"
                value={form.issue}
                onChange={handleChange}
              >
                <option value="Payment issue">
                  Payment issue
                </option>

                <option value="Delivery delay">
                  Delivery delay
                </option>

                <option value="Service scope">
                  Service scope
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </label>

            <label>
              {t(
                lang,
                'رقم العقد',
                'Contract ID'
              )}

              <input
                name="contract"
                value={form.contract}
                onChange={handleChange}
                placeholder="ORD-102"
              />
            </label>

            <label className="full">
              {t(
                lang,
                'وصف المشكلة',
                'Description'
              )}

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder={t(
                  lang,
                  'اكتب التفاصيل والأدلة المتوفرة...',
                  'Describe the issue and available evidence...'
                )}
              />
            </label>

          </div>

          <div className="modal-actions">
            <button
              className="ghost"
              onClick={() => setOpen(false)}
            >
              {t(lang, 'إلغاء', 'Cancel')}
            </button>

            <button
              className="danger-btn"
              onClick={submitDispute}
            >
              {t(
                lang,
                'إرسال البلاغ',
                'Submit dispute'
              )}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}