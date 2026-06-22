import { getImageUrl } from '../utils/imageUrl';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UploadCloud, Music } from 'lucide-react';
import { mediaService } from '../services/mediaService';
import { artistService, type ArtistDto } from '../services/artistService';
import { albumService, type AlbumDto } from '../services/albumService';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
  albumId?: string;
  artistId?: string;
}

export const UploadModal = ({ onClose, onSuccess, albumId: initialAlbumId, artistId: initialArtistId }: UploadModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState(initialArtistId || '');
  const [selectedAlbumId, setSelectedAlbumId] = useState(initialAlbumId || '');
  const [file, setFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<ArtistDto[]>([]);
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  
  const [artistSearchText, setArtistSearchText] = useState('');
  const [showArtistSuggestions, setShowArtistSuggestions] = useState(false);
  
  const [albumSearchText, setAlbumSearchText] = useState('');
  const [showAlbumSuggestions, setShowAlbumSuggestions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistsData, albumsData] = await Promise.all([
          artistService.getAllArtists(),
          albumService.getAllAlbums()
        ]);
        setArtists(artistsData);
        setAlbums(albumsData);

        // Pre-fill text if initial IDs are provided
        if (initialArtistId) {
          const artist = artistsData.find(a => a.id === initialArtistId);
          if (artist) setArtistSearchText(artist.name);
        }
        if (initialAlbumId) {
          const album = albumsData.find(a => a.id === initialAlbumId);
          if (album) setAlbumSearchText(album.title);
        }
      } catch (err) {
        console.error("Failed to load artists/albums", err);
      }
    };
    fetchData();
  }, [initialArtistId, initialAlbumId]);

  const filteredArtists = artists.filter(a => 
    a.name.toLowerCase().includes(artistSearchText.toLowerCase())
  );

  const filteredAlbums = albums
    .filter(a => !selectedArtistId || a.artistId === selectedArtistId)
    .filter(a => a.title.toLowerCase().includes(albumSearchText.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      if (description) formData.append('description', description);
      formData.append('file', file);
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }
      if (selectedAlbumId) {
        formData.append('albumId', selectedAlbumId);
      }
      if (selectedArtistId) {
        formData.append('artistId', selectedArtistId);
      }

      await mediaService.uploadMedia(formData);
      alert("Tải nhạc lên thành công!");
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Tải lên thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-[#282828] rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <h2 className="text-xl font-bold text-white">Tải nhạc lên</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden min-h-0 flex-1">
          <div className="p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar min-h-0 flex-1">
            {/* File input */}
            <div 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition ${file ? 'border-green-500 bg-green-500/10' : 'border-zinc-500 hover:border-white hover:bg-white/5'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <>
                  <Music size={40} className="text-green-500" />
                  <span className="text-white font-medium text-center break-all">{file.name}</span>
                  <span className="text-xs text-green-500 font-bold">Đã chọn file</span>
                </>
              ) : (
                <>
                  <UploadCloud size={40} className="text-zinc-400" />
                  <span className="text-white font-medium">Nhấn để chọn file nhạc</span>
                  <span className="text-xs text-zinc-400">Hỗ trợ MP3, WAV, MP4</span>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="audio/*,video/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                    // Tự động điền tiêu đề từ tên file nếu chưa có
                    if (!title) {
                      const fileName = e.target.files[0].name.replace(/\.[^/.]+$/, "");
                      setTitle(fileName);
                    }
                  }
                }} 
              />
            </div>

            {/* Cover Image Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-white">Ảnh bìa (Không bắt buộc)</label>
              <div 
                className="w-32 h-32 bg-[#3E3E3E] rounded-md flex items-center justify-center cursor-pointer hover:bg-[#4E4E4E] transition overflow-hidden group relative"
                onClick={() => coverImageInputRef.current?.click()}
              >
                {coverImage ? (
                  <img src={URL.createObjectURL(coverImage)} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-zinc-400 text-xs text-center p-2">Nhấn để chọn ảnh bìa</span>
                )}
                {coverImage && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <span className="text-white text-xs font-bold">Thay đổi</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={coverImageInputRef} 
                  className="hidden" 
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCoverImage(e.target.files[0]);
                    }
                  }} 
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-white">Tên bài hát / Tiêu đề <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#3E3E3E] text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-white placeholder-zinc-400"
                placeholder="VD: Perfect"
                required
              />
            </div>

            <div className="flex flex-col gap-4">
              {/* Autocomplete Nghệ sĩ */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-bold text-white">Nghệ sĩ</label>
                <input 
                  type="text" 
                  value={artistSearchText}
                  onChange={(e) => {
                    setArtistSearchText(e.target.value);
                    setSelectedArtistId(''); // Xóa ID nếu người dùng gõ text mới
                    setShowArtistSuggestions(true);
                  }}
                  onFocus={() => setShowArtistSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowArtistSuggestions(false), 200)}
                  className="bg-[#3E3E3E] text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-white placeholder-zinc-400"
                  placeholder="VD: Sơn Tùng M-TP"
                  disabled={!!initialArtistId}
                />
                {showArtistSuggestions && artistSearchText && filteredArtists.length > 0 && !initialArtistId && (
                  <div className="absolute top-[100%] left-0 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto">
                    {filteredArtists.map(artist => (
                      <div
                        key={artist.id}
                        className="px-4 py-2 hover:bg-zinc-700 cursor-pointer text-white flex items-center gap-3 transition-colors"
                        onClick={() => {
                          setArtistSearchText(artist.name);
                          setSelectedArtistId(artist.id);
                          setShowArtistSuggestions(false);
                        }}
                      >
                        {artist.avatarUrl ? (
                          <img src={getImageUrl(artist.avatarUrl)} alt={artist.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-zinc-600 flex items-center justify-center text-xs">
                            {artist.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{artist.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Autocomplete Album */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-bold text-white">Album</label>
                <input 
                  type="text" 
                  value={albumSearchText}
                  onChange={(e) => {
                    setAlbumSearchText(e.target.value);
                    setSelectedAlbumId(''); // Xóa ID nếu người dùng gõ text mới
                    setShowAlbumSuggestions(true);
                  }}
                  onFocus={() => setShowAlbumSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowAlbumSuggestions(false), 200)}
                  className="bg-[#3E3E3E] text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-white placeholder-zinc-400"
                  placeholder="VD: Chúng ta của hiện tại"
                  disabled={!!initialAlbumId}
                />
                {showAlbumSuggestions && albumSearchText && filteredAlbums.length > 0 && !initialAlbumId && (
                  <div className="absolute top-[100%] left-0 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto">
                    {filteredAlbums.map(album => (
                      <div
                        key={album.id}
                        className="px-4 py-2 hover:bg-zinc-700 cursor-pointer text-white flex items-center gap-3 transition-colors"
                        onClick={() => {
                          setAlbumSearchText(album.title);
                          setSelectedAlbumId(album.id);
                          setShowAlbumSuggestions(false);
                          
                          // Tự động điền nghệ sĩ nếu chưa chọn
                          if (!selectedArtistId) {
                            setSelectedArtistId(album.artistId);
                            const artist = artists.find(a => a.id === album.artistId);
                            if (artist) setArtistSearchText(artist.name);
                          }
                        }}
                      >
                        {album.coverUrl ? (
                          <img src={getImageUrl(album.coverUrl)} alt={album.title} className="w-6 h-6 rounded-md object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-md bg-zinc-600 flex items-center justify-center text-xs">
                            <Music size={12} />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm">{album.title}</span>
                          <span className="text-xs text-zinc-400">
                            {artists.find(a => a.id === album.artistId)?.name || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-white">Mô tả thêm (Không bắt buộc)</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-[#3E3E3E] text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-white placeholder-zinc-400"
                placeholder="VD: Bản thu âm trực tiếp năm 2024"
              />
            </div>
          </div>

          <div className="p-4 flex justify-end gap-3 border-t border-white/10 shrink-0 bg-[#282828]">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 font-bold text-white hover:scale-105 transition"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading || !file || !title}
              className="bg-green-500 text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
            >
              {loading ? 'Đang tải lên...' : 'Tải lên'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
