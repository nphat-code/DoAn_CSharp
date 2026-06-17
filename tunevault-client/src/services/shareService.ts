import apiClient from './apiClient';

export interface ShareMediaRequest {
  receiverId: string;
  mediaId: string;
  message?: string;
}

export interface MediaShareDto {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  receiverId: string;
  mediaItemId: string;
  mediaTitle: string;
  mediaCoverUrl?: string;
  mediaType: string;
  mediaArtistName?: string;
  message?: string;
  createdAt: string;
}

export const shareService = {
  shareMedia: async (request: ShareMediaRequest): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/share', request);
    return response.data;
  },

  getSharedWithMe: async (): Promise<MediaShareDto[]> => {
    const response = await apiClient.get('/share/me');
    return response.data;
  },

  getSharedByMe: async (): Promise<MediaShareDto[]> => {
    const response = await apiClient.get('/share/by-me');
    return response.data;
  }
};
