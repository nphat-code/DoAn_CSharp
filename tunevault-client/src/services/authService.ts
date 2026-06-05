import apiClient from './apiClient';
import type { LoginResponseDto } from '../types';

export const authService = {
  login: async (command: any): Promise<LoginResponseDto> => {
    const response = await apiClient.post<LoginResponseDto>('/auth/login', command);
    
    // Lưu Token vào LocalStorage ngay sau khi đăng nhập thành công
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  register: async (command: any): Promise<LoginResponseDto> => {
    const response = await apiClient.post<LoginResponseDto>('/auth/register', command);
    
    // Lưu Token vào LocalStorage ngay sau khi đăng ký (do backend trả về token)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};
