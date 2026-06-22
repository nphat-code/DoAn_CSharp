export const getImageUrl = (url?: string | null): string => {
  if (!url) return "https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62";
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  
  const baseUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : 'https://tunevault-api.onrender.com';
    
  return `${baseUrl}${url}`;
};
