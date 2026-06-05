import apiClient from './apiClient';
import type { MediaItemDto } from '../types';

export interface PlaylistDto {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  createdAt: string;
  userProfileId: string;
}

export interface PlaylistDetailDto extends PlaylistDto {
  tracks: MediaItemDto[];
}

export const playlistService = {
  getUserPlaylists: async (): Promise<PlaylistDto[]> => {
    const response = await apiClient.get<{success: boolean, data: PlaylistDto[]}>('/playlists');
    return response.data.data;
  },

  getPlaylistDetails: async (id: string): Promise<PlaylistDetailDto> => {
    const response = await apiClient.get<{success: boolean, data: PlaylistDetailDto}>(`/playlists/${id}`);
    return response.data.data;
  },

  createPlaylist: async (name: string, description?: string, isPublic: boolean = false): Promise<PlaylistDto> => {
    const response = await apiClient.post<{success: boolean, data: PlaylistDto}>('/playlists', {
      name,
      description,
      isPublic
    });
    return response.data.data;
  },

  deletePlaylist: async (id: string): Promise<void> => {
    await apiClient.delete(`/playlists/${id}`);
  },

  addTrackToPlaylist: async (playlistId: string, mediaItemId: string): Promise<void> => {
    await apiClient.post(`/playlists/${playlistId}/tracks/${mediaItemId}`);
  },

  removeTrackFromPlaylist: async (playlistId: string, mediaItemId: string): Promise<void> => {
    await apiClient.delete(`/playlists/${playlistId}/tracks/${mediaItemId}`);
  }
};
