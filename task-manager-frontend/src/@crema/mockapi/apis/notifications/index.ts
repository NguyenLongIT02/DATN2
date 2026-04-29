import mock from '../MockConfig.tsx';
import NotificationService, { Notification } from './NotificationService';

// Test endpoint to verify mock is working
mock.onGet('/api/notifications/test').reply(() => {
  return [200, { message: 'Notifications API is working' }];
});

// Get notifications for a user
mock.onGet(/\/api\/notifications(\?.*)?$/).reply((config) => {
  const userId = config.params?.userId || 500; // Default to John Doe
  const userNotifications = NotificationService.getNotifications(userId);
  
  return [200, userNotifications];
});

// Mark notification as read
mock.onPut('/api/notifications/:id/read').reply((config) => {
  const notificationId = parseInt(config.url?.split('/')[3] || '0');
  const success = NotificationService.markAsRead(notificationId);
  
  if (success) {
    return [200, { success: true }];
  }
  
  return [404, { message: 'Notification not found' }];
});

// Mark all notifications as read
mock.onPut('/api/notifications/read-all').reply((config) => {
  const userId = config.data ? JSON.parse(config.data).userId : 500;
  
  NotificationService.markAllAsRead(userId);
  return [200, { success: true }];
});

// Delete notification
mock.onDelete('/api/notifications/:id').reply((config) => {
  const notificationId = parseInt(config.url?.split('/')[3] || '0');
  const success = NotificationService.deleteNotification(notificationId);
  
  if (success) {
    return [200, { success: true }];
  }
  
  return [404, { message: 'Notification not found' }];
});

// Clear all notifications for user
mock.onPut('/api/notifications/clear-all').reply((config) => {
  const userId = config.data ? JSON.parse(config.data).userId : 500;
  
  NotificationService.clearAll(userId);
  return [200, { success: true }];
});

// Export NotificationService and types
export { NotificationService } from './NotificationService';
export type { Notification } from './NotificationService';
export default NotificationService;
