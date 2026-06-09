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
  coverUrl?: string;
  artistName?: string;
  artistBio?: string;
  artistAvatarUrl?: string;
}

export interface LoginResponseDto {
  userId: string;
  username: string;
  avatarUrl?: string;
  token: string;
}
