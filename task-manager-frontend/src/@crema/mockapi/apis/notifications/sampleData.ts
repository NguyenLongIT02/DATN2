import NotificationService from './NotificationService';

/**
 * Create sample notifications for testing
 */
export const createSampleNotifications = () => {
  console.log('Creating sample notifications...');
  
  // Sample board creation notification
  NotificationService.notifyBoardCreated(
    'Project Alpha',
    1,
    500, // John Doe
    'John Doe',
    '/assets/images/avatar/A1.jpg',
    [500, 501, 502] // Notify multiple members
  );

  // Sample card creation notification
  NotificationService.notifyCardCreated(
    'Implement user authentication',
    1,
    'Project Alpha',
    500, // John Doe
    'John Doe',
    '/assets/images/avatar/A1.jpg',
    [501, 502] // Notify assigned members
  );

  // Sample card move notification
  NotificationService.notifyCardMoved(
    'Design database schema',
    1,
    'Project Alpha',
    'To Do',
    'In Progress',
    500, // John Doe
    'John Doe',
    '/assets/images/avatar/A1.jpg',
    [501] // Notify assigned member
  );

  // Sample member assignment notification
  NotificationService.notifyMemberAssigned(
    'Setup CI/CD pipeline',
    1,
    'Project Alpha',
    501, // Member being assigned
    'Jane Smith',
    500, // John Doe (actor)
    'John Doe',
    '/assets/images/avatar/A1.jpg'
  );

  // Sample board update notification
  NotificationService.notifyBoardUpdated(
    'Project Beta',
    2,
    500, // John Doe
    'John Doe',
    '/assets/images/avatar/A1.jpg',
    [500, 501, 502, 503] // Notify all members
  );

  console.log('Sample notifications created successfully!');
};

// Auto-create sample notifications when this module is imported
// Uncomment the line below to automatically create sample data
// createSampleNotifications();
