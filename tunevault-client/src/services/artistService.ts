import apiClient from './apiClient';

export interface ArtistDto {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  realMonthlyListeners: number;
}

export const artistService = {
  createArtist: async (formData: FormData) => {
    const response = await apiClient.post('/artists', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllArtists: async (): Promise<ArtistDto[]> => {
    const response = await apiClient.get('/artists');
    return response.data.data;
  },

  deleteArtist: async (id: string) => {
    const response = await apiClient.delete(`/artists/${id}`);
    return response.data;
  },

  followArtist: async (id: string): Promise<boolean> => {
    const response = await apiClient.post<{success: boolean, data: boolean}>(`/artists/${id}/follow`);
    return response.data.data;
  },

  unfollowArtist: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<{success: boolean, data: boolean}>(`/artists/${id}/follow`);
    return response.data.data;
  },

  getFollowStatus: async (id: string): Promise<boolean> => {
    const response = await apiClient.get<{success: boolean, data: boolean}>(`/artists/${id}/follow-status`);
    return response.data.data;
  },

  getFollowedArtists: async (): Promise<ArtistDto[]> => {
    const response = await apiClient.get<{ success: boolean, data: ArtistDto[] }>('/artists/followed');
    return response.data.data;
  }
};
