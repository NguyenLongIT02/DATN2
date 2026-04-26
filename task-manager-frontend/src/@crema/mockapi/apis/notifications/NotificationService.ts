// Notification Service - separated from API to avoid circular imports

// Notification types
export interface Notification {
  id: number;
  type: 'card_created' | 'card_updated' | 'card_moved' | 'member_assigned' | 'member_removed' | 'board_created' | 'board_updated' | 'board_deleted';
  title: string;
  message: string;
  userId: number;
  boardId?: number;
  cardId?: number;
  memberId?: number;
  actorId: number; // User who performed the action
  actorName: string;
  actorAvatar: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any; // Additional data like card title, board name, etc.
}

// Load notifications from localStorage
const loadNotifications = (): Notification[] => {
  try {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('NotificationService: Error loading from localStorage', error);
  }
  return [];
};

// Save notifications to localStorage
const saveNotifications = (notifications: Notification[]) => {
  try {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    console.log('NotificationService: Saved notifications to localStorage');
    
    // Trigger custom event to notify components
    window.dispatchEvent(new CustomEvent('notificationsChanged'));
  } catch (error) {
    console.error('NotificationService: Error saving to localStorage', error);
  }
};

let notifications: Notification[] = loadNotifications();

// Create sample notifications if none exist
if (notifications.length === 0) {
  console.log('🔔 Creating sample notifications...');
  
  // Sample board creation notification
  const sampleNotification1: Notification = {
    id: 1,
    type: 'board_created',
    title: 'New Board Created',
    message: 'John Doe created board "Project Alpha" and added you as a member',
    userId: 500,
    boardId: 1,
    actorId: 500,
    actorName: 'John Doe',
    actorAvatar: '/assets/images/avatar/A1.jpg',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    metadata: { boardName: 'Project Alpha' }
  };

  // Sample card creation notification
  const sampleNotification2: Notification = {
    id: 2,
    type: 'card_created',
    title: 'New Card Created',
    message: 'John Doe created card "Implement user authentication" in board "Project Alpha"',
    userId: 500,
    boardId: 1,
    actorId: 500,
    actorName: 'John Doe',
    actorAvatar: '/assets/images/avatar/A1.jpg',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    metadata: { cardTitle: 'Implement user authentication', boardName: 'Project Alpha' }
  };

  // Sample card move notification
  const sampleNotification3: Notification = {
    id: 3,
    type: 'card_moved',
    title: 'Card Moved',
    message: 'John Doe moved card "Design database schema" from "To Do" to "In Progress" in board "Project Alpha"',
    userId: 500,
    boardId: 1,
    actorId: 500,
    actorName: 'John Doe',
    actorAvatar: '/assets/images/avatar/A1.jpg',
    isRead: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    metadata: { cardTitle: 'Design database schema', boardName: 'Project Alpha', fromList: 'To Do', toList: 'In Progress' }
  };

  notifications = [sampleNotification1, sampleNotification2, sampleNotification3];
  saveNotifications(notifications);
  console.log('🔔 Sample notifications created:', notifications.length);
}

// Notification Service
export class NotificationService {
  private static nextId = 4; // Start from 4 since we have 3 sample notifications

  /**
   * Create a new notification
   */
  static createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: this.nextId++,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    notifications.unshift(newNotification); // Add to beginning
    saveNotifications(notifications);
    
