import apiClient from './apiClient';

export interface ProfileDto {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export const profileService = {
  getProfile: async (): Promise<ProfileDto> => {
    const response = await apiClient.get<{success: boolean, data: ProfileDto}>('/profile');
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
  }
};
