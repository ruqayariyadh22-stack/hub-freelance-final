import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  Paperclip,
  Eye,
  MessageSquare
} from 'lucide-react';
import { DisputeRecord, Contract } from '../../types';

interface DisputesViewProps {
  disputes: DisputeRecord[];
  contracts: Contract[];
  onOpenNewDispute: (disputeData: Omit<DisputeRecord, 'id' | 'disputeNumber' | 'filedAt' | 'status'>) => void;
  isArabic: boolean;
}

export const DisputesView: React.FC<DisputesViewProps> = ({
  disputes,
  contracts,
  onOpenNewDispute,
  isArabic
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(contracts[0]?.id || '');
  const [issueType, setIssueType] = useState<DisputeRecord['issueType']>('delay');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contract = contracts.find((c) => c.id === selectedContractId);
    if (!contract || !description.trim()) return;

    onOpenNewDispute({
      contractId: contract.id,
      projectTitle: contract.projectTitle,
      freelancerName: contract.freelancerName,
      freelancerAvatar: contract.freelancerAvatar,
      issueType,
      description: description.trim(),
      evidenceAttachments: ['agreement_proof.pdf', 'chat_screenshots.png']
    });

    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header matching Screen 8 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {isArabic ? 'البلاغات والنزاعات (Reports & Disputes)' : 'Reports & Disputes'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isArabic
              ? 'إدارة وحل النزاعات البرمجية والعقود برعاية فريق وساطة المنصة والضمان المالي'
              : 'Submit and resolve project disputes backed by platform mediation and escrow protection'}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center gap-2 active:scale-95 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isArabic ? 'فتح بلاغ نزاع جديد' : 'File a Dispute'}</span>
        </button>
      </div>

      {/* Disputes List matching Screen 8 table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50/80 text-slate-400 font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-4 text-start">{isArabic ? 'رقم البلاغ' : 'Dispute ID'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'نوع المشكلة' : 'Issue Type'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'المشروع والمستقل' : 'Project & Freelancer'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'تاريخ التقديم' : 'Date Filed'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 text-end">{isArabic ? 'قرار الوساطة' : 'Resolution'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {disputes.map((disp) => (
                <tr key={disp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {disp.disputeNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-[11px] text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      {disp.issueType === 'delay'
                        ? isArabic ? 'تأخر في التسليم' : 'Delay'
                        : isArabic ? 'جودة غير مطابقة' : 'Quality issue'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-900">{disp.projectTitle}</div>
                    <div className="text-[11px] text-slate-400">{disp.freelancerName}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {disp.filedAt}
                  </td>
                  <td className="py-3.5 px-4">
                    {disp.status === 'resolved' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {isArabic ? 'تم الحل واسترداد الضمان' : 'Resolved'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {isArabic ? 'قيد المراجعة الإدارية' : 'Under Review'}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-end max-w-xs">
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {disp.resolution || (isArabic ? 'بانتظار رد المستقل وفريق الدعم' : 'Awaiting mediation')}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for new dispute */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span>{isArabic ? 'فتح بلاغ نزاع مالي أو فني' : 'Open a Dispute'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isArabic ? 'اختر العقد المرتبط بالبلاغ' : 'Select Contract'}
                </label>
                <select
                  value={selectedContractId}
                  onChange={(e) => setSelectedContractId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                >
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.orderNumber} - {c.projectTitle} ({c.freelancerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isArabic ? 'تصنيف المشكلة' : 'Issue Classification'}
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                >
                  <option value="delay">{isArabic ? 'تأخر غير مبرر عن موعد التسليم' : 'Unjustified Deadline Delay'}</option>
                  <option value="quality">{isArabic ? 'مخرجات غير مطابقة للمواصفات' : 'Quality Does Not Match Scope'}</option>
                  <option value="scope_breach">{isArabic ? 'طلب مبالغ خارج المنصة أو إخلال بالعقد' : 'Policy or Scope Breach'}</option>
                  <option value="communication">{isArabic ? 'انقطاع التواصل مع المستقل' : 'Freelancer Unresponsive'}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isArabic ? 'شرح المشكلة والأسباب بالتفصيل' : 'Details & Explanation'}
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isArabic
                      ? 'يرجى توضيح أوجه الخلاف وما تم الاتفاق عليه والمدة الزمنية...'
                      : 'Please explain the issue and specific breach...'
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none resize-none"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                {isArabic
                  ? 'عند فتح النزاع، يتم تجميد أموال الضمان فوراً، ويتدخل مشرف المنصة لمراجعة ملفات التسليم والمحادثات لاتخاذ قرار ملزم خلال 48 ساعة.'
                  : 'Opening a dispute locks escrow funds while platform mediation reviews chat and deliverables to issue a resolution within 48 hours.'}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20 transition-all"
                >
                  {isArabic ? 'تأكيد وإرسال البلاغ' : 'Submit Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
