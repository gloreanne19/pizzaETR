'use client';

import React, { useState } from 'react';
import { getImageUrl } from '@/lib/image-helper';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc = '/images/home-img-1.png',
  aspectRatio = '1/1',
  wrapperClassName = '',
  wrapperStyle = {},
  className = '',
  style = {},
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(getImageUrl(src));

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div
      className={`relative overflow-hidden ${wrapperClassName}`}
      style={{
        position: 'relative',
        aspectRatio: aspectRatio,
        width: '100%',
        backgroundColor: '#f1f5f9',
        borderRadius: style.borderRadius || 'inherit',
        ...wrapperStyle,
      }}
    >
      {/* Shimmer Placeholder while loading */}
      {!isLoaded && (
        <div
          className="skeleton"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
        />
      )}

      {/* Lazy Loaded Image */}
      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`lazy-image ${isLoaded ? 'loaded' : ''} ${className}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          position: 'relative',
          zIndex: 2,
          ...style,
        }}
        {...props}
      />
    </div>
  );
};
