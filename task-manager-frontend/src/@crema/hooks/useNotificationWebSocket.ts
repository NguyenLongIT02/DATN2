import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  notificationWebSocketService, 
  NotificationWebSocketHandlers, 
  ConnectionStatus,
  NotificationWebSocketMessage 
} from '@crema/services/NotificationWebSocketService';

interface UseNotificationWebSocketOptions {
  userId?: number;
  enabled?: boolean;
  onNotificationCreated?: (message: NotificationWebSocketMessage) => void;
  onNotificationUpdated?: (message: NotificationWebSocketMessage) => void;
}

interface UseNotificationWebSocketReturn {
  status: ConnectionStatus;
  isConnected: boolean;
  connect: (userId: number) => void;
  disconnect: () => void;
}

export const useNotificationWebSocket = (
  options: UseNotificationWebSocketOptions = {}
): UseNotificationWebSocketReturn => {
  const {
    userId,
    enabled = true,
    onNotificationCreated,
    onNotificationUpdated,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const handlersRef = useRef<NotificationWebSocketHandlers>({});

  // Update handlers when callbacks change
  useEffect(() => {
    handlersRef.current = {
      onNotificationCreated,
      onNotificationUpdated,
      onConnectionStatusChange: (newStatus: ConnectionStatus) => {
        setStatus(newStatus);
      },
    };
  }, [onNotificationCreated, onNotificationUpdated]);

  // Connect when userId changes and enabled
  useEffect(() => {
    if (enabled && userId) {
      console.log('useNotificationWebSocket: Connecting for user:', userId);
      notificationWebSocketService.connect(userId, handlersRef.current);
    } else if (!enabled || !userId) {
      console.log('useNotificationWebSocket: Disconnecting - enabled:', enabled, 'userId:', userId);
      notificationWebSocketService.disconnect();
    }
  }, [userId, enabled]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      console.log('useNotificationWebSocket: Component unmounting, disconnecting...');
      notificationWebSocketService.disconnect();
    };
  }, []);

  const connect = useCallback((newUserId: number) => {
    notificationWebSocketService.connect(newUserId, handlersRef.current);
  }, []);

  const disconnect = useCallback(() => {
    notificationWebSocketService.disconnect();
  }, []);

  return {
    status,
    isConnected: notificationWebSocketService.isConnected(),
    connect,
    disconnect,
  };
};

export default useNotificationWebSocket;
