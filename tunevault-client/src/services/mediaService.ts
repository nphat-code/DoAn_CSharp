import apiClient from './apiClient';
import type { MediaItemDto } from '../types';

export const mediaService = {
  getLibraryPlaylists: async (): Promise<MediaItemDto[]> => {
    const response = await apiClient.get<{success: boolean, data: MediaItemDto[]}>('/media');
    return response.data.data;
  },

  searchMedia: async (query: string): Promise<MediaItemDto[]> => {
    const response = await apiClient.get<{success: boolean, data: MediaItemDto[]}>('/media/search', {
      params: { q: query }
    });
    return response.data.data;
  },

  // Upload file nhạc kèm form data (multipart/form-data)
  uploadMedia: async (formData: FormData): Promise<MediaItemDto> => {
    const response = await apiClient.post<MediaItemDto>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Ghi đè header mặc định
      },
    });
    return response.data;
  },

  recordPlayHistory: async (mediaId: string): Promise<void> => {
    await apiClient.post(`/history/play/${mediaId}`);
  },

  toggleFavorite: async (mediaId: string): Promise<{ isFavorited: boolean }> => {
    const response = await apiClient.post<{ isFavorited: boolean }>(`/favorites/toggle/${mediaId}`);
    return response.data;
  },

  checkFavorite: async (mediaId: string): Promise<{ isFavorited: boolean }> => {
    const response = await apiClient.get<{ isFavorited: boolean }>(`/favorites/check/${mediaId}`);
    return response.data;
  },

  deleteMedia: async (id: string): Promise<void> => {
    await apiClient.delete(`/media/${id}`);
  }
};
