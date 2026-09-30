import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';
import { WalletTransaction } from '../../types';

interface WalletViewProps {
  transactions: WalletTransaction[];
  openTopUpModal: () => void;
  isArabic: boolean;
}

export const WalletView: React.FC<WalletViewProps> = ({
  transactions,
  openTopUpModal,
  isArabic
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Balances
  const availableBalance = 4250;
  const escrowLocked = 1850;
  const totalPaid = 6760;

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = filterType === 'all' ? true : tx.type === filterType;
    const matchesSearch =
      tx.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.counterpartyName && tx.counterpartyName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getTypeBadge = (type: WalletTransaction['type']) => {
    switch (type) {
      case 'deposit':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            <ArrowDownLeft className="w-3 h-3 text-blue-600" />
            {isArabic ? 'إيداع رصيد' : 'Deposit'}
          </span>
        );
      case 'escrow_lock':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <ShieldCheck className="w-3 h-3 text-amber-600" />
            {isArabic ? 'حجز ضمان' : 'Escrow Lock'}
          </span>
        );
      case 'release':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
            {isArabic ? 'تحرير دفعة' : 'Paid Out'}
          </span>
        );
      case 'refund':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            {isArabic ? 'استرداد' : 'Refund'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {isArabic ? 'المدفوعات والمحفظة والضمان (Payments & Escrow)' : 'Payments & Escrow'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isArabic
              ? 'إدارة الرصيد المتاح، المبالغ المحجوزة في نظام الضمان Escrow، وسجل العمليات المالية'
              : 'Track financial transactions, escrow deposits, and account balance'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openTopUpModal}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            <span>{isArabic ? '+ شحن الرصيد' : '+ Top-up Balance'}</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards matching Screen 7 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Available Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{isArabic ? 'الرصيد المتاح للاستخدام' : 'Available Balance'}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ${availableBalance.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {isArabic ? 'جاهز لإنشاء عقود جديدة فوراً' : 'Ready for funding new contracts'}
          </div>
        </div>

        {/* Card 2: Escrow Locked */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{isArabic ? 'محجوز في الضمان (Escrow)' : 'Protected in Escrow'}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            ${escrowLocked.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {isArabic ? 'محمي حتى استلام وتسليم العمل' : 'Secured until milestone completion'}
          </div>
        </div>

        {/* Card 3: Paid Out to Freelancers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{isArabic ? 'إجمالي المحول للمستقلين' : 'Paid to Freelancers'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            ${totalPaid.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {isArabic ? 'عن مشاريع تم استلامها بالكامل' : 'For successfully completed projects'}
          </div>
        </div>
      </div>

      {/* Transactions Section matching Screen 7 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            {[
              { id: 'all', label: isArabic ? 'كافة العمليات' : 'All' },
              { id: 'deposit', label: isArabic ? 'الإيداعات' : 'Deposits' },
              { id: 'escrow_lock', label: isArabic ? 'حجوزات الضمان' : 'Escrow Locks' },
              { id: 'release', label: isArabic ? 'المصروفات' : 'Releases' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  filterType === tab.id
                    ? 'bg-[#122338] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isArabic ? 'ابحث في المعاملات...' : 'Search transactions...'}
              className="w-full text-xs bg-slate-50 rounded-xl py-2 ps-9 pe-3 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Transactions Table matching Screen 7 */}
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50/80 text-slate-400 font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-4 text-start">{isArabic ? 'رقم المعاملة' : 'Transaction ID'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'النوع' : 'Type'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'البيان / المشروع / المستقل' : 'Description'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'المبلغ' : 'Amount'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'عمولة المنصة' : 'Platform Fee'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'التاريخ' : 'Date'}</th>
                <th className="py-3 px-4 text-start">{isArabic ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {tx.transactionNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    {getTypeBadge(tx.type)}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-900">{tx.description}</div>
                    {tx.counterpartyName && (
                      <div className="text-[11px] text-slate-400">
                        {isArabic ? `المستقل: ${tx.counterpartyName}` : `Freelancer: ${tx.counterpartyName}`}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    ${tx.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {tx.platformFee > 0 ? `$${tx.platformFee}` : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {tx.date}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {isArabic ? 'مكتملة' : 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
