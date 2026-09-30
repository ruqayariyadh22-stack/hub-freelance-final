import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  X,
  DollarSign,
  Building
} from 'lucide-react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopUpSuccess: (amount: number, method: string) => void;
  isArabic: boolean;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  onTopUpSuccess,
  isArabic
}) => {
  const [amount, setAmount] = useState(1000);
  const [method, setMethod] = useState<'card' | 'bank'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      onTopUpSuccess(amount, method === 'card' ? 'Visa / Mastercard' : 'Bank Wire');
      setIsProcessing(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isArabic ? 'شحن رصيد المحفظة (Deposit Funds)' : 'Deposit Funds'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isArabic ? 'إيداع آمن مشفر بنظام الضمان Escrow' : 'Secure escrow deposit gateway'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Quick Amount Selector */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {isArabic ? 'المبلغ المراد شحنه ($)' : 'Amount to Deposit ($)'}
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min={20}
                max={50000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full text-base font-extrabold p-2.5 ps-9 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900"
                required
              />
            </div>
            {/* Quick Pills */}
            <div className="flex items-center gap-2 mt-2">
              {[250, 500, 1000, 2500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all ${
                    amount === preset
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              {isArabic ? 'وسيلة الدفع' : 'Payment Method'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`p-3 rounded-2xl border text-start transition-all ${
                  method === 'card'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1 text-blue-600" />
                <span className="font-bold block">{isArabic ? 'بطاقة بنكية' : 'Credit / Debit'}</span>
                <span className="text-[10px] text-slate-400">Visa / Mastercard</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('bank')}
                className={`p-3 rounded-2xl border text-start transition-all ${
                  method === 'bank'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Building className="w-5 h-5 mb-1 text-blue-600" />
                <span className="font-bold block">{isArabic ? 'تحويل مصرفي' : 'Bank Transfer'}</span>
                <span className="text-[10px] text-slate-400">Wire / SWIFT</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {isArabic
                ? 'رصيدك المودع يبقى آمناً ومحفوظاً، ولا يتم تحرير أي مبالغ للمستقل إلا بموافقتك على التسليم.'
                : 'Deposited funds are held securely in your client account and protected by Escrow.'}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 font-semibold"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isProcessing ? (isArabic ? 'جاري المعالجة...' : 'Processing...') : (isArabic ? `تأكيد إيداع $${amount}` : `Confirm Deposit $${amount}`)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
