console.log('🔔 Notifications API: Starting to load...');

import mock from '../MockConfig.tsx';
import NotificationService, { Notification } from './NotificationService';

console.log('🔔 Notifications API: Module loaded successfully!');
console.log('🔔 Notifications API: Mock instance:', mock);

// Test endpoint to verify mock is working
mock.onGet('/api/notifications/test').reply(() => {
  console.log('🔔 Test endpoint called - mock is working!');
  return [200, { message: 'Notifications API is working' }];
});

// Get notifications for a user
mock.onGet(/\/api\/notifications(\?.*)?$/).reply((config) => {
  console.log('🔔 Notifications API: GET /api/notifications called with config:', config);
  console.log('🔔 Notifications API: URL:', config.url);
  console.log('🔔 Notifications API: Params:', config.params);
  const userId = config.params?.userId || 500; // Default to John Doe
  const userNotifications = NotificationService.getNotifications(userId);
  
  console.log(`🔔 Notifications API: GET /api/notifications for user ${userId}, found ${userNotifications.length} notifications`);
  console.log('🔔 Notifications API: Returning notifications:', userNotifications);
  return [200, userNotifications];
});

// Mark notification as read
mock.onPut('/api/notifications/:id/read').reply((config) => {
  const notificationId = parseInt(config.url?.split('/')[3] || '0');
  const success = NotificationService.markAsRead(notificationId);
  
  if (success) {
    console.log(`Notifications API: Marked notification ${notificationId} as read`);
    return [200, { success: true }];
  }
  
  return [404, { message: 'Notification not found' }];
});

// Mark all notifications as read
mock.onPut('/api/notifications/read-all').reply((config) => {
  const userId = config.data ? JSON.parse(config.data).userId : 500;
  
  NotificationService.markAllAsRead(userId);
  console.log(`Notifications API: Marked all notifications as read for user ${userId}`);
  return [200, { success: true }];
});

// Delete notification
mock.onDelete('/api/notifications/:id').reply((config) => {
  const notificationId = parseInt(config.url?.split('/')[3] || '0');
  const success = NotificationService.deleteNotification(notificationId);
  
  if (success) {
    console.log(`Notifications API: Deleted notification ${notificationId}`);
    return [200, { success: true }];
  }
  
  return [404, { message: 'Notification not found' }];
});

// Clear all notifications for user
mock.onPut('/api/notifications/clear-all').reply((config) => {
  const userId = config.data ? JSON.parse(config.data).userId : 500;
  
  NotificationService.clearAll(userId);
  console.log(`Notifications API: Cleared all notifications for user ${userId}`);
  return [200, { success: true }];
});

// Export NotificationService and types
export { NotificationService } from './NotificationService';
export type { Notification } from './NotificationService';
export default NotificationService;

console.log('🔔 Notifications API: All endpoints registered successfully!');
