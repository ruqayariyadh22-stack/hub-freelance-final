import React, { useRef, useState } from 'react';
import {
  Check,
  FileText,
  MessageCircle,
  Plus,
  Upload,
} from 'lucide-react';
import { t } from '../freelance-i18n';
import { img } from '../freelance-data';
import { Card, PageHeader, Status } from '../components/freelance-UI';
export default function Workspace({ lang, notify }) {
  const [tab, setTab] = useState('tasks');
  const [checks, setChecks] = useState([0]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestones, setMilestones] = useState([
    {
      ar: 'بحث المستخدم والمخططات الهيكلية (Wireframes)',
      en: 'User research & wireframes',
      date: '2026-09-15',
    },
    {
      ar: 'تصميم الواجهات عالية الدقة (High-Fidelity)',
      en: 'High-fidelity interface design',
      date: '2026-09-22',
    },
    {
      ar: 'النماذج التفاعلية ونظام التصميم النهائي',
      en: 'Interactive prototype & final design system',
      date: '2026-09-28',
    },
  ]);
  const [newMilestone, setNewMilestone] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [showScopeForm, setShowScopeForm] = useState(false);
  const [selectedScope, setSelectedScope] = useState(null);
  const [scopeRequests, setScopeRequests] = useState([
    {
      id: 1,
      ar: 'إضافة شاشة تقارير للمدير',
      en: 'Add an executive reports screen',
      price: '120',
      days: '3',
      descriptionAr:
        'إضافة شاشة جديدة خاصة بالتقارير والإحصائيات للمدير مع عرض البيانات بشكل واضح.',
      descriptionEn:
        'Add a new executive reports screen with clear statistics and data presentation.',
      status: 'pending',
    },
  ]);
  const [scopeTitle, setScopeTitle] = useState('');
  const [scopePrice, setScopePrice] = useState('');
  const [scopeDays, setScopeDays] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const fileInputRef = useRef(null);
  const [deliveryFiles, setDeliveryFiles] = useState([
    {
      id: 1,
      name: 'UI-v2.fig',
      size: '24 MB',
      status: 'inprogress',
      date: '2026-09-20',
    },
    {
      id: 2,
      name: 'Design-System.pdf',
      size: '2.8 MB',
      status: 'completed',
      date: '2026-09-21',
    },
    {
      id: 3,
      name: 'prototype-link.txt',
      size: '2.8 MB',
      status: 'completed',
      date: '2026-09-22',
    },
  ]);
  const tabs = [
    ['tasks', 'المهام ومراحل التنفيذ', 'Tasks & Stages'],
    ['chat', 'المحادثة المباشرة', 'Direct Chat'],
    ['scope', 'تعديلات النطاق', 'Scope Changes'],
    ['files', 'ملفات التسليم', 'Delivery Files'],
  ];
  const addMilestone = () => {
    if (!newMilestone.trim() || !newMilestoneDate) {
      notify(
        t(
          lang,
          'يرجى إكمال جميع الحقول',
          'Please complete all fields'
        )
      );
      return;
    }
    setMilestones((prev) => [
      ...prev,
      {
        ar: newMilestone,
        en: newMilestone,
        date: newMilestoneDate,
      },
    ]);
    setNewMilestone('');
    setNewMilestoneDate('');
    setShowMilestone(false);
    notify(
      t(
        lang,
        'تمت إضافة المرحلة بنجاح',
        'Milestone added successfully'
      )
    );
  };
  const addScopeRequest = () => {
    if (
      !scopeTitle.trim() ||
      !scopePrice.trim() ||
      !scopeDays.trim() ||
      !scopeDescription.trim()
    ) {
      notify(
        t(
          lang,
          'يرجى إكمال جميع الحقول',
          'Please complete all fields'
        )
      );
      return;
    }
    const newRequest = {
      id: Date.now(),
      ar: scopeTitle,
      en: scopeTitle,
      price: scopePrice,
      days: scopeDays,
      descriptionAr: scopeDescription,
      descriptionEn: scopeDescription,
      status: 'pending',
    };
    setScopeRequests((prev) => [...prev, newRequest]);
    setScopeTitle('');
    setScopePrice('');
    setScopeDays('');
    setScopeDescription('');
    setShowScopeForm(false);
    notify(
      t(
        lang,
        'تم إرسال طلب تعديل النطاق بنجاح',
        'Scope change request submitted successfully'
      )
    );
  };
  const closeScopeForm = () => {
    setScopeTitle('');
    setScopePrice('');
    setScopeDays('');
    setScopeDescription('');
    setShowScopeForm(false);
  };
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size:
        file.size >= 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`,
      status: 'inprogress',
      date: new Date().toISOString().slice(0, 10),
    }));
    setDeliveryFiles((prev) => [...prev, ...newFiles]);
    notify(
      t(
        lang,
        files.length === 1
          ? 'تم رفع الملف بنجاح'
          : 'تم رفع الملفات بنجاح',
        files.length === 1
          ? 'File uploaded successfully'
          : 'Files uploaded successfully'
      )
    );
    event.target.value = '';
  };
  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="مساحة العمل والعقود"
        titleEn="Workspace & Contracts"
        subAr="تابع المهام والمحادثة وملفات التسليم وتعديلات النطاق من داخل العقد."
        subEn="Manage tasks, chat, delivery files, and scope changes inside the contract."
        action={
          <span className="status green">
            <span className="dot" />
            Escrow Protected
          </span>
        }
      />
      <Card className="contract-hero">
        <div className="client">
          <img src={img.clientA} />
          <div>
            <span className="badge-soft blue">ORD-102</span>
            <h2>
              {t(
                lang,
                'تصميم تجربة مستخدم لتطبيق إدارة العقارات',
                'Property management app UX/freelance-UI'
              )}
            </h2>
            <small>
              Maryam Al-Saleh · Senior Product Designer
            </small>
          </div>
        </div>
        <div className="hero-stats">
          <div>
            <span>{t(lang, 'قيمة العقد', 'Contract value')}</span>
            <b>$700</b>
          </div>
          <div>
            <span>{t(lang, 'المحجوز بالضمان', 'In escrow')}</span>
            <b className="green-text">$700</b>
          </div>
          <div>
            <span>{t(lang, 'موعد التسليم', 'Due date')}</span>
            <b>2026-09-28</b>
          </div>
          <div>
            <span>{t(lang, 'الحالة', 'Status')}</span>
            <Status lang={lang} type="inprogress" />
          </div>
        </div>
      </Card>
      <div className="workspace-tabs">
        {tabs.map(([k, ar, en]) => (
          <button
            key={k}
            className={tab === k ? 'active' : ''}
            onClick={() => setTab(k)}
          >
            {t(lang, ar, en)}
          </button>
        ))}
      </div>
      {tab === 'tasks' && (
        <Card>
          <div className="card-head">
            <div>
              <h3>
                {t(
                  lang,
                  'قائمة المهام ومراحل العقد',
                  'Contract tasks & milestones'
                )}
              </h3>
              <p>
                {t(
                  lang,
                  'تحديث الحالة ينعكس على تقدم العقد',
                  'Progress is reflected in the contract'
                )}
              </p>
            </div>
            <button
              className="ghost"
              onClick={() => setShowMilestone(true)}
            >
              <Plus size={14} />
              {t(lang, 'إضافة مرحلة', 'Add stage')}
            </button>
          </div>
          {milestones.map((x, i) => (
            <label
              className="task"
              key={`${x.en}-${i}`}
            >
              <input
                type="checkbox"
                checked={checks.includes(i)}
                onChange={() =>
                  setChecks((c) =>
                    c.includes(i)
                      ? c.filter((v) => v !== i)
                      : [...c, i]
                  )
                }
              />
              <span className="check-icon">
                <Check size={13} />
              </span>
              <div>
                <b>{t(lang, x.ar, x.en)}</b>
                <small>{x.date}</small>
              </div>
              <Status
                lang={lang}
                type={i === 0 ? 'completed' : 'inprogress'}
              />
            </label>
          ))}
        </Card>
      )}
      {tab === 'chat' && (
        <Card>
          <div className="chat-head">
            <div className="client">
              <img src={img.clientA} />
              <div>
                <b>Maryam Al-Saleh</b>
                <small>
                  {t(lang, 'متصلة الآن', 'Online now')}
                </small>
              </div>
            </div>
            <MessageCircle size={18} />
          </div>
          <div className="chat-box">
            <div className="chat-msg other">
              {t(
                lang,
                'مرحباً عمر، أرسلت لك الملاحظات على النسخة الجديدة.',
                'Hi Omar, I sent feedback on the new version.'
              )}
              <small>10:42</small>
            </div>
            <div className="chat-msg me">
              {t(
                lang,
                'وصلتني، سأحدث الشاشات وأرسل نسخة المراجعة اليوم.',
                'Got it. I’ll update the screens and send the review version today.'
              )}
              <small>10:47</small>
            </div>
            {messages.map((msg, index) => (
              <div
                className="chat-msg me"
                key={index}
              >
                {msg}
                <small>Now</small>
              </div>
            ))}
          </div>
          <div className="chat-input inline">
            <input
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder={t(
                lang,
                'اكتب رسالة...',
                'Write a message...'
              )}
            />
            <button
              className="primary"
              onClick={() => {
                if (!message.trim()) return;
                setMessages((prev) => [
                  ...prev,
                  message,
                ]);
                setMessage('');
              }}
            >
              <MessageCircle size={14} />
            </button>
          </div>
        </Card>
      )}
      {tab === 'scope' && (
        <Card>
          <div className="card-head">
            <div>
              <h3>
                {t(
                  lang,
                  'طلبات تعديل نطاق العمل',
                  'Scope change requests'
                )}
              </h3>
              <p>
                {t(
                  lang,
                  'أي تغيير بالسعر أو المدة يحتاج طلباً موثقاً',
                  'Any price or time change is documented'
                )}
              </p>
            </div>
            <button
              className="primary"
              onClick={() => setShowScopeForm(true)}
            >
              <Plus size={14} />
              {t(
                lang,
                'طلب تعديل جديد',
                'New request'
              )}
            </button>
          </div>
          {scopeRequests.map((request) => (
            <div
              className="scope-item"
              key={request.id}
            >
              <div>
                <b>
                  {t(
                    lang,
                    request.ar,
                    request.en
                  )}
                </b>
                <small>
                  + ${request.price} · +{request.days}{' '}
                  {t(lang, 'أيام', 'days')}
                </small>
              </div>
              <Status
                lang={lang}
                type={request.status}
              />
              <button
                className="ghost"
                onClick={() =>
                  setSelectedScope(request)
                }
              >
                {t(lang, 'التفاصيل', 'Details')}
              </button>
            </div>
          ))}
        </Card>
      )}
      {tab === 'files' && (
        <Card>
          <div className="card-head">
            <div>
              <h3>
                {t(
                  lang,
                  'ملفات التسليم',
                  'Delivery files'
                )}
              </h3>
              <p>
                {t(
                  lang,
                  'سجل زمني للملفات والإصدارات',
                  'Versioned delivery history'
                )}
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <button
                className="primary"
                onClick={openFilePicker}
              >
                <Upload size={14} />
                {t(
                  lang,
                  'رفع ملف',
                  'Upload file'
                )}
              </button>
            </div>
          </div>
          {deliveryFiles.map((file) => (
            <div
              className="file-row"
              key={file.id}
            >
              <div className="file-icon">
                <FileText size={17} />
              </div>
              <div>
                <b>{file.name}</b>
                <small>
                  {file.date} · {file.size}
                </small>
              </div>
              <Status
                lang={lang}
                type={file.status}
              />
            </div>
          ))}
        </Card>
      )}
      {showMilestone && (
        <div className="proposal-overlay">
          <div className="proposal-modal">
            <button
              className="proposal-close"
              onClick={() => {
                setNewMilestone('');
                setNewMilestoneDate('');
                setShowMilestone(false);
              }}
            >
              ×
            </button>
            <h2>
              {t(
                lang,
                'إضافة مرحلة جديدة',
                'Add New Milestone'
              )}
            </h2>
            <p className="proposal-project-title">
              {t(
                lang,
                'أضيفي مرحلة جديدة إلى العقد وحددي موعدها.',
                'Add a new milestone and set its deadline.'
              )}
            </p>
            <div className="proposal-field">
              <label>
                {t(
                  lang,
                  'اسم المرحلة',
                  'Milestone Name'
                )}
              </label>
              <input
                type="text"
                value={newMilestone}
                onChange={(e) =>
                  setNewMilestone(e.target.value)
                }
                placeholder={t(
                  lang,
                  'مثال: مراجعة التصميم النهائي',
                  'Example: Final design review'
                )}
              />
            </div>
            <div className="proposal-field">
              <label>
                {t(
                  lang,
                  'تاريخ التسليم',
                  'Deadline'
                )}
              </label>
              <input
                type="date"
                value={newMilestoneDate}
                onChange={(e) =>
                  setNewMilestoneDate(e.target.value)
                }
              />
            </div>
            <div className="proposal-actions">
              <button
                className="proposal-cancel"
                onClick={() => {
                  setNewMilestone('');
                  setNewMilestoneDate('');
                  setShowMilestone(false);
                }}
              >
                {t(lang, 'إلغاء', 'Cancel')}
              </button>
              <button
                className="primary"
                onClick={addMilestone}
              >
                <Plus size={14} />
                {t(
                  lang,
                  'إضافة المرحلة',
                  'Add Milestone'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showScopeForm && (
        <div className="proposal-overlay">
          <div className="proposal-modal">
            <button
              className="proposal-close"
              onClick={closeScopeForm}
            >
              ×
            </button>
            <h2>
              {t(
                lang,
                'طلب تعديل نطاق العمل',
                'New Scope Change Request'
              )}
            </h2>
            <p className="proposal-project-title">
              {t(
                lang,
                'أضيفي تفاصيل التعديل المطلوب حتى يتمكن العميل من مراجعته.',
                'Add the requested change details so the client can review them.'
              )}
            </p>
            <div className="proposal-field">
              <label>
                {t(
                  lang,
                  'اسم التعديل',
                  'Change title'
                )}
              </label>
              <input
                type="text"
                value={scopeTitle}
                onChange={(e) =>
                  setScopeTitle(e.target.value)
                }
                placeholder={t(
                  lang,
                  'مثال: إضافة صفحة التقارير',
                  'Example: Add reports page'
                )}
              />
            </div>
            <div className="proposal-field">
              <label>
                {t(
                  lang,
                  'السعر الإضافي بالدولار',
                  'Additional price in USD'
                )}
              </label>
              <input
                type="number"
                min="0"
                value={scopePrice}
                onChange={(e) =>
                  setScopePrice(e.target.value)
                }
                placeholder="120"
              />
            </div>
            <div className="proposal-field">
              <label>
                {t(
                  lang,
                  'المدة الإضافية بالأيام',
                  'Additional days'
                )}
              </label>
              <input
                type="number"
                min="1"
                value={scopeDays}
                onChange={(e) =>
                  setScopeDays(e.target.value)
                }
                placeholder="3"
              />
            </div>
            <div className="proposal-field">
              <label>
                {t(
                  lang,
                  'تفاصيل التعديل',
                  'Change details'
                )}
              </label>
              <textarea
                value={scopeDescription}
                onChange={(e) =>
                  setScopeDescription(e.target.value)
                }
                placeholder={t(
                  lang,
                  'اكتبي بالتفصيل ما الذي سيتم إضافته أو تغييره...',
                  'Describe what will be added or changed...'
                )}
              />
            </div>
            <div className="proposal-actions">
              <button
                className="proposal-cancel"
                onClick={closeScopeForm}
              >
                {t(lang, 'إلغاء', 'Cancel')}
              </button>
              <button
                className="primary"
                onClick={addScopeRequest}
              >
                <Plus size={14} />
                {t(
                  lang,
                  'إرسال الطلب',
                  'Submit Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedScope && (
        <div className="proposal-overlay">
          <div className="proposal-modal">
            <button
              className="proposal-close"
              onClick={() =>
                setSelectedScope(null)
              }
            >
              ×
            </button>
            <h2>
              {t(
                lang,
                'تفاصيل تعديل النطاق',
                'Scope Change Details'
              )}
            </h2>
            <p className="proposal-project-title">
              {t(
                lang,
                selectedScope.ar,
                selectedScope.en
              )}
            </p>
            <div className="proposal-field">
              <label>
                {t(
                  lang,
                  'اسم التعديل',
                  'Change title'
                )}
              </label>
              <input
                value={t(
                  lang,
                  selectedScope.ar,
                  selectedScope.en
                )}
                readOnly
              />
            </div>
            <div className="proposal-field">
              <label>
                {t(
                  lang,
                  'السعر الإضافي',
                  'Additional price'
                )}
              </label>
              <input
                value={`$${selectedScope.price}`}
                readOnly
              />
            </div>
            <div className="proposal-field">
              <label>
                {t(
                  lang,
                  'المدة الإضافية',
                  'Additional time'
                )}
              </label>
              <input
                value={`${selectedScope.days} ${t(
                  lang,
                  'أيام',
                  'days'
                )}`}
                readOnly
              />
            </div>
            <div className="proposal-field">
              <label>
                {t(
                  lang,
                  'التفاصيل',
                  'Description'
                )}
              </label>
              <textarea
                value={t(
                  lang,
                  selectedScope.descriptionAr,
                  selectedScope.descriptionEn
                )}
                readOnly
              />
            </div>
            <div className="proposal-actions">
              <button
                className="proposal-cancel"
                onClick={() =>
                  setSelectedScope(null)
                }
              >
                {t(lang, 'إغلاق', 'Close')}
              </button>
              <Status
                lang={lang}
                type={selectedScope.status}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}