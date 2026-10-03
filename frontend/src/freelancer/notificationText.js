import { t } from './freelance-i18n';

const TEXT = {
  LOGIN_SUCCESS: ['تسجيل دخول ناجح', 'Successful login', 'تم تسجيل الدخول إلى حسابك بنجاح.'],
  PROPOSAL_ACCEPTED: ['تم قبول عرضك', 'Proposal accepted', 'قبل العميل عرضك على المشروع.'],
  PROPOSAL_REJECTED: ['لم يتم اختيار عرضك', 'Proposal not selected', 'لم يتم اختيار عرضك لهذا المشروع.'],
  PROPOSAL_RECEIVED: ['عرض جديد', 'New proposal', 'قدّم مستقل عرضاً جديداً على مشروعك.'],
  PROJECT_INVITATION: ['دعوة لمشروع', 'Project invitation', 'دعاك عميل لتقديم عرض على مشروعه.'],
  CONTRACT_CREATED: ['عقد جديد', 'New contract', 'تم إنشاء عقد جديد للمشروع.'],
  PROJECT_STATUS_CHANGED: ['تحديث حالة المشروع', 'Project status updated', 'تم تحديث حالة المشروع.'],
  SCOPE_CHANGE_CREATED: ['طلب تعديل نطاق', 'Scope change request', 'تم تقديم طلب تعديل نطاق جديد.'],
  SCOPE_CHANGE_APPROVED: ['تمت الموافقة على التعديل', 'Scope change approved', 'وافق العميل على طلب تعديل النطاق.'],
  SCOPE_CHANGE_REJECTED: ['رُفض طلب التعديل', 'Scope change rejected', 'رفض العميل طلب تعديل النطاق.'],
  CONTRACT_DELIVERED: ['تم التسليم', 'Contract delivered', 'تم تعليم العقد كمسلَّم.'],
  DELIVERY_FILE_UPLOADED: ['ملف جديد', 'New file', 'تم رفع ملف جديد على العقد.'],
  ESCROW_COMPLETED: ['تم تمويل الضمان', 'Escrow funded', 'موّل العميل الضمان ويمكنك بدء العمل.'],
  PAYMENT_RELEASED: ['تم تحرير الدفعة', 'Payment released', 'تم تحويل أرباح العقد إلى محفظتك.'],
  WITHDRAWAL_COMPLETED: ['تم السحب', 'Withdrawal completed', 'تمت معالجة طلب السحب.'],
  SUBSCRIPTION_UPDATED: ['تحديث الاشتراك', 'Subscription updated', 'تم تحديث اشتراكك.'],
  DISPUTE_OPENED: ['نزاع جديد', 'Dispute opened', 'تم فتح نزاع على أحد مشاريعك.'],
  DISPUTE_RESOLVED: ['تم حل النزاع', 'Dispute resolved', 'أصدرت الإدارة قراراً في النزاع.'],
  ACCOUNT_DISABLED: ['تم تعطيل الحساب', 'Account disabled', 'تم تعطيل حسابك.'],
  PASSWORD_CHANGED: ['تغيير كلمة المرور', 'Password changed', 'تم تغيير كلمة مرور حسابك.'],
};

export const notificationTitle = (lang, item) => {
  const entry = TEXT[item?.type];
  return entry ? t(lang, entry[0], entry[1]) : item?.type || '';
};

export const notificationMessage = (lang, item) => {
  const entry = TEXT[item?.type];
  return entry && lang === 'ar' ? entry[2] : item?.message || '';
};

export const formatNotificationTime = (value) =>
  value ? String(value).replace('T', ' ').slice(0, 16) : '';

export const NOTIFICATIONS_CHANGED = 'hub-freelancer-notifications-changed';

export const announceNotificationsChanged = () => {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
};
