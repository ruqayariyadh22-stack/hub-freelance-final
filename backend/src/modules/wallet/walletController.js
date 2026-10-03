import {
  validateContractIdParam,
  validateTopupBody,
  validateWalletActionBody,
} from './walletValidation.js';
import {
  getWallet,
  holdEscrow,
  listWalletTransactions,
  releasePaymentByContractId,
  topupWallet,
  withdrawFromWallet,
} from './walletService.js';

export const getMe = async (req, res) => {
  const data = await getWallet(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const listTransactions = async (req, res) => {
  const data = await listWalletTransactions(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const topup = async (req, res) => {
  const payload = validateTopupBody(req.body);
  const data = await topupWallet(req.user, payload.amount);

  res.status(201).json({
    success: true,
    data,
  });
};

export const escrow = async (req, res) => {
  const contractId = validateContractIdParam(req.params.contractId);
  validateWalletActionBody(req.body);
  const data = await holdEscrow(contractId, req.user);

  res.status(201).json({
    success: true,
    data,
  });
};

export const releaseByContractId = async (req, res) => {
  const contractId = validateContractIdParam(req.params.contractId);
  validateWalletActionBody(req.body);
  const data = await releasePaymentByContractId(contractId, req.user);

  res.status(201).json({
    success: true,
    data,
  });
};

export const withdraw = async (req, res) => {
  const payload = validateTopupBody(req.body);
  const data = await withdrawFromWallet(req.user, payload.amount);

  res.status(201).json({
    success: true,
    data,
  });
};
