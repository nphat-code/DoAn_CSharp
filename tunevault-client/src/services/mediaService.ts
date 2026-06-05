import apiClient from './apiClient';
import type { MediaItemDto } from '../types';

export const mediaService = {
  getLibraryPlaylists: async (): Promise<MediaItemDto[]> => {
    const response = await apiClient.get<{success: boolean, data: MediaItemDto[]}>('/media');
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
  }
};