    console.log('NotificationService: Created notification:', newNotification);
    return newNotification;
  }

  /**
   * Create notification for card created
   */
  static notifyCardCreated(cardTitle: string, boardId: number, boardName: string, actorId: number, actorName: string, actorAvatar: string, assignedMembers: number[] = []) {
    const notifications = assignedMembers.map(memberId => 
      this.createNotification({
        type: 'card_created',
        title: 'New Card Created',
        message: `${actorName} created card "${cardTitle}" in board "${boardName}"`,
        userId: memberId,
        boardId,
        actorId,
        actorName,
        actorAvatar,
        metadata: { cardTitle, boardName }
      })
    );

    // Also notify the actor if they're not in the assigned members
    if (!assignedMembers.includes(actorId)) {
      this.createNotification({
        type: 'card_created',
        title: 'Card Created',
        message: `You created card "${cardTitle}" in board "${boardName}"`,
        userId: actorId,
        boardId,
        actorId,
        actorName,
        actorAvatar,
        metadata: { cardTitle, boardName }
      });
    }

    return notifications;
  }

  /**
   * Create notification for card moved
   */
  static notifyCardMoved(cardTitle: string, boardId: number, boardName: string, fromList: string, toList: string, actorId: number, actorName: string, actorAvatar: string, assignedMembers: number[] = []) {
    const notifications = assignedMembers.map(memberId => 
      this.createNotification({
        type: 'card_moved',
        title: 'Card Moved',
        message: `${actorName} moved card "${cardTitle}" from "${fromList}" to "${toList}" in board "${boardName}"`,
        userId: memberId,
        boardId,
        actorId,
        actorName,
        actorAvatar,
        metadata: { cardTitle, boardName, fromList, toList }
      })
    );

    return notifications;
  }

  /**
   * Create notification for member assigned to card
   */
  static notifyMemberAssigned(cardTitle: string, boardId: number, boardName: string, memberId: number, memberName: string, actorId: number, actorName: string, actorAvatar: string) {
    return this.createNotification({
      type: 'member_assigned',
      title: 'Assigned to Card',
      message: `${actorName} assigned you to card "${cardTitle}" in board "${boardName}"`,
      userId: memberId,
      boardId,
      actorId,
      actorName,
      actorAvatar,
      metadata: { cardTitle, boardName, memberName }
    });
  }

  /**
   * Create notification for member removed from card
   */
  static notifyMemberRemoved(cardTitle: string, boardId: number, boardName: string, memberId: number, memberName: string, actorId: number, actorName: string, actorAvatar: string) {
    return this.createNotification({
      type: 'member_removed',
      title: 'Removed from Card',
      message: `${actorName} removed you from card "${cardTitle}" in board "${boardName}"`,
      userId: memberId,
      boardId,
      actorId,
      actorName,
      actorAvatar,
      metadata: { cardTitle, boardName, memberName }
    });
  }

  /**
   * Create notification for board created
   */
  static notifyBoardCreated(boardName: string, boardId: number, actorId: number, actorName: string, actorAvatar: string, assignedMembers: number[] = []) {
    const notifications = assignedMembers.map(memberId => 
      this.createNotification({
        type: 'board_created',
        title: 'New Board Created',
        message: `${actorName} created board "${boardName}" and added you as a member`,
        userId: memberId,
        boardId,
        actorId,
        actorName,
        actorAvatar,
        metadata: { boardName }
      })
    );

    return notifications;
  }

  /**
   * Create notification for board updated
   */
  static notifyBoardUpdated(boardName: string, boardId: number, actorId: number, actorName: string, actorAvatar: string, assignedMembers: number[] = []) {
    const notifications = assignedMembers.map(memberId => 
      this.createNotification({
        type: 'board_updated',
        title: 'Board Updated',
        message: `${actorName} updated board "${boardName}"`,
        userId: memberId,
        boardId,
        actorId,
        actorName,
        actorAvatar,
        metadata: { boardName }
      })
    );

    return notifications;
  }

  /**
   * Create notification for board deleted
   */
  static notifyBoardDeleted(boardName: string, boardId: number, actorId: number, actorName: string, actorAvatar: string, assignedMembers: number[] = []) {
    const notifications = assignedMembers.map(memberId => 
      this.createNotification({
        type: 'board_deleted',
        title: 'Board Deleted',
        message: `${actorName} deleted board "${boardName}"`,
        userId: memberId,
        boardId,
        actorId,
        actorName,
        actorAvatar,
        metadata: { boardName }
      })
    );

    return notifications;
  }

  /**
   * Get unread count for user
   */
  static getUnreadCount(userId: number): number {
    return notifications.filter(n => n.userId === userId && !n.isRead).length;
  }

  /**
   * Get all notifications for user
   */
  static getNotifications(userId: number): Notification[] {
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Mark notification as read
   */
  static markAsRead(notificationId: number): boolean {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      saveNotifications(notifications);
      return true;
    }
    return false;
  }

  /**
   * Mark all notifications as read for user
   */
  static markAllAsRead(userId: number): void {
    notifications = notifications.map(n => 
      n.userId === userId ? { ...n, isRead: true } : n
    );
    saveNotifications(notifications);
  }

  /**
   * Delete notification
   */
  static deleteNotification(notificationId: number): boolean {
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications.splice(index, 1);
      saveNotifications(notifications);
      return true;
    }
    return false;
  }

  /**
   * Clear all notifications for user
   */
  static clearAll(userId: number): void {
    notifications = notifications.filter(n => n.userId !== userId);
    saveNotifications(notifications);
  }
}

// Listen for storage changes to sync across tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'notifications') {
    notifications = loadNotifications();
    console.log('NotificationService: Storage changed, reloaded notifications');
  }
});

export default NotificationService;
