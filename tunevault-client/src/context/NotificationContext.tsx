import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';

interface Notification {
  id?: string;
  message: string;
  type: string;
  createdAt: string;
  isRead?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // 1. Khởi tạo kết nối SignalR Hub
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5183/hubs/notifications", {
        accessTokenFactory: () => token // Tự động đính kèm Token JWT vào header
      })
      .withAutomaticReconnect()
      .build();

    // 2. Lắng nghe Event từ Backend
    connection.on("ReceiveNotification", (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1); // Tăng badge đỏ khi có thông báo mới
    });

    // 3. Khởi động kết nối
    connection.start()
      .then(() => console.log("SignalR Connected!"))
      .catch(err => console.error("SignalR Connection Error: ", err));

    return () => {
      connection.stop();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount }}>
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
