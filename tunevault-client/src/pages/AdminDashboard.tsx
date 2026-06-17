import { useEffect, useState } from 'react';
import { mediaService } from '../services/mediaService';
import { albumService } from '../services/albumService';
import type { AlbumDto } from '../services/albumService';
import { artistService } from '../services/artistService';
import type { ArtistDto } from '../services/artistService';
import type { MediaItemDto } from '../types';
import { Trash2, Music, Disc, User, ShieldAlert } from 'lucide-react';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'tracks' | 'albums' | 'artists'>('tracks');
  const [tracks, setTracks] = useState<MediaItemDto[]>([]);
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  const [artists, setArtists] = useState<ArtistDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTracks = async () => {
    try {
      const data = await mediaService.getAllMedia();
      setTracks(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAlbums = async () => {
    try {
      const data = await albumService.getAllAlbums();
      setAlbums(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchArtists = async () => {
    try {
      const data = await artistService.getAllArtists();
      setArtists(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === 'tracks') await fetchTracks();
      if (activeTab === 'albums') await fetchAlbums();
      if (activeTab === 'artists') await fetchArtists();
      setLoading(false);
    };
    loadData();
  }, [activeTab]);

  const handleDeleteTrack = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài hát này?")) return;
    try {
      await mediaService.deleteMedia(id);
      setTracks(tracks.filter(t => t.id !== id));
      alert("Xóa thành công!");
    } catch (error) {
      console.error(error);
      alert("Lỗi khi xóa bài hát");
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa Album này?")) return;
    try {
      await albumService.deleteAlbum(id);
      setAlbums(albums.filter(a => a.id !== id));
      alert("Xóa thành công!");
    } catch (error) {
      console.error(error);
      alert("Lỗi khi xóa Album");
    }
  };

  const handleDeleteArtist = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa Nghệ sĩ này? Cảnh báo: Việc này sẽ XÓA TOÀN BỘ Bài hát và Album của họ!")) return;
    try {
      await artistService.deleteArtist(id);
      setArtists(artists.filter(a => a.id !== id));
      alert("Xóa thành công!");
    } catch (error) {
      console.error(error);
      alert("Lỗi khi xóa Nghệ sĩ");
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 p-8 overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <ShieldAlert size={40} className="text-red-500" />
        <h1 className="text-4xl font-bold text-white tracking-tight">Quản trị Hệ thống</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-zinc-800 pb-2">
        <button 
          onClick={() => setActiveTab('tracks')}
          className={`flex items-center gap-2 px-4 py-2 font-bold rounded-md transition ${activeTab === 'tracks' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          <Music size={20} /> Bài hát
        </button>
        <button 
          onClick={() => setActiveTab('albums')}
          className={`flex items-center gap-2 px-4 py-2 font-bold rounded-md transition ${activeTab === 'albums' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          <Disc size={20} /> Album
        </button>
        <button 
          onClick={() => setActiveTab('artists')}
          className={`flex items-center gap-2 px-4 py-2 font-bold rounded-md transition ${activeTab === 'artists' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          <User size={20} /> Nghệ sĩ
        </button>
      </div>

      {/* Content */}
      <div className="bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Đang tải dữ liệu...</div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase font-bold sticky top-0">
              <tr>
                <th className="px-6 py-4">Tên</th>
                {activeTab === 'tracks' && <th className="px-6 py-4">Nghệ sĩ</th>}
                {activeTab === 'albums' && <th className="px-6 py-4">Nghệ sĩ</th>}
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {/* TRACKS */}
              {activeTab === 'tracks' && tracks.map(track => (
                <tr key={track.id} className="hover:bg-zinc-800/50 transition">
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                    {track.coverUrl ? (
                      <img src={track.coverUrl.startsWith('http') ? track.coverUrl : `https://tunevault-api.onrender.com${track.coverUrl}`} className="w-10 h-10 rounded bg-zinc-800 object-cover" alt="cover" />
                    ) : <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center"><Music size={16}/></div>}
                    {track.title}
                  </td>
                  <td className="px-6 py-4">{track.artistName}</td>
                  <td className="px-6 py-4">{new Date(track.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeleteTrack(track.id)} className="text-zinc-500 hover:text-red-500 transition p-2 bg-zinc-800 rounded hover:bg-zinc-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {/* ALBUMS */}
              {activeTab === 'albums' && albums.map(album => (
                <tr key={album.id} className="hover:bg-zinc-800/50 transition">
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                    {album.coverUrl ? (
                      <img src={album.coverUrl.startsWith('http') ? album.coverUrl : `https://tunevault-api.onrender.com${album.coverUrl}`} className="w-10 h-10 rounded bg-zinc-800 object-cover" alt="cover" />
                    ) : <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center"><Disc size={16}/></div>}
                    {album.title}
                  </td>
                  <td className="px-6 py-4">{album.artistName}</td>
                  <td className="px-6 py-4">{new Date(album.releaseDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeleteAlbum(album.id)} className="text-zinc-500 hover:text-red-500 transition p-2 bg-zinc-800 rounded hover:bg-zinc-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {/* ARTISTS */}
              {activeTab === 'artists' && artists.map(artist => (
                <tr key={artist.id} className="hover:bg-zinc-800/50 transition">
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                    {artist.avatarUrl ? (
                      <img src={artist.avatarUrl.startsWith('http') ? artist.avatarUrl : `https://tunevault-api.onrender.com${artist.avatarUrl}`} className="w-10 h-10 rounded-full bg-zinc-800 object-cover" alt="avatar" />
                    ) : <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center"><User size={16}/></div>}
                    {artist.name}
                  </td>
                  <td className="px-6 py-4">{new Date(artist.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeleteArtist(artist.id)} className="text-zinc-500 hover:text-red-500 transition p-2 bg-zinc-800 rounded hover:bg-zinc-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && 
               ((activeTab === 'tracks' && tracks.length === 0) || 
               (activeTab === 'albums' && albums.length === 0) || 
               (activeTab === 'artists' && artists.length === 0)) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
