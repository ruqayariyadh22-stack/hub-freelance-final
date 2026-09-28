import { AppError } from '../../utils/appError.js';
import {
  findNotificationById,
  listNotificationsByUserId,
  markNotificationReadForUser,
} from './notificationsPersistence.js';

const toPublicNotification = (notification) => ({
  id: notification.id,
  user_id: notification.user_id,
  type: notification.type,
  message: notification.message,
  is_read: notification.is_read,
  created_at: notification.created_at,
});

const requireNotification = (notification) => {
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  return notification;
};

const requireNotificationRecipient = async (notificationId, actor) => {
  const notification = requireNotification(
    await findNotificationById(notificationId),
  );

  if (notification.user_id !== actor.id) {
    throw new AppError('Forbidden: insufficient role', 403);
  }

  return notification;
};

export const listNotifications = async (actor) => {
  const notifications = await listNotificationsByUserId(actor.id);
  return notifications.map(toPublicNotification);
};

export const markNotificationRead = async (notificationId, actor) => {
  await requireNotificationRecipient(notificationId, actor);

  const updated = requireNotification(
    await markNotificationReadForUser(notificationId, actor.id),
  );

  return toPublicNotification(updated);
};
