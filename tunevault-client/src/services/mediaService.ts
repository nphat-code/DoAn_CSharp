import apiClient from './apiClient';
import type { MediaItemDto, SearchResultDto } from '../types';

export const mediaService = {
  getAllMedia: async (): Promise<MediaItemDto[]> => {
    const response = await apiClient.get<{success: boolean, data: MediaItemDto[]}>('/media');
    return response.data.data;
  },

  searchMedia: async (query: string, page: number = 1, pageSize: number = 10): Promise<SearchResultDto> => {
    const response = await apiClient.get<{success: boolean, data: SearchResultDto}>('/media/search', {
      params: { q: query, page, pageSize }
    });
    return response.data.data;
  },

  
  uploadMedia: async (formData: FormData): Promise<MediaItemDto> => {
    const response = await apiClient.post<MediaItemDto>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });
    return response.data;
  },

  recordPlayHistory: async (mediaId: string): Promise<void> => {
    await apiClient.post(`/history/play/${mediaId}`);
  },

  getRecentHistory: async (limit: number = 10): Promise<any[]> => {
    const response = await apiClient.get<{success: boolean, data: any[]}>('/history', {
      params: { limit }
    });
    return response.data.data;
  },

  toggleFavorite: async (mediaId: string): Promise<{ isFavorited: boolean }> => {
    const response = await apiClient.post<{ isFavorited: boolean }>(`/favorites/toggle/${mediaId}`);
    return response.data;
  },

  checkFavorite: async (mediaId: string): Promise<{ isFavorited: boolean }> => {
    const response = await apiClient.get<{ isFavorited: boolean }>(`/favorites/check/${mediaId}`);
    return response.data;
  },

  getFavorites: async (): Promise<MediaItemDto[]> => {
    const response = await apiClient.get<{success: boolean, data: MediaItemDto[]}>('/favorites');
    return response.data.data;
  },

  deleteMedia: async (id: string): Promise<void> => {
    await apiClient.delete(`/media/${id}`);
  }
};
