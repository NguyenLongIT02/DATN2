import { Notification } from "@crema/mockapi/apis/notifications/NotificationService";

// WebSocket Message Types for Notifications
export interface NotificationWebSocketMessage {
  type: 'NOTIFICATION_CREATED' | 'NOTIFICATION_UPDATED' | 'CONNECTION_ESTABLISHED';
  data?: Notification;
  timestamp: string;
}

// WebSocket Connection Status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// WebSocket Event Handlers for Notifications
export interface NotificationWebSocketHandlers {
  onNotificationCreated?: (message: NotificationWebSocketMessage) => void;
  onNotificationUpdated?: (message: NotificationWebSocketMessage) => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
}

class NotificationWebSocketService {
  private ws: WebSocket | null = null;
  private userId: number | null = null;
  private handlers: NotificationWebSocketHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second
  private reconnectTimer: NodeJS.Timeout | null = null;
  private status: ConnectionStatus = 'disconnected';

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
    
    // Listen for page visibility changes and online/offline events
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  // Connect to WebSocket for notifications
  connect(userId: number, handlers: NotificationWebSocketHandlers = {}): void {
    if (this.ws?.readyState === WebSocket.OPEN && this.userId === userId) {
      this.handlers = handlers;
      return;
    }

    if (this.status === 'connecting' && this.userId === userId) {
      this.handlers = handlers;
      return;
    }

    this.disconnect();
    this.userId = userId;
    this.handlers = handlers;
    this.status = 'connecting';
    this.reconnectAttempts = 0;
    this.notifyStatusChange();

    try {
      const wsUrl = import.meta.env.VITE_WS_URL 
        ? `${import.meta.env.VITE_WS_URL}/notifications/${userId}`
        : `ws://localhost:8081/ws/notifications/${userId}`;
      
      console.log('NotificationWebSocketService: Connecting to', wsUrl);
      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error('NotificationWebSocketService: Connection error:', error);
      this.status = 'error';
      this.notifyStatusChange();
      this.scheduleReconnect();
    }
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect'); // Normal closure
      this.ws = null;
    }

    this.userId = null;
    this.handlers = {};
    this.reconnectAttempts = 0;
    this.status = 'disconnected';
    this.notifyStatusChange();
  }

  // Setup WebSocket event listeners
  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('NotificationWebSocketService: Connection established');
      this.status = 'connected';
      this.reconnectAttempts = 0;
      this.notifyStatusChange();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: NotificationWebSocketMessage = JSON.parse(event.data);
        console.log('NotificationWebSocketService: Received message:', message);
        this.handleMessage(message);
      } catch (error) {
        console.error('NotificationWebSocketService: Error parsing message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('NotificationWebSocketService: Connection closed', event.code, event.reason);
      this.status = 'disconnected';
      this.notifyStatusChange();
      
      if (event.code !== 1000 && this.userId) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('NotificationWebSocketService: WebSocket error:', error);
      this.status = 'error';
      this.notifyStatusChange();
    };
  }

  // Handle incoming WebSocket messages
  private handleMessage(message: NotificationWebSocketMessage): void {
    switch (message.type) {
      case 'NOTIFICATION_CREATED':
        this.handlers.onNotificationCreated?.(message);
        break;
      case 'NOTIFICATION_UPDATED':
        this.handlers.onNotificationUpdated?.(message);
        break;
      case 'CONNECTION_ESTABLISHED':
        console.log('NotificationWebSocketService: Connection established message received');
        break;
      default:
        console.warn('NotificationWebSocketService: Unknown message type:', message.type);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('NotificationWebSocketService: Max reconnect attempts reached');
      this.status = 'error';
      this.notifyStatusChange();
      return;
    }

    if (!this.userId) return;

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`NotificationWebSocketService: Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      if (this.userId && this.handlers) {
        this.connect(this.userId, this.handlers);
      }
    }, delay);
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log('NotificationWebSocketService: Page hidden, closing connection');
        this.ws.close(1000, 'Page hidden');
      }
    } else {
      if (this.userId && this.status === 'disconnected') {
        console.log('NotificationWebSocketService: Page visible, reconnecting');
        this.connect(this.userId, this.handlers);
      }
    }
  }

  private handleOnline(): void {
    if (this.userId && this.status === 'disconnected') {
      console.log('NotificationWebSocketService: Network online, reconnecting');
      this.connect(this.userId, this.handlers);
    }
  }

  private handleOffline(): void {
    console.log('NotificationWebSocketService: Network offline');
    this.status = 'disconnected';
    this.notifyStatusChange();
  }

  // Notify status change
  private notifyStatusChange(): void {
    this.handlers.onConnectionStatusChange?.(this.status);
  }

  // Get current connection status
  getStatus(): ConnectionStatus {
    return this.status;
  }

  // Check if connected
  isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }
}

// Export singleton instance
export const notificationWebSocketService = new NotificationWebSocketService();
export default notificationWebSocketService;
