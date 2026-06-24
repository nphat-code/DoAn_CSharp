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

  getUserPublicPlaylists: async (userId: string): Promise<PlaylistDto[]> => {
    const response = await apiClient.get<{success: boolean, data: PlaylistDto[]}>(`/playlists/user/${userId}`);
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
    window.dispatchEvent(new Event('playlistsUpdated'));
    return response.data.data;
  },

  updatePlaylist: async (id: string, name: string, description?: string, coverUrl?: string | null, isPublic?: boolean): Promise<void> => {
    await apiClient.put(`/playlists/${id}`, {
      name,
      description,
      coverUrl: coverUrl === null ? "" : coverUrl,
      isPublic
    });
    window.dispatchEvent(new Event('playlistsUpdated'));
  },

  deletePlaylist: async (id: string): Promise<void> => {
    await apiClient.delete(`/playlists/${id}`);
    window.dispatchEvent(new Event('playlistsUpdated'));
  },

  addTrackToPlaylist: async (playlistId: string, mediaItemId: string): Promise<void> => {
    await apiClient.post(`/playlists/${playlistId}/tracks/${mediaItemId}`);
  },

  removeTrackFromPlaylist: async (playlistId: string, mediaItemId: string): Promise<void> => {
    await apiClient.delete(`/playlists/${playlistId}/tracks/${mediaItemId}`);
  }
};
