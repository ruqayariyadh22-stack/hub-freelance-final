import { AppError } from '../utils/appError.js';
import { parseEntityId } from '../utils/entityId.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { findUserById } from '../modules/users/usersPersistence.js';

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = header.slice(7).trim();

  if (!token) {
    return next(new AppError('Authentication required', 401));
  }

  let decoded;

  try {
    decoded = verifyAccessToken(token);
  } catch {
    return next(new AppError('Invalid or expired token', 401));
  }

  const userId = parseEntityId(decoded.sub);

  if (userId === null) {
    return next(new AppError('Invalid or expired token', 401));
  }

  try {
    const user = await findUserById(userId);

    if (!user) {
      return next(new AppError('Invalid or expired token', 401));
    }

    if (user.account_status !== 'active') {
      return next(new AppError('Account is disabled', 403));
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
