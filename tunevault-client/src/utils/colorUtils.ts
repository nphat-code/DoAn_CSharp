export const getAverageColor = (src: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve('rgba(79, 70, 229, 0.8)');
        
        canvas.width = 1;
        canvas.height = 1;
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        
        
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (luminance < 0.2) {
          resolve(`rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, 0.8)`);
        } else {
          resolve(`rgba(${r}, ${g}, ${b}, 0.8)`);
        }
      } catch (e) {
        resolve('rgba(79, 70, 229, 0.8)');
      }
    };
    img.onerror = () => {
      resolve('rgba(79, 70, 229, 0.8)'); 
    };
  });
};
