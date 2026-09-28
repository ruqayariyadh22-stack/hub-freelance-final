import {
  validateMarkAsReadBody,
  validateNotificationIdParam,
} from './notificationsValidation.js';
import {
  listNotifications,
  markNotificationRead,
} from './notificationsService.js';

export const list = async (req, res) => {
  const data = await listNotifications(req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const markAsRead = async (req, res) => {
  const notificationId = validateNotificationIdParam(req.params.id);
  validateMarkAsReadBody(req.body);
  const data = await markNotificationRead(notificationId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};
