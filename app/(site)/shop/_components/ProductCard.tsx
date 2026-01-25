"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import type { SerializableProduct } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { getProductPrice, formatPrice } from "@/lib/utils/currency";

interface ProductCardProps {
  product: SerializableProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { currency } = useAppSelector((state) => state.shop);

  // Filter media
  const poster = product.media.find((m) => m.type === "IMAGE" && !m.src.match(/\.(mov|mp4|webm)$/i));
  const video = product.media.find((m) => m.type === "VIDEO" || m.src.match(/\.(mov|mp4|webm)$/i));

  // Get currency-aware pricing
  const { price, discountPrice } = getProductPrice(product, currency);

  // Handle Autoplay logic
  useEffect(() => {
    if (!video) return;

    // Desktop: Play on hover
    if (window.matchMedia("(min-width: 1024px)").matches) {
      if (isHovered) {
        videoRef.current?.play().catch(() => { });
        setIsPlaying(true);
      } else {
        videoRef.current?.pause();
        setIsPlaying(false);
      }
      return;
    }

    // Mobile: Play when in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => { });
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.8 } // 80% visible
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [isHovered, video]);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 rounded-sm select-none">
        {/* Main Poster Image */}
        {poster && poster.src && (
          <Image
            src={poster.src}
            alt={poster.alt}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isPlaying && video ? "opacity-0" : "opacity-100"
              }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8+vZrPQAJDgNY5U8QkAAAAABJRU5ErkJggg=="
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        )}

        {/* Video Layer */}
        {video && (
          <video
            ref={videoRef}
            src={video.src}
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? "opacity-100" : "opacity-0"
              }`}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}

        {/* Fallback Hover Image (only if no video and exists) */}
        {!video && product.media[1] && product.media[1].type === "IMAGE" && product.media[1].src && (
          <Image
            src={product.media[1].src}
            alt={product.media[1].alt}
            fill
            className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        )}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-[1]" />

        {/* New Drop Badge */}
        {product.isNewDrop && (
          <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 uppercase tracking-widest z-10">
            New Drop
          </div>
        )}

        {/* Sale Badge */}
        {discountPrice && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm dark:bg-black/90 text-black dark:text-white text-[10px] px-2 py-1 uppercase tracking-[0.2em] font-bold border border-neutral-200 dark:border-neutral-800 shadow-sm z-10">
            Sale
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1 text-center sm:text-left">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-white uppercase tracking-wide">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          {discountPrice ? (
            <>
              <span className="text-sm font-bold text-black dark:text-white">
                {formatPrice(discountPrice, currency)}
              </span>
              <span className="text-xs text-neutral-400 line-through font-medium">
                {formatPrice(price, currency)}
              </span>
            </>
          ) : (
            <p className="text-sm text-black dark:text-white font-semibold">
              {formatPrice(price, currency)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
