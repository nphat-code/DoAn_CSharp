import React, { useEffect, useRef } from 'react';

interface VideoCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  className?: string;
  style?: React.CSSProperties;
}

export const VideoCanvas: React.FC<VideoCanvasProps> = ({ videoRef, className, style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !video || !ctx) return;

    
    const forceDraw = () => {
      if (video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    };

    const drawLoop = () => {
      
      if (video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      animationFrameId = requestAnimationFrame(drawLoop);
    };

    
    drawLoop();

    
    video.addEventListener('loadeddata', forceDraw);
    video.addEventListener('seeked', forceDraw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      video.removeEventListener('loadeddata', forceDraw);
      video.removeEventListener('seeked', forceDraw);
    };
  }, [videoRef]);

  return <canvas ref={canvasRef} className={className} style={style} />;
};
