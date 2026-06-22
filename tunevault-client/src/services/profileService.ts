import apiClient from './apiClient';

export interface ProfileDto {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

export const profileService = {
  getProfile: async (): Promise<ProfileDto> => {
    const response = await apiClient.get<{success: boolean, data: ProfileDto}>('/profile');
    return response.data.data;
  },

  getProfileById: async (id: string): Promise<ProfileDto> => {
    const response = await apiClient.get<{success: boolean, data: ProfileDto}>(`/profile/${id}`);
    return response.data.data;
  },

  updateAvatar: async (avatarUrl: string): Promise<boolean> => {
    // Send raw string by setting headers correctly, or wrap in quotes to act as JSON string
    const response = await apiClient.put<{success: boolean}>('/profile/avatar', `"${avatarUrl}"`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data.success;
  },

  updateProfile: async (data: { username: string, avatarUrl?: string, bio?: string }): Promise<boolean> => {
    const response = await apiClient.put<{success: boolean}>('/profile', data);
    return response.data.success;
  },

  searchUsers: async (query: string): Promise<ProfileDto[]> => {
    const response = await apiClient.get<ProfileDto[]>(`/profile/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  deleteProfile: async (id?: string): Promise<boolean> => {
    const url = id ? `/profile/${id}` : '/profile';
    const response = await apiClient.delete<{success: boolean}>(url);
    return response.data.success;
  }
};
