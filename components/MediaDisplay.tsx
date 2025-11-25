// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface MediaDisplayProps {
  url: string;
  altText: string;
  type: 'card' | 'highlight' | 'customization' | 'preview'; 
  priority?: boolean;
}

const getYoutubeVideoId = (url: string): string | null => {
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      if (urlObj.pathname === '/watch') {
        videoId = urlObj.searchParams.get('v');
        if (videoId) return videoId;
      }
      if (urlObj.pathname.startsWith('/shorts/')) {
        videoId = urlObj.pathname.split('/shorts/')[1]?.split('?')[0]?.split('&')[0];
        if (videoId) return videoId;
      }
      if (urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1]?.split('?')[0]?.split('&')[0];
        if (videoId) return videoId;
      }
    }
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.substring(1).split('?')[0]?.split('&')[0];
      if (videoId) return videoId;
    }
  } catch (error) {
    return null;
  }
  return videoId;
};

const FUNNY_FALLBACKS = [
  "Our painter is missing, but we promise it's good! 🎨",
  "So delicious it disappeared! 👻",
  "Invisible ink was used here 🖊️",
  "Image on coffee break ☕",
  "Too hot to handle for the camera 🔥",
  "Imagine the perfect drink here ✨",
  "404: Drink found, Image lost 🔍",
  "Trust us, it looks amazing 🤩",
  "Camera ate the drink 📸"
];


const MediaDisplay: React.FC<MediaDisplayProps> = ({ url, altText, type: _type, priority = false }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Retry logic state
  const [currentSrc, setCurrentSrc] = useState<string>(url);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 4;
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Select a random fallback message only once per mount
  const fallbackMessage = useMemo(() => {
    const index = Math.floor(Math.random() * FUNNY_FALLBACKS.length);
    return FUNNY_FALLBACKS[index];
  }, []);

  // Reset state when prop URL changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setRetryCount(0);
    setCurrentSrc(url);
    
    if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
    }
  }, [url]);

  // Check if image is already loaded from cache
  useEffect(() => {
    // If image is already complete when mounted, show it immediately
    if (imgRef.current && imgRef.current.complete) {
        if (imgRef.current.naturalWidth > 0) {
            setIsLoaded(true);
        }
    }
  }, [currentSrc]);

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
          }
      };
  }, []);

  const handleImageError = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      // Automatic Retry: Add a cache-busting timestamp to force re-fetch
      // Exponential backoff delay: 1s, 2s, 4s, 8s
      const delay = Math.pow(2, retryCount) * 1000;
      
      retryTimeoutRef.current = setTimeout(() => {
        const separator = url.includes('?') ? '&' : '?';
        // Use a random string to ensure strict cache bypassing
        const cacheBuster = Math.random().toString(36).substring(7);
        const newSrc = `${url}${separator}retry=${Date.now()}_${cacheBuster}`;
        setCurrentSrc(newSrc);
        setRetryCount((prev) => prev + 1);
      }, delay);
    } else {
      // Give up after max retries
      setHasError(true);
    }
  }, [retryCount, url]);

  const handleImageLoad = () => {
      setIsLoaded(true);
  };

  if (hasError) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-stone-200 text-stone-500 p-4 text-center relative overflow-hidden group`}>
         <div className="glass-panel bg-white/40 backdrop-blur-sm p-3 rounded-xl border border-white/20 shadow-sm max-w-[90%]">
            <p className="text-xs md:text-sm font-semibold heading-font leading-tight opacity-80">
              {fallbackMessage}
            </p>
         </div>
         {/* Subtle coffee cup pattern background */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '10px 10px'}}>
         </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-200 text-[#924d26]">
        <div className="text-center opacity-60">
          <span className="text-4xl block mb-2">☕</span>
          <span className="text-xs font-bold uppercase tracking-wider">BaristA:i</span>
        </div>
      </div>
    );
  }

  const youtubeVideoId = getYoutubeVideoId(url);

  if (youtubeVideoId) {
    return (
      <div className="relative w-full h-full">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${youtubeVideoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
          title={altText || 'Product video'}
          frameBorder="0"
          allow="autoplay; encrypted-media;"
          allowFullScreen={false} 
        ></iframe>
        <div className="absolute inset-0 bg-transparent hover:bg-black/5 hover:ring-1 hover:ring-inset hover:ring-white/20 z-10 cursor-pointer transition-all duration-200">
        </div>
      </div>
    );
  }

  const fileExtension = url.split('.').pop()?.toLowerCase();
  const cleanExtension = fileExtension?.split('?')[0];

  if (cleanExtension === 'mp4' || cleanExtension === 'webm') {
    return (
      <video
        src={currentSrc}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
    );
  }

  // Default image handling
  return (
    <div className="w-full h-full bg-stone-200 relative overflow-hidden">
      <img
          ref={imgRef}
          src={currentSrc}
          alt={altText}
          loading={priority ? "eager" : "lazy"}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {!isLoaded && (
         <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
             <div className="w-6 h-6 border-2 border-[var(--bdl-brand)] border-t-transparent rounded-full animate-spin opacity-50"></div>
         </div>
      )}
    </div>
  );
};

export default MediaDisplay;