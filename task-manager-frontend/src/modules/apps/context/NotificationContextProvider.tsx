import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
import { useGetDataApi, putDataApi, postDataApi } from '@crema/hooks/APIHooks';
import { useAuthUser } from '@crema/hooks/AuthHooks';
import { useNotificationWebSocket } from '@crema/hooks/useNotificationWebSocket';
import { notification as antNotification } from 'antd';

export type NotificationContextType = {
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  refresh: () => void;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  markAsRead: () => {},
  markAllAsRead: () => {},
  refresh: () => {},
});

export const useNotificationContext = () => useContext(NotificationContext);

type NotificationContextProviderProps = {
  children: ReactNode;
};

const NotificationContextProvider: React.FC<NotificationContextProviderProps> = ({ children }) => {
  const { user } = useAuthUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Disable auto-run to prevent potential loops during diagnosis
  const [{ apiData, loading }, { reCallAPI: refresh }] = useGetDataApi<any>(
    user ? `/notifications?page=0&size=20` : null,
    [],
    {},
    false // Change to false
  );

  const [{ apiData: countData }] = useGetDataApi<any>(
    user ? `/notifications/unread-count` : null,
    { count: 0 },
    {},
    false // Change to false
  );

  // Manual trigger once when user is available
  useEffect(() => {
    if (user) {
      refresh();
      // We'd need refreshCount too, but let's test this first
    }
  }, [user, refresh]);

  useEffect(() => {
    if (apiData) {
      const actualList = apiData.data || (Array.isArray(apiData) ? apiData : []);
      setNotifications(actualList);
    }
  }, [apiData]);

  useEffect(() => {
    if (countData !== undefined) {
      const countValue = typeof countData === 'object' ? (countData.count || 0) : countData;
      setUnreadCount(Number(countValue));
    }
  }, [countData]);

  const onNotificationCreated = useCallback((message: any) => {
    if (message?.data) {
      const newNotify = message.data;
      setNotifications(prev => [newNotify, ...prev]);
      setUnreadCount(prev => prev + 1);

      if (newNotify.type === 'CARD_OVERDUE') {
        antNotification.warning({
          message: newNotify.title || 'Task Overdue',
          description: newNotify.message,
          placement: 'topRight',
          duration: 10,
        });
      } else {
        antNotification.info({
          message: newNotify.title || 'New Notification',
          description: newNotify.message,
          placement: 'topRight',
        });
      }
    }
  }, []);

  useNotificationWebSocket({
    userId: user?.id,
    enabled: !!user,
    onNotificationCreated,
  });

  const markAsRead = useCallback((id: number) => {
    putDataApi(`/notifications/${id}/read`, undefined, {}).then(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    postDataApi(`/notifications/mark-all-read`, undefined, {}).then(() => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });
  }, []);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading: false,
    markAsRead,
    markAllAsRead,
    refresh
  }), [notifications, unreadCount, markAsRead, markAllAsRead, refresh]);

  return (
    <NotificationContext.Provider value={{...value, loading: false}}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContextProvider;
