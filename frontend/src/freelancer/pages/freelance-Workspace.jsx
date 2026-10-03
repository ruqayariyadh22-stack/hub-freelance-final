import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Check, Download, FileText, MessageCircle, Paperclip, Plus } from 'lucide-react';
import { API_ORIGIN } from '../../shared/apiConfig.js';
import { t } from '../freelance-i18n';
import { Card, Empty, PageHeader, Status } from '../components/freelance-UI';
import {
  errorMessage,
  formatMoney,
  freelancerGet,
  freelancerPatch,
  freelancerPost,
  freelancerUpload,
  getStoredUser,
} from '../api';

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const contractLabel = (lang, c) =>
  c.project_title || `${t(lang, 'مشروع', 'Project')} #${c.project_id}`;

export default function Workspace({ lang, notify }) {
  const user = getStoredUser();
  const [contracts, setContracts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState('tasks');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [scopeChanges, setScopeChanges] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showScopeForm, setShowScopeForm] = useState(false);
  const [scopeDescription, setScopeDescription] = useState('');
  const [scopePrice, setScopePrice] = useState('');
  const [scopeDays, setScopeDays] = useState('');
  const [detailError, setDetailError] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryFile, setDeliveryFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const socketRef = useRef(null);
  const chatFileRef = useRef(null);
  const deliveryInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('hub_token');
    if (!token) return undefined;
    const socket = io(API_ORIGIN, { path: '/socket.io', auth: { token } });
    socketRef.current = socket;
    socket.on('message_created', (payload) => {
      if (!payload || payload.id == null) return;
      setMessages((prev) =>
        prev.some((m) => String(m.id) === String(payload.id)) ? prev : [...prev, payload],
      );
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !conversation) return undefined;
    const join = () => socket.emit('join_conversation', { conversationId: Number(conversation.id) });
    if (socket.connected) join();
    socket.on('connect', join);
    return () => {
      socket.off('connect', join);
    };
  }, [conversation?.id]);

  const selected = useMemo(
    () => contracts.find((c) => String(c.id) === String(selectedId)) || null,
    [contracts, selectedId],
  );

  const loadContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await freelancerGet('/contracts');
      const list = Array.isArray(data) ? data : [];
      setContracts(list);
      if (list.length && selectedId == null) {
        setSelectedId(list[0].id);
      }
    } catch (err) {
      setError(errorMessage(err, t(lang, 'تعذر تحميل العقود', 'Failed to load contracts')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContractDetails = async (contract) => {
    if (!contract) return;
    setDetailError(null);
    try {
      const [taskData, scopeData, conversations, attachmentData] = await Promise.all([
        freelancerGet(`/contracts/${contract.id}/tasks`),
        freelancerGet(`/contracts/${contract.id}/scope-changes`),
        freelancerGet('/conversations'),
        freelancerGet(`/contracts/${contract.id}/attachments`),
      ]);
      setTasks(Array.isArray(taskData) ? taskData : []);
      setScopeChanges(Array.isArray(scopeData) ? scopeData : []);
      setAttachments(Array.isArray(attachmentData) ? attachmentData : []);
      const match = (Array.isArray(conversations) ? conversations : []).find(
        (c) => String(c.project_id) === String(contract.project_id),
      );
      setConversation(match || null);
      if (match) {
        const msgs = await freelancerGet(`/conversations/${match.id}/messages`);
        setMessages(Array.isArray(msgs) ? msgs : []);
      } else {
        setMessages([]);
      }
    } catch (err) {
      setDetailError(
        errorMessage(err, t(lang, 'تعذر تحميل تفاصيل العقد', 'Failed to load contract details')),
      );
    }
  };

  useEffect(() => {
    if (selected) {
      loadContractDetails(selected);
    } else {
      setTasks([]);
      setScopeChanges([]);
      setConversation(null);
      setMessages([]);
      setAttachments([]);
    }
  }, [selectedId]);

  const uploadDelivery = async () => {
    if (!selected || !deliveryFile || uploading) return;
    setUploading(true);
    try {
      const created = await freelancerUpload(`/contracts/${selected.id}/attachments`, deliveryFile, {
        note: deliveryNote.trim(),
      });
      setAttachments((prev) => [created, ...prev]);
      setDeliveryFile(null);
      setDeliveryNote('');
      if (deliveryInputRef.current) deliveryInputRef.current.value = '';
      notify(t(lang, 'تم رفع ملف التسليم', 'Delivery file uploaded'));
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل رفع الملف', 'Failed to upload file')));
    } finally {
      setUploading(false);
    }
  };

  const sendChatFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !conversation || uploading) return;
    setUploading(true);
    try {
      const uploaded = await freelancerUpload('/uploads', file);
      const created = await freelancerPost(`/conversations/${conversation.id}/messages`, {
        message: uploaded.file_name,
        attachments: [uploaded.file_url],
      });
      setMessages((prev) =>
        prev.some((m) => String(m.id) === String(created.id)) ? prev : [...prev, created],
      );
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل إرسال الملف', 'Failed to send file')));
    } finally {
      setUploading(false);
    }
  };

  const markDelivered = async () => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      const updated = await freelancerPatch(`/contracts/${selected.id}/status`, {
        status: 'delivered',
      });
      setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      notify(t(lang, 'تم تحديث حالة التسليم', 'Delivery status updated'));
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل تحديث الحالة', 'Failed to update status')));
    } finally {
      setBusy(false);
    }
  };

  const createTask = async () => {
    if (!selected || !newTaskTitle.trim() || busy) return;
    setBusy(true);
    try {
      const created = await freelancerPost(`/contracts/${selected.id}/tasks`, {
        title: newTaskTitle.trim(),
        status: 'todo',
      });
      setTasks((prev) => [...prev, created]);
      setNewTaskTitle('');
      setShowTaskForm(false);
      notify(t(lang, 'تمت إضافة المهمة', 'Task added'));
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل إنشاء المهمة', 'Failed to create task')));
    } finally {
      setBusy(false);
    }
  };

  const toggleTaskDone = async (task) => {
    if (busy) return;
    const nextStatus = task.status === 'completed' || task.status === 'done' ? 'todo' : 'completed';
    setBusy(true);
    try {
      const updated = await freelancerPatch(`/tasks/${task.id}`, { status: nextStatus });
      setTasks((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل تحديث المهمة', 'Failed to update task')));
    } finally {
      setBusy(false);
    }
  };

  const createScope = async () => {
    if (!selected || busy) return;
    if (!scopeDescription.trim()) {
      notify(t(lang, 'الوصف مطلوب', 'Description is required'));
      return;
    }
    setBusy(true);
    try {
      const payload = { description: scopeDescription.trim() };
      if (scopePrice !== '') payload.price_adjustment = Number(scopePrice);
      if (scopeDays !== '') payload.duration_adjustment = Number(scopeDays);
      const created = await freelancerPost(
        `/contracts/${selected.id}/scope-changes`,
        payload,
      );
      setScopeChanges((prev) => [...prev, created]);
      setScopeDescription('');
      setScopePrice('');
      setScopeDays('');
      setShowScopeForm(false);
      notify(t(lang, 'تم إرسال طلب تعديل النطاق', 'Scope change submitted'));
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل طلب النطاق', 'Failed to submit scope change')));
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async () => {
    if (!conversation || !message.trim() || busy) return;
    setBusy(true);
    try {
      const created = await freelancerPost(`/conversations/${conversation.id}/messages`, {
        message: message.trim(),
      });
      setMessages((prev) =>
        prev.some((m) => String(m.id) === String(created.id)) ? prev : [...prev, created],
      );
      setMessage('');
    } catch (err) {
      notify(errorMessage(err, t(lang, 'فشل إرسال الرسالة', 'Failed to send message')));
    } finally {
      setBusy(false);
    }
  };

  const tabs = [
    ['tasks', 'المهام', 'Tasks'],
    ['chat', 'المحادثة', 'Chat'],
    ['scope', 'تعديلات النطاق', 'Scope Changes'],
    ['delivery', 'التسليم', 'Delivery'],
  ];

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="مساحة العمل والعقود"
        titleEn="Workspace & Contracts"
        subAr="العقود والمهام والمحادثة وتعديلات النطاق والتسليم من النظام."
        subEn="Contracts, tasks, chat, scope changes, and delivery from the backend."
      />

      {loading && <Card><p>{t(lang, 'جاري التحميل...', 'Loading...')}</p></Card>}
      {error && (
        <Card>
          <p className="notice amber">{error}</p>
          <button className="primary" type="button" onClick={loadContracts}>
            {t(lang, 'إعادة المحاولة', 'Retry')}
          </button>
        </Card>
      )}

      {!loading && !error && contracts.length === 0 && (
        <Empty
          lang={lang}
          titleAr="لا توجد عقود"
          titleEn="No contracts"
          bodyAr="ستظهر العقود هنا بعد قبول عرضك."
          bodyEn="Contracts appear here after a proposal is accepted."
        />
      )}

      {!loading && !error && contracts.length > 0 && (
        <div className="grid-2-1">
          <Card>
            <div className="card-head">
              <div>
                <h3>{t(lang, 'عقودي', 'My contracts')}</h3>
              </div>
            </div>
            {contracts.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`contract-row ${String(c.id) === String(selectedId) ? 'active' : ''}`}
                onClick={() => setSelectedId(c.id)}
                style={{ width: '100%', textAlign: 'start', background: 'transparent' }}
              >
                <div>
                  <b>{contractLabel(lang, c)}</b>
                  <small>
                    {t(lang, 'عقد', 'Contract')} #{c.id}
                    {c.client_name ? ` · ${c.client_name}` : ''} · {formatMoney(c.contract_value)}
                  </small>
                </div>
                <Status lang={lang} type={c.status} />
              </button>
            ))}
          </Card>

          <Card>
            {!selected ? (
              <p>{t(lang, 'اختر عقداً', 'Select a contract')}</p>
            ) : (
              <>
                <div className="card-head">
                  <div>
                    <h3>{contractLabel(lang, selected)}</h3>
                    <p>
                      {t(lang, 'عقد', 'Contract')} #{selected.id} · {formatMoney(selected.contract_value)}
                    </p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <Status lang={lang} type={selected.status} />
                      <Status lang={lang} type={selected.payment_status} />
                    </div>
                  </div>
                </div>
                {detailError && <p className="notice amber">{detailError}</p>}
                <div className="tabs">
                  {tabs.map(([k, ar, en]) => (
                    <button
                      key={k}
                      type="button"
                      className={tab === k ? 'active' : ''}
                      onClick={() => setTab(k)}
                    >
                      {t(lang, ar, en)}
                    </button>
                  ))}
                </div>

                {tab === 'tasks' && (
                  <div>
                    <div className="card-foot" style={{ marginBottom: 12 }}>
                      <button
                        className="ghost"
                        type="button"
                        onClick={() => setShowTaskForm(true)}
                        disabled={busy}
                      >
                        <Plus size={14} />
                        {t(lang, 'مهمة', 'Task')}
                      </button>
                    </div>
                    {showTaskForm && (
                      <div className="form-grid" style={{ marginBottom: 12 }}>
                        <label className="full">
                          {t(lang, 'عنوان المهمة', 'Task title')}
                          <input
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                          />
                        </label>
                        <button className="primary" type="button" disabled={busy} onClick={createTask}>
                          {t(lang, 'حفظ', 'Save')}
                        </button>
                      </div>
                    )}
                    {tasks.length === 0 && (
                      <p>{t(lang, 'لا مهام بعد', 'No tasks yet')}</p>
                    )}
                    {tasks.map((task) => (
                      <div className="toggle-row" key={task.id}>
                        <div>
                          <b
                            style={
                              task.status === 'completed'
                                ? { textDecoration: 'line-through', opacity: 0.7 }
                                : undefined
                            }
                          >
                            {task.title || `#${task.id}`}
                          </b>
                          <Status lang={lang} type={task.status} />
                        </div>
                        <button
                          className="icon-btn"
                          type="button"
                          disabled={busy}
                          onClick={() => toggleTaskDone(task)}
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'chat' && (
                  <div>
                    {!conversation && (
                      <p className="notice amber">
                        {t(
                          lang,
                          'لا توجد محادثة مرتبطة بهذا المشروع بعد.',
                          'No conversation is linked to this project yet.',
                        )}
                      </p>
                    )}
                    <div className="ai-body" style={{ maxHeight: 280, overflow: 'auto' }}>
                      {messages.map((m) => (
                        <div
                          className={`ai-msg ${m.sender_id === user?.id ? 'user' : 'ai'}`}
                          key={m.id}
                        >
                          <div>
                            <p>{m.message}</p>
                            {Array.isArray(m.attachments) &&
                              m.attachments
                                .filter((url) => typeof url === 'string' && /^https?:\/\//.test(url))
                                .map((url) => (
                                  <a key={url} href={url} target="_blank" rel="noreferrer">
                                    <Paperclip size={12} /> {t(lang, 'فتح المرفق', 'Open attachment')}
                                  </a>
                                ))}
                            <small>
                              {m.created_at ? String(m.created_at).slice(0, 16) : ''}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                    {conversation && (
                      <div className="chat-input" style={{ marginTop: 12 }}>
                        <input ref={chatFileRef} type="file" hidden onChange={sendChatFile} />
                        <button
                          className="icon-btn"
                          type="button"
                          disabled={uploading}
                          title={t(lang, 'إرفاق ملف', 'Attach file')}
                          onClick={() => chatFileRef.current?.click()}
                        >
                          <Paperclip size={15} />
                        </button>
                        <input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={t(lang, 'اكتب رسالة...', 'Write a message...')}
                          disabled={busy}
                        />
                        <button
                          className="primary round"
                          type="button"
                          disabled={busy}
                          onClick={sendMessage}
                        >
                          <MessageCircle size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'scope' && (
                  <div>
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => setShowScopeForm(true)}
                      disabled={busy}
                    >
                      <Plus size={14} />
                      {t(lang, 'طلب تعديل نطاق', 'Request scope change')}
                    </button>
                    {showScopeForm && (
                      <div className="form-grid" style={{ marginTop: 12 }}>
                        <label className="full">
                          {t(lang, 'الوصف', 'Description')}
                          <textarea
                            value={scopeDescription}
                            onChange={(e) => setScopeDescription(e.target.value)}
                          />
                        </label>
                        <label>
                          {t(lang, 'تعديل السعر', 'Price adjustment')}
                          <input
                            type="number"
                            value={scopePrice}
                            onChange={(e) => setScopePrice(e.target.value)}
                          />
                        </label>
                        <label>
                          {t(lang, 'تعديل المدة (أيام)', 'Duration adjustment (days)')}
                          <input
                            type="number"
                            value={scopeDays}
                            onChange={(e) => setScopeDays(e.target.value)}
                          />
                        </label>
                        <button className="primary" type="button" disabled={busy} onClick={createScope}>
                          {t(lang, 'إرسال', 'Submit')}
                        </button>
                      </div>
                    )}
                    {scopeChanges.map((s) => (
                      <div className="review" key={s.id}>
                        <div className="review-head">
                          <b>#{s.id}</b>
                          <Status lang={lang} type={s.status} />
                        </div>
                        <p>{s.description}</p>
                        <small>
                          {s.price_adjustment != null
                            ? `${t(lang, 'سعر', 'Price')}: ${formatMoney(s.price_adjustment)} · `
                            : ''}
                          {s.duration_adjustment != null
                            ? `${t(lang, 'مدة', 'Duration')}: ${s.duration_adjustment}`
                            : ''}
                        </small>
                      </div>
                    ))}
                    {scopeChanges.length === 0 && (
                      <p>{t(lang, 'لا طلبات نطاق', 'No scope changes')}</p>
                    )}
                  </div>
                )}

                {tab === 'delivery' && (
                  <div>
                    <p>
                      {t(
                        lang,
                        'ارفع ملفات التسليم مع ملاحظة للعميل، ثم أكّد التسليم ليتمكن العميل من تحرير الدفعة.',
                        'Upload your delivery files with a note for the client, then mark the contract as delivered so the client can release payment.',
                      )}
                    </p>
                    <div className="form-grid" style={{ marginTop: 12 }}>
                      <label className="full">
                        {t(lang, 'ملف التسليم', 'Delivery file')}
                        <input
                          ref={deliveryInputRef}
                          type="file"
                          disabled={uploading}
                          onChange={(e) => setDeliveryFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      <label className="full">
                        {t(lang, 'ملاحظة للعميل (اختياري)', 'Note for the client (optional)')}
                        <textarea value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)} />
                      </label>
                      <button
                        className="ghost"
                        type="button"
                        disabled={!deliveryFile || uploading}
                        onClick={uploadDelivery}
                      >
                        <Paperclip size={14} />
                        {uploading ? t(lang, 'جاري الرفع...', 'Uploading...') : t(lang, 'رفع الملف', 'Upload file')}
                      </button>
                    </div>

                    <h4 style={{ margin: '16px 0 8px' }}>{t(lang, 'الملفات المرفوعة', 'Uploaded files')}</h4>
                    {attachments.length === 0 && <p>{t(lang, 'لا توجد ملفات بعد', 'No files yet')}</p>}
                    {attachments.map((file) => (
                      <a
                        className="toggle-row"
                        key={file.id}
                        href={file.file_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div>
                          <b>
                            <FileText size={13} /> {file.file_name}
                          </b>
                          <small>
                            {[file.uploaded_by_name, formatBytes(file.size_bytes), String(file.created_at || '').slice(0, 10)]
                              .filter(Boolean)
                              .join(' · ')}
                            {file.note ? ` — ${file.note}` : ''}
                          </small>
                        </div>
                        <Download size={14} />
                      </a>
                    ))}

                    <div className="card-foot" style={{ marginTop: 16 }}>
                      <span>
                        {t(lang, 'الحالة الحالية', 'Current status')}: <Status lang={lang} type={selected.status} />
                      </span>
                      <button
                        className="primary"
                        type="button"
                        disabled={
                          busy ||
                          selected.status === 'delivered' ||
                          selected.status === 'completed' ||
                          selected.status === 'awaiting_escrow'
                        }
                        onClick={markDelivered}
                      >
                        {t(lang, 'تأكيد التسليم', 'Mark as delivered')}
                      </button>
                    </div>
                    {selected.status === 'awaiting_escrow' && (
                      <p className="notice amber">
                        {t(
                          lang,
                          'لا يمكن التسليم قبل أن يموّل العميل الضمان.',
                          'You can deliver once the client has funded escrow.',
                        )}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
