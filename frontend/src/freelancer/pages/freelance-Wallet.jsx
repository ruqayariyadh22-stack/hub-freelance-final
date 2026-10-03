import React, { useEffect, useMemo, useState } from 'react';
import { CircleDollarSign, Search, ShieldCheck, WalletCards } from 'lucide-react';
import { t } from '../freelance-i18n';
import { Card, Empty, PageHeader, Stat, Status } from '../components/freelance-UI';
import { errorMessage, formatMoney, freelancerGet, freelancerPost } from '../api';

export default function Wallet({ lang, notify }) {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);

  const withdraw = async (e) => {
    e.preventDefault();
    if (withdrawing) return;
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setWithdrawError(t(lang, 'أدخل مبلغاً صحيحاً', 'Enter a valid amount'));
      return;
    }
    if (amount > Number(wallet?.balance || 0)) {
      setWithdrawError(t(lang, 'المبلغ أكبر من الرصيد المتاح', 'Amount exceeds your available balance'));
      return;
    }
    setWithdrawing(true);
    setWithdrawError(null);
    try {
      const result = await freelancerPost('/wallet/withdraw', { amount });
      setWallet(result.wallet);
      setTransactions((prev) => [result.transaction, ...prev]);
      setWithdrawAmount('');
      notify?.(t(lang, 'تم تنفيذ السحب بنجاح', 'Withdrawal completed'));
    } catch (err) {
      setWithdrawError(errorMessage(err, t(lang, 'تعذر تنفيذ السحب', 'Withdrawal failed')));
    } finally {
      setWithdrawing(false);
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [walletData, txData] = await Promise.all([
        freelancerGet('/wallet'),
        freelancerGet('/wallet/transactions'),
      ]);
      setWallet(walletData);
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (err) {
      setError(errorMessage(err, t(lang, 'تعذر تحميل المحفظة', 'Failed to load wallet')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const releaseEarnings = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === 'payout')
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0),
    [transactions],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((tx) =>
      `${tx.id} ${tx.type} ${tx.contract_id} ${tx.amount} ${tx.commission}`
        .toLowerCase()
        .includes(q),
    );
  }, [transactions, search]);

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="المحفظة والضمان"
        titleEn="Wallet & Escrow"
        subAr="رصيدك ومعاملاتك الفعلية من النظام. عمولة المنصة 5% تخصم عند تحرير الدفعة."
        subEn="Your live balance and transactions. The 5% platform commission is deducted when payment is released."
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

      {!loading && !error && (
        <>
          <div className="stats-grid">
            <Stat
              lang={lang}
              icon={CircleDollarSign}
              labelAr="الرصيد المتاح"
              labelEn="Available Balance"
              value={formatMoney(wallet?.balance)}
            />
            <Stat
              lang={lang}
              icon={ShieldCheck}
              labelAr="في الضمان"
              labelEn="In Escrow"
              value={formatMoney(wallet?.escrow_balance)}
              tone="amber"
            />
            <Stat
              lang={lang}
              icon={WalletCards}
              labelAr="أرباح محرّرة"
              labelEn="Released Earnings"
              value={formatMoney(releaseEarnings)}
              tone="green"
            />
          </div>

          <Card>
            <div className="card-head">
              <div>
                <h3>{t(lang, 'سحب الرصيد', 'Withdraw balance')}</h3>
                <p>
                  {t(
                    lang,
                    'يتم خصم المبلغ من رصيدك المتاح وتسجيله كعملية سحب.',
                    'The amount is deducted from your available balance and recorded as a withdrawal.',
                  )}
                </p>
              </div>
            </div>
            <form className="form-grid" onSubmit={withdraw}>
              <label>
                {t(lang, 'المبلغ', 'Amount')}
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={formatMoney(wallet?.balance)}
                />
              </label>
              <div className="modal-actions" style={{ alignItems: 'flex-end' }}>
                <button
                  className="ghost"
                  type="button"
                  onClick={() => setWithdrawAmount(String(Number(wallet?.balance || 0)))}
                >
                  {t(lang, 'كامل الرصيد', 'Max')}
                </button>
                <button className="primary" type="submit" disabled={withdrawing || !Number(wallet?.balance)}>
                  {withdrawing ? t(lang, 'جاري السحب...', 'Withdrawing...') : t(lang, 'سحب', 'Withdraw')}
                </button>
              </div>
              {withdrawError && <p className="notice amber full">{withdrawError}</p>}
            </form>
          </Card>

          <Card>
            <div className="card-head">
              <div>
                <h3>{t(lang, 'المعاملات', 'Transactions')}</h3>
                <p>{t(lang, 'سجل مالي حقيقي', 'Live financial history')}</p>
              </div>
              <div className="input-search compact">
                <Search size={14} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t(lang, 'بحث...', 'Search...')}
                />
              </div>
            </div>
            {filtered.length === 0 ? (
              <Empty
                lang={lang}
                titleAr="لا معاملات"
                titleEn="No transactions"
                bodyAr="لا توجد معاملات في محفظتك بعد."
                bodyEn="You have no wallet transactions yet."
              />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t(lang, 'النوع', 'Type')}</th>
                      <th>{t(lang, 'المبلغ', 'Amount')}</th>
                      <th>{t(lang, 'العمولة', 'Commission')}</th>
                      <th>{t(lang, 'العقد', 'Contract')}</th>
                      <th>{t(lang, 'التاريخ', 'Date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((tx) => (
                      <tr key={tx.id}>
                        <td>#{tx.id}</td>
                        <td>
                          <Status lang={lang} type={tx.type} />
                        </td>
                        <td>
                          <strong>{formatMoney(tx.amount)}</strong>
                        </td>
                        <td>
                          {tx.commission == null ? '—' : formatMoney(tx.commission)}
                        </td>
                        <td>{tx.contract_id != null ? `#${tx.contract_id}` : '—'}</td>
                        <td>{tx.created_at ? String(tx.created_at).slice(0, 10) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </>
  );
}
