import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mediaService } from '../services/mediaService';
import type { MediaItemDto } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { Play } from 'lucide-react';

export const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { playMedia } = usePlayer();
  
  const [results, setResults] = useState<MediaItemDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }
    
    const doSearch = async () => {
      setLoading(true);
      try {
        const data = await mediaService.searchMedia(query);
        setResults(data);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Thêm delay nhỏ để tránh gọi API liên tục khi gõ nhanh
    const debounceTimeout = setTimeout(() => {
      doSearch();
    }, 500);
    
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold text-white mb-6">Kết quả cho "{query}"</h1>
      
      {loading ? (
        <div className="text-zinc-500 font-medium">Đang tìm kiếm...</div>
      ) : query === '' ? (
        <div className="text-zinc-500 font-medium">Hãy nhập từ khóa để tìm bài hát, nghệ sĩ hoặc podcast.</div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map(track => (
            <div 
              key={track.id}
              onClick={() => playMedia(track)}
              className="p-4 rounded-md bg-zinc-800/20 hover:bg-zinc-800 transition cursor-pointer group relative"
            >
              <div className="w-full aspect-square bg-zinc-700 rounded-md mb-4 shadow-lg flex items-center justify-center group-hover:shadow-xl transition relative overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                   <span className="text-3xl font-black text-white/50">{track.title.charAt(0)}</span>
                </div>
                <button className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition shadow-xl translate-y-2 group-hover:translate-y-0">
                  <Play fill="black" size={24} className="ml-1" />
                </button>
              </div>
              <h3 className="font-bold text-white truncate text-base">{track.title}</h3>
              <p className="text-sm text-zinc-400 mt-1 truncate">{track.artistName || track.description || 'Nghệ sĩ'}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-zinc-500 font-medium text-center mt-12">
           <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy kết quả nào cho "{query}"</h2>
           <p>Vui lòng đảm bảo bạn đã viết đúng chính tả hoặc sử dụng ít từ khóa hơn hoặc sử dụng từ khóa khác.</p>
        </div>
      )}
    </div>
  );
};
