import { useEffect, useState, useCallback, useRef } from 'react';
import { webSocketService, WebSocketHandlers, ConnectionStatus, WebSocketMessage } from '@crema/services/WebSocketService';
import { CardObjType } from '@crema/types/models/apps/ScrumbBoard';

interface UseWebSocketOptions {
  boardId?: string;
  enabled?: boolean;
  onCardCreated?: (message: WebSocketMessage) => void;
  onCardDeleted?: (message: WebSocketMessage) => void;
  onCardUpdated?: (message: WebSocketMessage) => void;
  onCardMoved?: (message: WebSocketMessage) => void;
  onCardCommented?: (message: WebSocketMessage) => void;
  onCardChecklistUpdated?: (message: WebSocketMessage) => void;
}

interface UseWebSocketReturn {
  status: ConnectionStatus;
  isConnected: boolean;
  connect: (boardId: string) => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const {
    boardId,
    enabled = true,
    onCardCreated,
    onCardDeleted,
    onCardUpdated,
    onCardMoved,
    onCardCommented,
    onCardChecklistUpdated,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const handlersRef = useRef<WebSocketHandlers>({});

  // Update handlers when callbacks change
  useEffect(() => {
    handlersRef.current = {
      onCardCreated,
      onCardDeleted,
      onCardUpdated,
      onCardMoved,
      onCardCommented,
      onCardChecklistUpdated,
      onConnectionStatusChange: (newStatus: ConnectionStatus) => {
        setStatus(newStatus);
      },
    };
  }, [onCardCreated, onCardDeleted, onCardUpdated, onCardMoved, onCardCommented, onCardChecklistUpdated]);

  // Connect when boardId changes and enabled
  useEffect(() => {
    if (enabled && boardId) {
      console.log('useWebSocket: Connecting to board:', boardId);
      webSocketService.connect(boardId, handlersRef.current);
    } else if (!enabled || !boardId) {
      console.log('useWebSocket: Disconnecting - enabled:', enabled, 'boardId:', boardId);
      webSocketService.disconnect();
    }
  }, [boardId, enabled]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      console.log('useWebSocket: Component unmounting, disconnecting...');
      webSocketService.disconnect();
    };
  }, []);

  const connect = useCallback((newBoardId: string) => {
    webSocketService.connect(newBoardId, handlersRef.current);
  }, []);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  const sendMessage = useCallback((message: any) => {
    webSocketService.send(message);
  }, []);

  return {
    status,
    isConnected: webSocketService.isConnected(),
    connect,
    disconnect,
    sendMessage,
  };
};

export default useWebSocket;
