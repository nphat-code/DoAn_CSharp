import apiClient from './apiClient';

export const followService = {
  followUser: async (userId: string): Promise<boolean> => {
    const response = await apiClient.post<{success: boolean}>(`/follow/${userId}`);
    return response.data.success;
  },

  unfollowUser: async (userId: string): Promise<boolean> => {
    const response = await apiClient.delete<{success: boolean}>(`/follow/${userId}`);
    return response.data.success;
  },

  checkFollowStatus: async (userId: string): Promise<boolean> => {
    const response = await apiClient.get<{isFollowing: boolean}>(`/follow/status/${userId}`);
    return response.data.isFollowing;
  },

  getFollowers: async (userId: string): Promise<any[]> => {
    const response = await apiClient.get<{success: boolean, data: any[]}>(`/follow/${userId}/followers`);
    return response.data.data;
  },

  getFollowing: async (userId: string): Promise<any[]> => {
    const response = await apiClient.get<{success: boolean, data: any[]}>(`/follow/${userId}/following`);
    return response.data.data;
  },

  getFollowCounts: async (userId: string): Promise<{followersCount: number, followingCount: number}> => {
    const response = await apiClient.get<{success: boolean, data: {followersCount: number, followingCount: number}}>(`/follow/${userId}/counts`);
    return response.data.data;
  }
};
