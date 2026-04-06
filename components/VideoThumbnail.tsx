"use client";

import { cleanMediaUrl } from "@/lib/utils";

interface VideoThumbnailProps {
  src: string;
  alt: string;
  className?: string;
  time?: number; // Time in seconds to capture (default 5.0)
}

/**
 * Renders a static, stationary frame from a video URL.
 * Uses the '#t=...' fragment trick to show a specific frame without playing.
 * This is lightweight and avoids CORS canvas capture errors.
 */
export function VideoThumbnail({ src, alt, className, time = 5 }: VideoThumbnailProps) {
  if (!src) return null;

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <video
        src={`${cleanMediaUrl(src)}#t=${time}`}
        muted
        playsInline
        autoPlay={false}
        loop={false}
        preload="metadata"
        className="w-full h-full object-cover"
        onContextMenu={(e) => e.preventDefault()}
        title={alt}
      />
    </div>
  );
}
