import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Send,
  Paperclip,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Download,
  Plus,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  Calendar,
  Sparkles,
  MessageSquare,
  ListTodo,
  FileCode,
  Check
} from 'lucide-react';
import { Contract, ScopeChangeRequest, TaskItem, ChatMessage } from '../../types';

interface WorkspaceViewProps {
  contracts: Contract[];
  activeContractId: string | null;
  setActiveContractId: (id: string) => void;
  onApproveScopeChange: (contractId: string, scopeChangeId: string) => void;
  onRejectScopeChange: (contractId: string, scopeChangeId: string) => void;
  onToggleTaskStatus: (contractId: string, taskId: string) => void;
  onAddTask: (contractId: string, task: Omit<TaskItem, 'id' | 'contractId'>) => void;
  onSendMessage: (contractId: string, messageText: string, attachmentName?: string) => void;
  onReleaseEscrow: (contractId: string) => void;
  onOpenDispute: (contractId: string) => void;
  onOpenReviewModal: (contract: Contract) => void;
  isArabic: boolean;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  contracts,
  activeContractId,
  setActiveContractId,
  onApproveScopeChange,
  onRejectScopeChange,
  onToggleTaskStatus,
  onAddTask,
  onSendMessage,
  onReleaseEscrow,
  onOpenDispute,
  onOpenReviewModal,
  isArabic
}) => {
  const currentContract =
    contracts.find((c) => c.id === activeContractId) || contracts[0];

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'tasks' | 'scope_changes' | 'deliverables'>('tasks');
  const [chatInput, setChatInput] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [showAddTaskInput, setShowAddTaskInput] = useState(false);

  if (!currentContract) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
        <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700">
          {isArabic ? 'لا توجد عقود نشطة حالياً' : 'No active contracts found'}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {isArabic ? 'عند قبول أي عرض من عروض المشاريع، ستظهر مساحة العمل هنا.' : 'When you accept a project proposal, its workspace will be active here.'}
        </p>
      </div>
    );
  }

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(currentContract.id, chatInput.trim());
    setChatInput('');
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(currentContract.id, {
      title: newTaskTitle.trim(),
      dueDate: newTaskDueDate || '2026-09-30',
      status: 'todo',
      assignedTo: currentContract.freelancerName
    });
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setShowAddTaskInput(false);
  };

  const pendingScopeChanges = currentContract.scopeChanges.filter((sc) => sc.status === 'pending');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Contract Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {isArabic ? 'مساحة العمل والعقود (Project Workspace)' : 'Project Workspace'}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {isArabic ? 'عقد موثق بالضمان Escrow' : 'Escrow Secured'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isArabic
              ? 'متابعة المهام اللحظية، محادثة المستقل، إدارة تعديلات النطاق، وتحرير المستحقات بعد التسليم'
              : 'Real-time task tracking, messaging, scope changes approval, and milestone release'}
          </p>
        </div>

        {/* Contract Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 shrink-0">
            {isArabic ? 'اختر العقد:' : 'Active Contract:'}
          </label>
          <select
            value={currentContract.id}
            onChange={(e) => setActiveContractId(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow-xs"
          >
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.orderNumber} - {c.freelancerName} ({c.projectTitle.slice(0, 30)}...)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contract Snapshot Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Project & Freelancer info */}
          <div className="flex items-start gap-4">
            <img
              src={currentContract.freelancerAvatar}
              alt={currentContract.freelancerName}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  {currentContract.orderNumber}
                </span>
                <span className="text-xs text-slate-400">
                  {isArabic ? `تاريخ البدء: ${currentContract.startDate}` : `Started: ${currentContract.startDate}`}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                {currentContract.projectTitle}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-semibold text-slate-700">{currentContract.freelancerName}</span>
                <span>•</span>
                <span>{currentContract.freelancerSpecialty}</span>
              </div>
            </div>
          </div>

          {/* Financial & Delivery Metrics */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isArabic ? 'قيمة العقد' : 'Contract Value'}
              </span>
              <span className="text-lg font-black text-slate-900">
                ${currentContract.contractValue}
              </span>
            </div>

            <div className="border-s border-slate-200 ps-4">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                {isArabic ? 'المحجوز بالضمان' : 'Held in Escrow'}
              </span>
              <span className="text-lg font-black text-emerald-600">
                ${currentContract.escrowHeld}
              </span>
            </div>

            <div className="border-s border-slate-200 ps-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isArabic ? 'موعد التسليم' : 'Delivery Date'}
              </span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {currentContract.deliveryDate}
              </span>
            </div>

            <div className="border-s border-slate-200 ps-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isArabic ? 'حالة العمل' : 'Status'}
              </span>
              {currentContract.status === 'delivered' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md mt-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  {isArabic ? 'تم التسليم' : 'Delivered'}
                </span>
              ) : currentContract.status === 'completed' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md mt-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  {isArabic ? 'مكتمل' : 'Completed'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  {isArabic ? 'قيد التنفيذ' : 'In Progress'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Sub-Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'tasks'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>{isArabic ? 'المهام ومراحل التنفيذ' : 'Tasks & Milestones'}</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">
            {currentContract.tasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('scope_changes')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all relative ${
            activeSubTab === 'scope_changes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>{isArabic ? 'طلبات تعديل النطاق (Scope Changes)' : 'Scope Changes'}</span>
          {pendingScopeChanges.length > 0 && (
            <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] animate-pulse">
              {pendingScopeChanges.length} {isArabic ? 'مطلوب الموافقة' : 'Action Required'}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('deliverables')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'deliverables'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>{isArabic ? 'ملفات التسليم والضمان المالي' : 'Deliverables & Escrow Release'}</span>
          {currentContract.status === 'delivered' && (
            <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full text-[10px]">
              {isArabic ? 'جاهز للاستلام' : 'Review'}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('chat')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'chat'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{isArabic ? 'المحادثة المباشرة' : 'Live Chat'}</span>
        </button>
      </div>

      {/* Tab 1: Scope Change Requests (CRITICAL requirement in PDF) */}
      {activeSubTab === 'scope_changes' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 leading-relaxed">
            <span className="font-bold block mb-1">
              {isArabic ? 'آلية طلبات تعديل النطاق (Scope Change Workflow):' : 'Scope Change Process:'}
            </span>
            {isArabic
              ? 'وفقاً لبنية النظام، أي عمل إضافي يطلبه العميل أو يكتشفه المستقل يتم توثيقه هنا كطلب تعديل يدوي مع توضيح فرق السعر والمدة. لا يتم تعديل قيمة العقد أو تمديد موعد التسليم إلا بموافقة العميل الصريحة.'
              : 'Any extra deliverables or out-of-scope requests are formally reviewed here with exact price and schedule adjustment. Escrow balance and delivery dates only update upon client approval.'}
          </div>

          {currentContract.scopeChanges.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              {isArabic ? 'لا توجد طلبات تعديل نطاق حالياً لهذا العقد.' : 'No scope change requests for this contract.'}
            </div>
          ) : (
            currentContract.scopeChanges.map((change) => {
              const isPending = change.status === 'pending';
              const isApproved = change.status === 'approved';
              const isRejected = change.status === 'rejected';

              return (
                <div
                  key={change.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                    isPending
                      ? 'border-amber-300 ring-2 ring-amber-50'
                      : isApproved
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {isArabic ? `طلب تعديل مقدم من: ${change.requestedBy}` : `Requested by: ${change.requestedBy}`}
                        </span>
                        <span className="text-xs text-slate-400">• {change.requestedAt}</span>
                      </div>

                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 max-w-2xl leading-relaxed">
                        {change.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                        <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          <DollarSign className="w-3.5 h-3.5" />
                          {isArabic ? `تعديل السعر: +$${change.priceAdjustment}` : `Price Adjustment: +$${change.priceAdjustment}`}
                        </span>

                        <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                          <Clock className="w-3.5 h-3.5" />
                          {isArabic ? `تمديد المدة: +${change.durationAdjustment} أيام` : `Timeline: +${change.durationAdjustment} days`}
                        </span>

                        <span className="text-xs text-slate-400">
                          {isArabic ? `ملاحظة: ${change.responseNote || 'قيد الدراسة'}` : `Note: ${change.responseNote || 'Under review'}`}
                        </span>
                      </div>
                    </div>

                    {/* Decision Actions */}
                    <div className="shrink-0 flex items-center gap-2">
                      {isPending && (
                        <>
                          <button
                            onClick={() => onApproveScopeChange(currentContract.id, change.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95 transition-all"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'موافقة وتحديث العقد' : 'Approve & Update'}</span>
                          </button>

                          <button
                            onClick={() => onRejectScopeChange(currentContract.id, change.id)}
                            className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'رفض التعديل' : 'Reject'}</span>
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <div className="text-emerald-700 bg-emerald-100 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{isArabic ? 'تمت الموافقة وتحديث الضمان' : 'Approved'}</span>
                        </div>
                      )}

                      {isRejected && (
                        <div className="text-slate-500 bg-slate-100 font-bold text-xs px-3 py-1.5 rounded-xl">
                          {isArabic ? 'تم رفض الطلب' : 'Rejected'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Tasks & Milestones */}
      {activeSubTab === 'tasks' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isArabic ? 'قائمة مهام ومراحل العقد' : 'Contract Tasks & Milestones'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic ? 'متابعة بنود العمل المنجزة وتحديث حالة كل مهمة' : 'Track milestones and deliverables fulfillment'}
              </p>
            </div>

            <button
              onClick={() => setShowAddTaskInput(!showAddTaskInput)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs px-3 py-1.5 rounded-xl border border-blue-200 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isArabic ? 'إضافة مرحلة/مهمة جديدة' : 'Add Milestone'}</span>
            </button>
          </div>

          {/* Add Task Form */}
          {showAddTaskInput && (
            <form onSubmit={handleAddNewTask} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {isArabic ? 'عنوان المهمة أو المرحلة' : 'Milestone Title'}
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder={isArabic ? 'مثال: تسليم واجهات الدفع الإلكتروني...' : 'e.g. Payment gateway integration'}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {isArabic ? 'الموعد المحدد' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskInput(false)}
                  className="text-xs text-slate-500 px-3 py-1 rounded-lg hover:bg-slate-200"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm"
                >
                  {isArabic ? 'حفظ المهمة' : 'Save'}
                </button>
              </div>
            </form>
          )}

          {/* Tasks List */}
          <div className="space-y-2 pt-2">
            {currentContract.tasks.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  onClick={() => onToggleTaskStatus(currentContract.id, task.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isDone
                      ? 'bg-slate-50/70 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200/80 hover:border-blue-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{task.title}</span>
                      {task.description && (
                        <span className="text-[11px] text-slate-400 line-through-none block">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      {task.dueDate}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : task.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isDone ? (isArabic ? 'مكتمل' : 'Done') : task.status === 'in_progress' ? (isArabic ? 'قيد العمل' : 'In Progress') : (isArabic ? 'قيد الانتظار' : 'To Do')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Deliverables & Escrow Release */}
      {activeSubTab === 'deliverables' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isArabic ? 'مخرجات المشروع والتسليم النهائي' : 'Project Deliverables & Escrow'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isArabic
                ? 'مراجعة المخرجات النهائية المرفوعة من قبل المستقل، واعتماد العمل لتحرير الدفعة من حساب الضمان المالي'
                : 'Inspect final deliverables and release funds securely from escrow to the freelancer'}
            </p>
          </div>

          {/* Deliverables Box */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                {isArabic ? 'ملاحظات المستقل عند التسليم:' : 'Freelancer Delivery Notes:'}
              </span>
              <span className="text-[11px] text-slate-400">
                {currentContract.deliverableFiles?.length || 0} {isArabic ? 'ملفات مرفقة' : 'files attached'}
              </span>
            </div>

            <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed">
              {currentContract.deliverableNotes || (isArabic ? 'لم يتم إرفاق ملاحظات تسليم بعد.' : 'No notes yet.')}
            </p>

            {/* Files List */}
            {currentContract.deliverableFiles && currentContract.deliverableFiles.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block">
                  {isArabic ? 'الملفات المرفوعة للتحميل والمعاينة:' : 'Downloadable Assets:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentContract.deliverableFiles.map((file, i) => (
                    <div
                      key={i}
                      className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 truncate">{file}</span>
                      </div>
                      <button
                        onClick={() => alert(isArabic ? `جاري تحميل ${file}` : `Downloading ${file}`)}
                        className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded-lg text-xs"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Approval Bar */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>
                  {isArabic
                    ? `قيمة الضمان الجاهز للتحرير: $${currentContract.escrowHeld}`
                    : `Escrow Ready for Release: $${currentContract.escrowHeld}`}
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-1 max-w-lg">
                {isArabic
                  ? 'بالضغط على اعتماد التسليم، سيتم تحويل المبلغ إلى محفظة المستقل فوراً وإنهاء العقد وإتاحة تقييم المستقل.'
                  : 'Approving the deliverable immediately transfers the funds to the freelancer wallet and marks the project as completed.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentContract.status === 'completed' ? (
                <button
                  onClick={() => onOpenReviewModal(currentContract)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isArabic ? 'تقييم المستقل ★' : 'Rate Freelancer'}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onReleaseEscrow(currentContract.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isArabic ? 'اعتماد العمل وتحرير الدفعة' : 'Approve & Release Funds'}</span>
                  </button>

                  <button
                    onClick={() => onOpenDispute(currentContract.id)}
                    className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-xs px-3 py-2.5 rounded-xl transition-all"
                  >
                    {isArabic ? 'فتح بلاغ / نزاع' : 'Open Dispute'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Live Chat */}
      {activeSubTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[480px]">
          {/* Chat Messages scroll area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {currentContract.messages.map((msg) => {
              const isClient = msg.senderRole === 'client';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 max-w-lg ${
                    isClient ? 'ms-auto flex-row-reverse' : ''
                  }`}
                >
                  {!isClient && (
                    <img
                      src={msg.avatar || currentContract.freelancerAvatar}
                      alt={msg.senderName}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                  )}
                  <div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isClient
                          ? 'bg-blue-600 text-white rounded-te-xs'
                          : 'bg-slate-100 text-slate-800 rounded-ts-xs'
                      }`}
                    >
                      <p>{msg.text}</p>
                      {msg.attachment && (
                        <div
                          className={`mt-2 p-2 rounded-lg flex items-center gap-2 text-[11px] ${
                            isClient ? 'bg-blue-700/60 text-blue-100' : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          <Paperclip className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-semibold truncate">{msg.attachment.name}</span>
                          <span className="text-[10px] opacity-80">({msg.attachment.size})</span>
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[10px] text-slate-400 mt-1 block ${
                        isClient ? 'text-end' : 'text-start'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-200 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSendMessage(currentContract.id, isArabic ? 'مرفق ملف توضيحي جديد' : 'Attached supplementary doc', 'specs_v2.pdf')}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
              title={isArabic ? 'إرفاق ملف' : 'Attach file'}
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isArabic ? 'اكتب رسالتك للمستقل هنا...' : 'Type your message...'}
              className="flex-1 text-xs bg-slate-50 focus:bg-white rounded-xl py-2 px-3 border border-slate-200 focus:border-blue-500 outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
