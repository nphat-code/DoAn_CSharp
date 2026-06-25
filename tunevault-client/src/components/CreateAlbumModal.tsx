import { getImageUrl } from '../utils/imageUrl';
import { useState, useEffect } from 'react';
import { Upload, X, Disc } from 'lucide-react';
import { albumService } from '../services/albumService';
import { artistService, type ArtistDto } from '../services/artistService';

interface CreateAlbumModalProps {
  onClose: () => void;
}

export const CreateAlbumModal = ({ onClose }: CreateAlbumModalProps) => {
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allArtists, setAllArtists] = useState<ArtistDto[]>([]);
  const [showArtistSuggestions, setShowArtistSuggestions] = useState(false);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const artists = await artistService.getAllArtists();
        setAllArtists(artists);
      } catch (error) {
        console.error("Lỗi khi tải danh sách nghệ sĩ:", error);
      }
    };
    fetchArtists();
  }, []);

  const filteredArtists = allArtists.filter(a => 
    a.name.toLowerCase().includes(artistName.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artistName) {
      alert("Vui lòng nhập tên Album và Nghệ sĩ.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('artistName', artistName);

    if (coverFile) {
      formData.append('coverFile', coverFile);
    }

    try {
      await albumService.createAlbum(formData);
      alert('Tạo Album thành công!');
      window.dispatchEvent(new Event('mediaUpdated')); 
      onClose();
    } catch (error) {
      console.error(error);
      alert('Lỗi khi tạo Album. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Disc className="text-spotify-green" size={28} /> Tạo Album mới
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-white">Tên Album <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-zinc-800 text-white px-4 py-3 rounded-md focus:ring-1 focus:ring-white outline-none border border-zinc-700 focus:border-white transition"
              maxLength={100}
              placeholder="VD: After Hours"
              required
            />
          </div>

          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-bold text-white">Tên Nghệ sĩ <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={artistName}
              onChange={e => {
                setArtistName(e.target.value);
                setShowArtistSuggestions(true);
              }}
              onFocus={() => setShowArtistSuggestions(true)}
              onBlur={() => setTimeout(() => setShowArtistSuggestions(false), 200)}
              className="bg-zinc-800 text-white px-4 py-3 rounded-md focus:ring-1 focus:ring-white outline-none border border-zinc-700 focus:border-white transition"
              maxLength={100}
              placeholder="VD: The Weeknd"
              required
            />
            {showArtistSuggestions && artistName && filteredArtists.length > 0 && (
              <div className="absolute top-[100%] left-0 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto">
                {filteredArtists.map(artist => (
                  <div
                    key={artist.id}
                    className="px-4 py-2 hover:bg-zinc-700 cursor-pointer text-white flex items-center gap-3 transition-colors"
                    onClick={() => {
                      setArtistName(artist.name);
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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-white">Ảnh bìa (Tùy chọn)</label>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setCoverFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className={`border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center transition
                ${coverFile ? 'border-spotify-green bg-green-900/20' : 'border-zinc-600 hover:border-zinc-400 bg-zinc-800/50'}`}>
                <Upload size={24} className={coverFile ? 'text-spotify-green mb-2' : 'text-zinc-400 mb-2'} />
                <span className={`text-sm font-medium ${coverFile ? 'text-white' : 'text-zinc-400'}`}>
                  {coverFile ? coverFile.name : 'Nhấn để chọn ảnh bìa (JPG/PNG)'}
                </span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full bg-spotify-green text-black font-bold py-3 rounded-full mt-4 transition
              ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 hover:bg-green-400'}`}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo Album'}
          </button>
        </form>
      </div>
    </div>
  );
};
