import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileService, type ProfileDto } from '../services/profileService';
import { followService } from '../services/followService';
import { playlistService, type PlaylistDto } from '../services/playlistService';
import { MoreHorizontal } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playMediaList } = usePlayer();
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [followers, setFollowers] = useState<ProfileDto[]>([]);
  const [following, setFollowing] = useState<ProfileDto[]>([]);
  const [counts, setCounts] = useState({ followersCount: 0, followingCount: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const profileData = await profileService.getProfileById(id);
          setProfile(profileData);

          const followingStatus = await followService.checkFollowStatus(id);
          setIsFollowing(followingStatus);

          const userPlaylists = await playlistService.getUserPublicPlaylists(id);
          setPlaylists(userPlaylists);

          const followCounts = await followService.getFollowCounts(id);
          setCounts(followCounts);

          const followersData = await followService.getFollowers(id);
          setFollowers(followersData);

          const followingData = await followService.getFollowing(id);
          setFollowing(followingData);
        } catch (error) {
          console.error("Lỗi khi tải hồ sơ:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [id]);

  const handleFollowToggle = async () => {
    if (!id) return;
    
    try {
      if (isFollowing) {
        await followService.unfollowUser(id);
        setIsFollowing(false);
      } else {
        await followService.followUser(id);
        setIsFollowing(true);
      }
      window.dispatchEvent(new Event('artistFollowed'));
    } catch (error) {
      alert("Lỗi khi theo dõi");
    }
  };

  const handlePlayPlaylist = async (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    try {
      const details = await playlistService.getPlaylistDetails(playlistId);
      if (details.tracks && details.tracks.length > 0) {
        playMediaList(details.tracks, 0);
      } else {
        alert("Danh sách phát này chưa có bài hát nào.");
      }
    } catch (error) {
      console.error("Failed to play playlist", error);
    }
  };

  if (loading) {
    return <div className="p-6 text-white">Đang tải...</div>;
  }

  if (!profile) {
    return <div className="p-6 text-white text-center mt-10 text-xl font-bold">Không tìm thấy người dùng</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#121212] overflow-y-auto">
      {/* Header */}
      <div
        className="flex flex-col md:flex-row items-end gap-6 px-6 pb-6 bg-gradient-to-b from-[#535353] to-[#181818] text-white shrink-0 relative z-10"
        style={{ height: 'clamp(225.9px, 30cqw, 380px)', minHeight: '225.9px' }}
      >
        {/* Avatar */}
        <div
          className="rounded-full overflow-hidden shadow-[0_4px_60px_rgba(0,0,0,0.5)] relative flex-shrink-0 bg-[#282828]"
          style={{ width: 'clamp(150px, 22cqw, 230px)', height: 'clamp(150px, 22cqw, 230px)' }}
        >
          {profile.avatarUrl ? (
            <img 
              src={profile.avatarUrl.startsWith('http') ? profile.avatarUrl : `https://tunevault-api.onrender.com${profile.avatarUrl}`} 
              alt={profile.username} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-zinc-500">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 md:w-20 md:h-20 opacity-50">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </span>
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex flex-col justify-center min-w-0 flex-1 w-full md:w-auto text-center md:text-left">
          <span className="text-sm font-bold tracking-wider mb-2 hidden md:block">Hồ sơ</span>
          <h1
            className="font-black mb-2 tracking-tighter break-words w-full leading-tight line-clamp-2"
            style={{ fontSize: 'clamp(48px, 8cqw, 108px)', lineHeight: '1.1' }}
          >
            {profile.username}
          </h1>
          {profile.bio && (
            <p className="text-zinc-200 mt-2 text-sm md:text-base font-medium max-w-2xl">
              {profile.bio}
            </p>
          )}
          <div className="flex items-center justify-center md:justify-start text-sm text-zinc-300 font-semibold mt-3">
            <span>{playlists.length} danh sách phát công khai</span>
            <span className="mx-1">•</span>
            <span>{counts.followersCount} người theo dõi</span>
            <span className="mx-1">•</span>
            <span>{counts.followingCount} đang theo dõi</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 bg-gradient-to-b from-[#181818]/80 to-[#121212] flex-1">
        
        {/* Actions (Follow, More) */}
        <div className="flex items-center gap-6 mb-8 text-zinc-400">
          <button 
            onClick={handleFollowToggle}
            className="px-8 py-2 rounded-full font-bold text-sm tracking-wider transition-all shadow-sm bg-transparent border border-zinc-500 text-white hover:border-white hover:scale-105"
          >
            {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
          </button>

          <button className="hover:text-white transition-colors">
            <MoreHorizontal size={32} />
          </button>

          {(() => {
            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            if (currentUser && currentUser.role === 'Admin') {
              return (
                <button 
                  onClick={async () => {
                    if (confirm('Admin: Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này cùng toàn bộ dữ liệu của họ?')) {
                      try {
                        await profileService.deleteProfile(id);
                        window.location.href = '/'; // Quay về trang chủ
                      } catch (error) {
                        alert('Có lỗi xảy ra khi xóa người dùng!');
                      }
                    }
                  }}
                  className="px-6 py-2 rounded-full font-bold text-sm tracking-wider transition-all shadow-sm bg-red-500/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white hover:scale-105"
                >
                  Xóa người dùng
                </button>
              );
            }
            return null;
          })()}
        </div>

        {/* Playlists Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 hover:underline cursor-pointer inline-block">Playlist Công khai</h2>
          
          {playlists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {playlists.map(playlist => (
                <div 
                  key={playlist.id} 
                  className="bg-[#181818] p-3 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer flex flex-col items-center overflow-hidden"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  <div className="relative w-full aspect-square mb-4 shadow-lg rounded-md bg-zinc-800 shrink-0">
                    {playlist.coverUrl ? (
                      <img src={playlist.coverUrl.startsWith('http') || playlist.coverUrl.startsWith('data:') ? playlist.coverUrl : playlist.coverUrl?.startsWith('http') ? playlist.coverUrl : `https://tunevault-api.onrender.com${playlist.coverUrl}`} alt={playlist.name} className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800 rounded-md">
                        <span className="text-4xl text-zinc-500">🎵</span>
                      </div>
                    )}
                    <button 
                      onClick={(e) => handlePlayPlaylist(e, playlist.id)}
                      className={`absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black transition-all duration-200 shadow-xl z-20 hover:scale-110 hover:bg-green-400 hover:shadow-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0`}
                    >
                      <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                    </button>
                  </div>
                  <div className="w-full">
                    <h3 className="text-white font-bold truncate w-full text-left mb-1">{playlist.name}</h3>
                    <p className="text-sm text-zinc-400 truncate w-full text-left">Của {profile.username}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-zinc-400 text-sm font-medium">
              Người dùng này chưa có playlist công khai nào.
            </div>
          )}
        </div>

        {/* Followers Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 hover:underline cursor-pointer inline-block">Người theo dõi</h2>
          {followers.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-y-3 -mx-6">
              {followers.map(f => (
                <div
                  key={f.id}
                  className="p-3 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer flex flex-col items-center overflow-hidden"
                  onClick={() => navigate(`/user/${f.id}`)}
                >
                  <div className="relative w-full aspect-square mb-3 shadow-lg rounded-full bg-zinc-800 shrink-0">
                    {f.avatarUrl ? (
                      <img src={f.avatarUrl.startsWith('http') || f.avatarUrl.startsWith('data:') ? f.avatarUrl : `https://tunevault-api.onrender.com${f.avatarUrl}`} alt={f.username} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl text-zinc-500">{f.username.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="w-full">
                    <h3 className="text-white font-bold truncate w-full text-center">{f.username}</h3>
                    <p className="text-sm text-zinc-400 truncate w-full text-center mt-1">Hồ sơ</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-zinc-400 text-sm font-medium">
              Chưa có người theo dõi nào.
            </div>
          )}
        </div>

        {/* Following Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 hover:underline cursor-pointer inline-block">Đang theo dõi</h2>
          {following.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-y-3 -mx-6">
              {following.map(f => (
                <div
                  key={f.id}
                  className="p-3 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer flex flex-col items-center overflow-hidden"
                  onClick={() => navigate(`/user/${f.id}`)}
                >
                  <div className="relative w-full aspect-square mb-3 shadow-lg rounded-full bg-zinc-800 shrink-0">
                    {f.avatarUrl ? (
                      <img src={f.avatarUrl.startsWith('http') || f.avatarUrl.startsWith('data:') ? f.avatarUrl : `https://tunevault-api.onrender.com${f.avatarUrl}`} alt={f.username} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl text-zinc-500">{f.username.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="w-full">
                    <h3 className="text-white font-bold truncate w-full text-center">{f.username}</h3>
                    <p className="text-sm text-zinc-400 truncate w-full text-center mt-1">Hồ sơ</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-zinc-400 text-sm font-medium">
              Chưa theo dõi ai.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
