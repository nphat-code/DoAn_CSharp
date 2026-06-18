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

    // 1. Khởi tạo kết nối SignalR Hub
    const connection = new signalR.HubConnectionBuilder()
      .withUrl((import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://tunevault-api.onrender.com') + "/hubs/notifications", {
        accessTokenFactory: () => token // Tự động đính kèm Token JWT vào header
      })
      .withAutomaticReconnect()
      .build();

    // 2. Lắng nghe Event từ Backend
    connection.on("ReceiveNotification", (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    // 3. Khởi động kết nối
    connection.start()
      .then(() => console.log("SignalR Connected!"))
      .catch(err => console.error("SignalR Connection Error: ", err));

    return () => {
      connection.stop();
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put(`/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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
