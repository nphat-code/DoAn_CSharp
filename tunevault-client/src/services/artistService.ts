import apiClient from './apiClient';

export interface ArtistDto {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
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
  }
};
