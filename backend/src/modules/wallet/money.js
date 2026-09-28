import { AppError } from '../../utils/appError.js';

export const PLATFORM_COMMISSION_RATE = 0.05;

export const validateMoneyAmount = (amount, field = 'amount') => {
  if (typeof amount !== 'number' || Number.isNaN(amount) || !Number.isFinite(amount)) {
    throw new AppError('Validation failed', 400, [
      { field, message: 'Amount must be a finite number' },
    ]);
  }

  if (amount < 0) {
    throw new AppError('Validation failed', 400, [
      { field, message: 'Amount cannot be negative' },
    ]);
  }

  return amount;
};

export const calculateCommission = (amount) => {
  const validAmount = validateMoneyAmount(amount);
  const amountCents = Math.round(validAmount * 100);
  const commissionCents = Math.round((amountCents * 5) / 100);
  const payoutCents = amountCents - commissionCents;

  return {
    amount: amountCents / 100,
    commission: commissionCents / 100,
    payout: payoutCents / 100,
    rate: PLATFORM_COMMISSION_RATE,
  };
};
