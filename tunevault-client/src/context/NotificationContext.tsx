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

    // Fetch existing notifications
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
      // Delay to let the page fully settle after redirect (window.location.href = '/')
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Re-check token (it may have been cleared by a 401 interceptor)
      const currentToken = localStorage.getItem('token');
      if (!currentToken || isCancelled) return;

      connection = new signalR.HubConnectionBuilder()
        .withUrl((import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://tunevault-api.onrender.com') + "/hubs/notifications", {
          accessTokenFactory: () => localStorage.getItem('token') || ''
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Error)
        .build();

      // Listen for real-time notifications
      connection.on("ReceiveNotification", (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      // Retry with exponential backoff
      const maxRetries = 3;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (isCancelled) return;
        try {
          await connection.start();
          console.log("SignalR Connected!");
          return; // success — stop retrying
        } catch {
          if (attempt < maxRetries - 1) {
            const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          // Silent retry — no console noise
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
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await apiClient.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    const previous = [...notifications];
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await apiClient.put(`/notifications/read-all`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert
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
