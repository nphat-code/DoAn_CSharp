import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';
import apiClient from '../services/apiClient';

interface Notification {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get('/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    let connection: signalR.HubConnection | null = null;
    let isCancelled = false;

    const startConnection = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const currentToken = localStorage.getItem('token');
      if (!currentToken || isCancelled) return;

      connection = new signalR.HubConnectionBuilder()
        .withUrl((import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://tunevault-api.onrender.com') + "/hubs/notifications", {
          accessTokenFactory: () => localStorage.getItem('token') || ''
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Error)
        .build();

      connection.on("ReceiveNotification", (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      const maxRetries = 3;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (isCancelled) return;
        try {
          await connection.start();
          console.log("SignalR Connected!");
          return;
        } catch {
          if (attempt < maxRetries - 1) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    };

    startConnection();

    return () => {
      isCancelled = true;
      connection?.stop();
    };
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await apiClient.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
    }
  };

  const markAllAsRead = async () => {
    const previous = [...notifications];
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await apiClient.put(`/notifications/read-all`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setNotifications(previous);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      isDropdownOpen,
      setIsDropdownOpen
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
