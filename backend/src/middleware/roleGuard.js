import { AppError } from '../utils/appError.js';

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError('Forbidden: insufficient role', 403));
  }

  return next();
};

export const requireClient = authorizeRoles('client');
export const requireFreelancer = authorizeRoles('freelancer');
export const requireAdmin = authorizeRoles('admin');
