import { useEffect, useState } from 'react';
import { profileService, type ProfileDto } from '../services/profileService';
import { User, Mail, Calendar, Edit2, Check } from 'lucide-react';

export const Profile = () => {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setAvatarUrlInput(data.avatarUrl || '');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvatar = async () => {
    try {
      await profileService.updateAvatar(avatarUrlInput);
      setIsEditing(false);
      loadProfile(); // Reload to get updated data
    } catch (error) {
      console.error("Lỗi khi cập nhật avatar:", error);
      alert("Cập nhật avatar thất bại!");
    }
  };

  if (loading) return <div className="text-zinc-400 p-8">Đang tải thông tin...</div>;
  if (!profile) return <div className="text-zinc-400 p-8">Không thể tải thông tin cá nhân.</div>;

  const joinedDate = new Date(profile.createdAt).toLocaleDateString('vi-VN');

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-zinc-900 rounded-xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-xl">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 rounded-full overflow-hidden bg-zinc-800 shadow-2xl relative group">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <span className="text-6xl font-bold text-white">{profile.username.charAt(0).toUpperCase()}</span>
              </div>
            )}
            
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="text-white w-8 h-8" />
            </button>
          </div>

          {isEditing && (
            <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
              <input 
                type="text" 
                value={avatarUrlInput}
                onChange={e => setAvatarUrlInput(e.target.value)}
                placeholder="Nhập link ảnh (URL)..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveAvatar}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md py-1.5 text-sm flex items-center justify-center gap-1 transition"
                >
                  <Check size={16} /> Lưu
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md py-1.5 text-sm transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 w-full space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2">{profile.username}</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">
              Thành viên TuneVault
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="bg-zinc-800/50 p-4 rounded-lg flex items-center gap-4">
              <div className="p-3 bg-zinc-800 rounded-full text-indigo-400">
                <User size={24} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Username</p>
                <p className="text-white font-medium">{profile.username}</p>
              </div>
            </div>

            <div className="bg-zinc-800/50 p-4 rounded-lg flex items-center gap-4">
              <div className="p-3 bg-zinc-800 rounded-full text-indigo-400">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Email</p>
                <p className="text-white font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="bg-zinc-800/50 p-4 rounded-lg flex items-center gap-4 sm:col-span-2">
              <div className="p-3 bg-zinc-800 rounded-full text-indigo-400">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Ngày tham gia</p>
                <p className="text-white font-medium">{joinedDate}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
