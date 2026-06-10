import apiClient from './apiClient';
import type { MediaItemDto } from '../types';

export interface AlbumDto {
  id: string;
  title: string;
  coverUrl?: string;
  releaseDate: string;
  artistId: string;
  artistName: string;
}

export interface AlbumDetailDto extends AlbumDto {
  artistImageUrl?: string;
  tracks: MediaItemDto[];
}

export const albumService = {
  getAllAlbums: async (): Promise<AlbumDto[]> => {
    const response = await apiClient.get<{success: boolean, data: AlbumDto[]}>('/albums');
    return response.data.data;
  },

  getAlbumById: async (id: string): Promise<AlbumDetailDto> => {
    const response = await apiClient.get<{success: boolean, data: AlbumDetailDto}>(`/albums/${id}`);
    return response.data.data;
  },

  createAlbum: async (formData: FormData): Promise<void> => {
    await apiClient.post('/albums', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  addTrackToAlbum: async (albumId: string, trackId: string): Promise<void> => {
    await apiClient.post(`/albums/${albumId}/tracks`, { trackId });
  },

  deleteAlbum: async (id: string): Promise<void> => {
    await apiClient.delete(`/albums/${id}`);
  }
};
