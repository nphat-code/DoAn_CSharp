import apiClient from './apiClient';
import type { MediaItemDto } from '../types';

export const mediaService = {
  // Lấy danh sách bài hát/playlist từ API
  getLibraryPlaylists: async (): Promise<MediaItemDto[]> => {
    // Tạm thời mock data vì Backend chưa có API GET /api/media
    return [
      {
        id: "e0b23267-d86b-4e14-ad26-dfecaf915cda",
        title: "Blinding Lights",
        fileUrl: "/media/test.mp3",
        mediaType: "Audio",
        duration: "00:03:20",
        uploaderId: "",
        createdAt: new Date().toISOString()
      }
    ];
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
