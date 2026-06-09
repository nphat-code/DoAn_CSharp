import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, UploadCloud, Music } from 'lucide-react';
import { mediaService } from '../services/mediaService';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal = ({ onClose, onSuccess }: UploadModalProps) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', artist); // Map Artist to Description
      formData.append('file', file);

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

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-white">Nghệ sĩ (Không bắt buộc)</label>
              <input 
                type="text" 
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="bg-[#3E3E3E] text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-white placeholder-zinc-400"
                placeholder="VD: Ed Sheeran"
              />
              <span className="text-xs text-zinc-400">Sẽ được hiển thị dưới tên bài hát.</span>
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