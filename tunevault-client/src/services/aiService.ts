import apiClient from './apiClient';
import type { MediaItemDto } from '../types';

export const aiService = {
  getRecommendations: async (): Promise<MediaItemDto[]> => {
    try {
      const response = await apiClient.get('/ai/recommendations');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching AI recommendations', error);
      return [];
    }
  }
};
