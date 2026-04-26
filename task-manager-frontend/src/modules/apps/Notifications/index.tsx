import { useState, createContext, useContext, useCallback, useEffect } from "react";
import AppsContainer from "@crema/components/AppsContainer";
import NotificationSidebar from "./NotificationSidebar";
import NotificationContent from "./NotificationContent";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import { useNotificationWebSocket } from "@crema/hooks/useNotificationWebSocket";
import type { Notification } from "@crema/mockapi/apis/notifications/NotificationService";
import type { NotificationWebSocketMessage } from "@crema/services/NotificationWebSocketService";
import { tokenManager } from "@crema/services/TokenManager";

// Tạo context để chia sẻ notifications data
interface NotificationContextType {
  notifications: Notification[];
  loading: boolean;
  reCallAPI: () => void;
  wsStatus: string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within NotificationProvider"
    );
  }
  return context;
};

// Backend pagination response structure
interface PaginatedResponse {
  status: boolean;
  message: string;
  timestamp: string;
  code: number;
  content: Notification[];
  page: number;
  size: number;
  total: number;
}

const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [page] = useState(0);
  const [size] = useState(10);
  const [userId, setUserId] = useState<number | undefined>(undefined);
  
  // Extract userId from JWT token
  useEffect(() => {
    const token = tokenManager.getAccessToken();
    if (token) {
      try {
        // Decode JWT token (format: header.payload.signature)
        const payload = JSON.parse(atob(token.split('.')[1]));
        // JWT payload typically has 'sub' (subject) or 'userId' field
        const userIdFromToken = payload.userId || payload.sub || payload.id;
        if (userIdFromToken) {
          setUserId(Number(userIdFromToken));
        }
      } catch (error) {
        console.error('Error decoding JWT token:', error);
      }
    }
  }, []);
  
  // Use real backend API - backend uses Principal to get authenticated user automatically
  const [{ apiData: paginatedData, loading }, { reCallAPI, setData }] = useGetDataApi<
    PaginatedResponse
  >(`/notifications?page=${page}&size=${size}`);
  
  // Extract notifications from paginated response
  const notifications = paginatedData?.content || [];

  // Handle notification created via WebSocket
  const handleNotificationCreated = useCallback((message: NotificationWebSocketMessage) => {
    console.log('Notifications: Received NOTIFICATION_CREATED', message);
    
    if (message.data) {
      // Add new notification to the beginning of the list
      setData((prevData) => {
        const prevPaginatedData = prevData as PaginatedResponse | undefined;
        const currentNotifications = prevPaginatedData?.content || [];
        // Check if notification already exists to avoid duplicates
        const exists = currentNotifications.some(n => n.id === message.data!.id);
        if (exists) {
          return prevPaginatedData || { 
            status: true,
            message: 'success',
            timestamp: new Date().toISOString(),
            code: 200,
            content: [], 
            page: 0, 
            size: 10, 
            total: 0 
          };
        }
        return {
          status: prevPaginatedData?.status ?? true,
          message: prevPaginatedData?.message ?? 'success',
          timestamp: prevPaginatedData?.timestamp ?? new Date().toISOString(),
          code: prevPaginatedData?.code ?? 200,
          content: [message.data!, ...currentNotifications],
          page: prevPaginatedData?.page || 0,
          size: prevPaginatedData?.size || 10,
          total: (prevPaginatedData?.total || 0) + 1,
        } as PaginatedResponse;
      });
    }
  }, [setData]);

  // Handle notification updated via WebSocket
  const handleNotificationUpdated = useCallback((message: NotificationWebSocketMessage) => {
    console.log('Notifications: Received NOTIFICATION_UPDATED', message);
    
    if (message.data) {
      // Update existing notification in the list
      setData((prevData) => {
        const prevPaginatedData = prevData as PaginatedResponse | undefined;
        const currentNotifications = prevPaginatedData?.content || [];
        return {
          status: prevPaginatedData?.status ?? true,
          message: prevPaginatedData?.message ?? 'success',
          timestamp: prevPaginatedData?.timestamp ?? new Date().toISOString(),
          code: prevPaginatedData?.code ?? 200,
          content: currentNotifications.map(n => 
            n.id === message.data!.id ? message.data! : n
          ),
          page: prevPaginatedData?.page || 0,
          size: prevPaginatedData?.size || 10,
          total: prevPaginatedData?.total || 0,
        } as PaginatedResponse;
      });
    }
  }, [setData]);

  // Establish WebSocket connection for real-time notifications
  const { status: wsStatus } = useNotificationWebSocket({
    userId,
    enabled: !!userId,
    onNotificationCreated: handleNotificationCreated,
    onNotificationUpdated: handleNotificationUpdated,
  });

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const contextValue: NotificationContextType = {
    notifications: notifications,
    loading,
    reCallAPI,
    wsStatus,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      <AppsContainer
        title="Notifications"
        sidebarContent={
          <NotificationSidebar
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        }
      >
        <NotificationContent activeFilter={activeFilter} />
      </AppsContainer>
    </NotificationContext.Provider>
  );
};

export default Notifications;
