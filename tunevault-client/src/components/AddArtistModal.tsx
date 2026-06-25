import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload as UploadIcon, AlertCircle } from 'lucide-react';
import apiClient from '../services/apiClient';

interface AddArtistModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddArtistModal = ({ onClose, onSuccess }: AddArtistModalProps) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setAvatarFile(file);
      } else {
        setError('Vui lòng chọn file hình ảnh hợp lệ.');
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Tên nghệ sĩ là bắt buộc');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    if (bio) formData.append('bio', bio);
    if (avatarFile) formData.append('avatarFile', avatarFile);

    try {
      await apiClient.post('/artists', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      onSuccess();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstKey = Object.keys(errors)[0];
        setError(errors[firstKey][0]);
      } else {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi thêm nghệ sĩ. Vui lòng thử lại.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 sticky top-0 z-10 shrink-0">
          <h2 className="text-xl font-bold text-white">Thêm nghệ sĩ mới</h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition p-1 hover:bg-zinc-800 rounded-full"
            disabled={isUploading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpload} className="flex flex-col overflow-hidden min-h-0 flex-1">
          <div className="p-6 overflow-y-auto custom-scrollbar min-h-0 flex-1">
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">Tên nghệ sĩ <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  maxLength={100}
                  placeholder="Nhập tên nghệ sĩ..." 
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 outline-none focus:border-white transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isUploading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-white">Tiểu sử nghệ sĩ</label>
                <textarea 
                  maxLength={50000}
                  placeholder="Giới thiệu về nghệ sĩ (Tùy chọn)..." 
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 outline-none focus:border-white transition min-h-[100px] resize-y"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-white">Ảnh đại diện (Avatar)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                
                <div 
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition cursor-pointer
                    ${avatarFile ? 'border-green-500 bg-green-500/5' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50'}
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {avatarFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-2 overflow-hidden border border-green-500/30">
                         <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm text-green-400 font-medium">Đã chọn ảnh</p>
                      <p className="text-xs text-zinc-400">{avatarFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
                        <UploadIcon size={24} />
                      </div>
                      <p className="text-sm text-white font-medium mb-1">Click để tải ảnh lên</p>
                      <p className="text-xs text-zinc-500">Hỗ trợ JPG, PNG</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-full text-white font-bold hover:scale-105 transition"
              disabled={isUploading}
            >
              Hủy
            </button>
            <button 
              type="submit"
              className={`px-8 py-3 rounded-full text-black font-bold transition
                ${isUploading || !name ? 'bg-zinc-600 cursor-not-allowed' : 'bg-white hover:scale-105'}
              `}
              disabled={isUploading || !name}
            >
              {isUploading ? 'Đang thêm...' : 'Lưu nghệ sĩ'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
