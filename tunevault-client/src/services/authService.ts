import apiClient from './apiClient';
import type { LoginResponseDto } from '../types';

export const authService = {
  login: async (command: any): Promise<LoginResponseDto> => {
    const response = await apiClient.post<any>('/auth/login', command);
    
    // Backend trả về { success: true, data: { token, ... } }
    const result = response.data.data || response.data;

    // Lưu Token vào LocalStorage ngay sau khi đăng nhập thành công
    if (result.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result));
    }
    return result;
  },

  register: async (command: any): Promise<LoginResponseDto> => {
    const response = await apiClient.post<any>('/auth/register', command);
    
    // Backend trả về { success: true, data: { token, ... } }
    const result = response.data.data || response.data;

    // Lưu Token vào LocalStorage ngay sau khi đăng ký (do backend trả về token)
    if (result.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result));
    }
    return result;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};
