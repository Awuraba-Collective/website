"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import type { SerializableProduct } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { getProductPrice, formatPrice } from "@/lib/utils/currency";
import { Countdown } from "@/components/Countdown";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: SerializableProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const { currency } = useAppSelector((state) => state.shop);

  // Filter media
  const poster = product.media.find((m) => m.type === "IMAGE" && !m.src.match(/\.(mov|mp4|webm|ogg)$/i));
  const video = product.media.find((m) => m.type === "VIDEO" || m.src.match(/\.(mov|mp4|webm|ogg)$/i));

  // Use video thumbnail if no image poster exists
  const videoThumbnail = !poster && video
    ? video.src.replace(/\.(mp4|mov|webm|ogg)$/i, ".jpg")
    : null;

  // Get currency-aware pricing
  const { price, discountPrice } = getProductPrice(product, currency);

  // Handle Visibility/Autoplay logic
  useEffect(() => {
    // Desktop logic: Hover based
    if (window.matchMedia("(min-width: 1024px)").matches) {
      if (isHovered) {
        videoRef.current?.play().catch(() => { });
      } else {
        videoRef.current?.pause();
      }
      return;
    }

    // Mobile logic: Intersection based
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => { });
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.6 } // 60% visible to trigger
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isHovered, video]);

  const hasSecondMedia = !!video || (product.media.length > 1 && !!product.media[1]?.src);
  const showSecondMedia = (isHovered || isInView) && hasSecondMedia;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={containerRef}
        className="relative aspect-[3/4] overflow-hidden bg-neutral-100 rounded-sm select-none"
      >
        {/* Media Layer */}
        <div className="absolute inset-0 transition-opacity duration-500">
          {showSecondMedia && video ? (
            <video
              ref={videoRef}
              src={video.src}
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (poster || videoThumbnail) ? (
            <Image
              src={poster?.src || videoThumbnail || ""}
              alt={poster?.alt || product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-transform duration-700 ${isHovered ? "scale-105" : "scale-100"}`}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8+vZrPQAJDgNY5U8QkAAAAABJRU5ErkJggg=="
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
          ) : null}
        </div>

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-[1]" />

        {/* Countdown Overlay */}
        <AnimatePresence>
          {showSecondMedia && product.discount?.endDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-2 left-2 z-10"
            >
              <Countdown endDate={product.discount.endDate} variant="card" />
            </motion.div>
          )}
        </AnimatePresence>

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
