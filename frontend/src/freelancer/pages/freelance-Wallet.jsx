import React, { useState } from 'react';
import {
  CircleDollarSign,
  Search,
  ShieldCheck,
  WalletCards
} from 'lucide-react';

import { t } from '../freelance-i18n';
import { transactions as initialTransactions } from '../freelance-data';
import {
  Card,
  Modal,
  PageHeader,
  Stat,
  Status
} from '../components/freelance-UI';

export default function Wallet({ lang, notify }) {
  const [balance, setBalance] = useState(4250);
  const [transactionList, setTransactionList] = useState(
    initialTransactions
  );

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');
  const [search, setSearch] = useState('');

  const openWithdraw = () => {
    setAmount('');
    setMethod('bank');
    setOpen(true);
  };

  const handleWithdraw = () => {
    const value = Number(amount);

    if (!value || value <= 0) {
      notify(
        t(
          lang,
          'أدخل مبلغاً صحيحاً للسحب',
          'Enter a valid withdrawal amount'
        )
      );
      return;
    }

    if (value > balance) {
      notify(
        t(
          lang,
          'المبلغ أكبر من الرصيد المتاح',
          'Amount exceeds your available balance'
        )
      );
      return;
    }

    const newTransaction = [
      `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      t(
        lang,
        'طلب سحب من المحفظة',
        'Wallet withdrawal request'
      ),
      `-$${value}`,
      '-',
      new Date().toISOString().slice(0, 10),
      'active'
    ];

    setBalance(prev => prev - value);

    setTransactionList(prev => [
      newTransaction,
      ...prev
    ]);

    setOpen(false);
    setAmount('');

    notify(
      t(
        lang,
        `تم إرسال طلب سحب بقيمة $${value}`,
        `Withdrawal request of $${value} submitted`
      )
    );
  };

  const filteredTransactions = transactionList.filter(row =>
    row[0].toLowerCase().includes(search.toLowerCase()) ||
    row[1].toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        lang={lang}
        titleAr="المحفظة والمدفوعات"
        titleEn="Wallet & Payments"
        subAr="تابع رصيدك المتاح، المبالغ المحجوزة، والعمليات المالية."
        subEn="Track available balance, escrow, and transaction activity."
        action={
          <button
            className="primary"
            onClick={openWithdraw}
          >
            <CircleDollarSign size={15} />
            {t(lang, 'سحب الرصيد', 'Withdraw')}
          </button>
        }
      />

      <div className="stats-grid">
        <Stat
          lang={lang}
          icon={WalletCards}
          labelAr="الرصيد المتاح"
          labelEn="Available balance"
          value={`$${balance.toLocaleString()}`}
        />

        <Stat
          lang={lang}
          icon={ShieldCheck}
          labelAr="المحجوز بالضمان"
          labelEn="In escrow"
          value="$1,850"
          tone="amber"
        />

        <Stat
          lang={lang}
          icon={CircleDollarSign}
          labelAr="إجمالي المحول"
          labelEn="Total transferred"
          value="$6,760"
          tone="green"
        />
      </div>

      <Card>
        <div className="card-head">
          <div>
            <h3>
              {t(lang, 'كل المعاملات', 'All transactions')}
            </h3>

            <p>
              {t(
                lang,
                'إيداعات وضمان وتحرير دفعات وسحب',
                'Deposits, escrow, releases, and withdrawals'
              )}
            </p>
          </div>

          <div className="input-search compact">
            <Search size={15} />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t(
                lang,
                'ابحث برقم العملية...',
                'Search transaction ID...'
              )}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t(lang, 'العملية', 'Transaction')}</th>
                <th>{t(lang, 'البيان', 'Description')}</th>
                <th>{t(lang, 'المبلغ', 'Amount')}</th>
                <th>{t(lang, 'العمولة', 'Fee')}</th>
                <th>{t(lang, 'التاريخ', 'Date')}</th>
                <th>{t(lang, 'الحالة', 'Status')}</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map(row => (
                <tr key={row[0]}>
                  <td>
                    <b>{row[0]}</b>
                  </td>

                  <td>{row[1]}</td>

                  <td>
                    <strong>{row[2]}</strong>
                  </td>

                  <td>{row[3]}</td>

                  <td>{row[4]}</td>

                  <td>
                    <Status
                      lang={lang}
                      type={row[5]}
                    />
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
          titleAr="سحب الرصيد"
          titleEn="Withdraw Balance"
          onClose={() => setOpen(false)}
        >
          <div className="form-grid">

            <label className="full">
              {t(
                lang,
                'المبلغ المطلوب سحبه',
                'Withdrawal amount'
              )}

              <div className="input-money">
                <span>$</span>

                <input
                  type="number"
                  min="1"
                  max={balance}
                  value={amount}
                  onChange={e =>
                    setAmount(e.target.value)
                  }
                  placeholder="0"
                />
              </div>

              <small>
                {t(
                  lang,
                  `الرصيد المتاح: $${balance.toLocaleString()}`,
                  `Available balance: $${balance.toLocaleString()}`
                )}
              </small>
            </label>

            <label className="full">
              {t(
                lang,
                'طريقة السحب',
                'Withdrawal method'
              )}

              <select
                value={method}
                onChange={e =>
                  setMethod(e.target.value)
                }
              >
                <option value="bank">
                  {t(
                    lang,
                    'حساب بنكي',
                    'Bank Account'
                  )}
                </option>

                <option value="card">
                  {t(
                    lang,
                    'بطاقة مصرفية',
                    'Bank Card'
                  )}
                </option>

                <option value="wallet">
                  {t(
                    lang,
                    'محفظة إلكترونية',
                    'Digital Wallet'
                  )}
                </option>
              </select>
            </label>

            <div className="withdraw-summary full">
              <div>
                <span>
                  {t(
                    lang,
                    'المبلغ المطلوب',
                    'Requested amount'
                  )}
                </span>

                <strong>
                  ${Number(amount || 0).toLocaleString()}
                </strong>
              </div>

              <div>
                <span>
                  {t(
                    lang,
                    'الرصيد بعد السحب',
                    'Balance after withdrawal'
                  )}
                </span>

                <strong>
                  $
                  {Math.max(
                    balance - Number(amount || 0),
                    0
                  ).toLocaleString()}
                </strong>
              </div>
            </div>

          </div>

          <div className="modal-actions">
            <button
              className="ghost"
              onClick={() => setOpen(false)}
            >
              {t(lang, 'إلغاء', 'Cancel')}
            </button>

            <button
              className="primary"
              onClick={handleWithdraw}
            >
              <CircleDollarSign size={15} />
              {t(
                lang,
                'تأكيد السحب',
                'Confirm Withdrawal'
              )}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}