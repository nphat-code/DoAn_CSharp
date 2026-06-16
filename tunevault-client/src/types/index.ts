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
  albumTitle?: string;
}

export interface LoginResponseDto {
  userId: string;
  username: string;
  avatarUrl?: string;
  token: string;
}

export interface ArtistDto {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface PlaylistDto {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  createdAt: string;
  userProfileId: string;
}

export interface SearchResultDto {
  tracks: MediaItemDto[];
  artists: ArtistDto[];
  playlists: PlaylistDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}
