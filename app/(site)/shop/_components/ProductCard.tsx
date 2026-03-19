"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import type { SerializableProduct } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { getProductPrice, formatPrice, isDiscountActive } from "@/lib/utils/currency";
import { Countdown } from "@/components/Countdown";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: SerializableProduct;
  hideTags?: boolean;
}

export function ProductCard({ product, hideTags }: ProductCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const { currency } = useAppSelector((state) => state.shop);

  // Filter media
  const poster = product.media.find((m) => m.type === "IMAGE" && !m.src.match(/\.(mov|mp4|webm|ogg)$/i));
  const video = product.media.find((m) => m.type === "VIDEO" || m.src.match(/\.(mov|mp4|webm|ogg)$/i));

  // Find second image if it exists
  const secondaryImage = product.media.filter(m => m.type === "IMAGE" && !m.src.match(/\.(mov|mp4|webm|ogg)$/i))[1];

  // Use video thumbnail if no image poster exists
  const videoThumbnail = !poster && video
    ? video.src.replace(/\.(mp4|mov|webm|ogg)$/i, ".jpg")
    : null;

  // Get currency-aware pricing
  const { price, discountPrice } = getProductPrice(product, currency);

  const isOutOfStock = product.variants?.length > 0 && product.variants.every(v => !v.isAvailable);
  const isNewDrop = product.isNewDrop && (!product.newDropExpiresAt || new Date(product.newDropExpiresAt) > new Date());

  // Priority Tag Selection
  let activeTag = null;
  if (isOutOfStock) {
    activeTag = { label: "Out of Stock", type: "out-of-stock" };
  } else if (isNewDrop) {
    activeTag = { label: "New Drop", type: "new-drop" };
  } else if (discountPrice) {
    const discount = product.discount;
    const discountLabel = discount && discount.type === 'PERCENTAGE' 
      ? `${Math.round(Number(discount.value))}% OFF` 
      : "SALE";
    activeTag = { label: discountLabel, type: "sale" };
  }

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
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.play().catch(() => {
              // Fallback for some browsers: try again once
              setTimeout(() => {
                videoRef.current?.play().catch(() => { });
              }, 100);
            });
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.1 } // More sensitive for mobile
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isHovered, video, isInView]);

  const hasSecondMedia = !!video || !!secondaryImage;
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
        {/* Layer 1: Primary Image (Poster or Video Thumbnail) */}
        {(poster || videoThumbnail) && (
          <Image
            src={poster?.src || videoThumbnail || ""}
            alt={poster?.alt || product.name}
            fill
            className={`object-cover transition-opacity duration-700 ${showSecondMedia ? "opacity-0 invisible" : "opacity-100 visible"}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8+vZrPQAJDgNY5U8QkAAAAABJRU5ErkJggg=="
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        )}

        {/* Layer 2: Secondary Image (only if no video) */}
        {!video && secondaryImage && (
          <Image
            src={secondaryImage.src}
            alt={secondaryImage.alt || product.name}
            fill
            className={`object-cover transition-opacity duration-700 ${showSecondMedia ? "opacity-100 visible" : "opacity-0 invisible"}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        )}

        {/* Layer 3: Video Layer (Always rendered if video exists) */}
        {video && (
          <video
            ref={videoRef}
            src={video.src}
            poster={poster?.src || videoThumbnail || ""}
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${showSecondMedia ? "opacity-100 visible" : "opacity-0 invisible"}`}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}

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

        {/* Sleek Priority Tag */}
        {!hideTags && activeTag && (
          <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] backdrop-blur-md border transition-all duration-300 shadow-sm ${
            activeTag.type === 'new-drop' 
              ? 'bg-black/90 text-white border-white/20' 
              : activeTag.type === 'out-of-stock'
              ? 'bg-white/90 text-black border-neutral-200 dark:border-neutral-800'
              : 'bg-white/90 text-rose-600 border-rose-100 dark:bg-black/90 dark:text-rose-400 dark:border-rose-900/30'
          }`}>
            {activeTag.label}
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
