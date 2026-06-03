export interface UserProfileDto {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface MediaItemDto {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  mediaType: string;
  duration: string;
  uploaderId: string;
  createdAt: string;
}

export interface LoginResponseDto {
  userId: string;
  username: string;
  token: string;
}
