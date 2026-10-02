"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import type { SerializableProduct } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { getProductPrice, formatPrice } from "@/lib/utils/currency";
import { Countdown } from "@/components/Countdown";
import { motion, AnimatePresence } from "framer-motion";
import { cleanMediaUrl } from "@/lib/utils";

interface ProductCardProps {
  product: SerializableProduct;
  hideTags?: boolean;
  context?: "shop" | "best-sellers" | "fbt" | "pieces-you-love";
}

export function ProductCard({
  product,
  hideTags,
  context = "shop",
}: ProductCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { currency } = useAppSelector((state) => state.shop);

  // Filter media
  const poster = product.media.find(
    (m) => m.type === "IMAGE" && !m.src.match(/\.(mov|mp4|webm|ogg)$/i),
  );
  const video = product.media.find(
    (m) => m.type === "VIDEO" || m.src.match(/\.(mov|mp4|webm|ogg)$/i),
  );

  // Find second image if it exists
  const secondaryImage = product.media.filter(
    (m) => m.type === "IMAGE" && !m.src.match(/\.(mov|mp4|webm|ogg)$/i),
  )[1];

  // No videoThumbnail fallback — S3/CloudFront doesn't auto-generate
  // thumbnails from video URLs the way Cloudinary did. The video element
  // itself (Layer 3) handles the display when no image poster exists.

  // Get currency-aware pricing
  const { price, discountPrice } = getProductPrice(product, currency);

  const isOutOfStock =
    product.variants?.length > 0 &&
    product.variants.every((v) => !v.isAvailable);
  const isNewDrop =
    product.isNewDrop &&
    (!product.newDropExpiresAt ||
      new Date(product.newDropExpiresAt) > new Date());
  const isSale = !!discountPrice;

  // Priority Tag Selection based on Context
  let activeTag = null;

  if (context === "best-sellers") {
    // Best Sellers: Show SALE only. No New Drop or OOS tags.
    if (isSale) activeTag = { label: "SALE", type: "sale" };
  } else if (context === "fbt" || context === "pieces-you-love") {
    // FBT & Pieces You'll Love: New Drop > Sale. No OOS tags.
    if (isNewDrop) activeTag = { label: "New Drop", type: "new-drop" };
    else if (isSale) activeTag = { label: "SALE", type: "sale" };
  } else {
    // Default Shop: OOS > New Drop > Sale.
    if (isOutOfStock)
      activeTag = { label: "Out of Stock", type: "out-of-stock" };
    else if (isNewDrop) activeTag = { label: "New Drop", type: "new-drop" };
    else if (isSale) activeTag = { label: "SALE", type: "sale" };
  }

  // Handle Visibility/Autoplay logic
  useEffect(() => {
    // Desktop logic: Hover based
    if (window.matchMedia("(min-width: 1024px)").matches) {
      if (isHovered) {
        videoRef.current?.play().catch(() => {});
      } else {
        videoRef.current?.pause();
      }
      return;
    }

    // Mobile logic: Intersection based
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // isInView is for the 0.1 threshold (nearly in view)
          setIsInView(entry.intersectionRatio >= 0.1);
          // isFocused is for the 0.6 threshold (mainly in view)
          setIsFocused(entry.intersectionRatio >= 0.6);

          if (entry.intersectionRatio >= 0.1 && videoRef.current) {
            videoRef.current.play().catch(() => {
              // Fallback for some browsers: try again once
              setTimeout(() => {
                videoRef.current?.play().catch(() => {});
              }, 100);
            });
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: [0.1, 0.6] },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isHovered, video, isInView]);

  // Single Audio Playback Logic
  useEffect(() => {
    const handleMuteAll = (e: any) => {
      const activeSource = e.detail?.source;
      if (videoRef.current && videoRef.current !== activeSource) {
        videoRef.current.muted = true;
      }
    };

    window.addEventListener("awuraba-mute-all", handleMuteAll);
    return () => window.removeEventListener("awuraba-mute-all", handleMuteAll);
  }, []);

  const notifyMuteOthers = (videoElement: HTMLVideoElement) => {
    if (!videoElement.muted && videoElement.volume > 0) {
      window.dispatchEvent(
        new CustomEvent("awuraba-mute-all", {
          detail: { source: videoElement },
        })
      );
    }
  };

  const hasSecondMedia = !!video || !!secondaryImage;
  // If there's no image poster but a video exists, keep video always visible
  const videoOnly = !poster && !!video;
  const showSecondMedia =
    videoOnly || isHovered || (video ? isInView : isFocused);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={containerRef}
        className="relative aspect-3/4 overflow-hidden bg-neutral-100 rounded-sm select-none"
      >
        {/* Layer 1: Primary Image (only when a real image poster exists) */}
        {poster && (
          <Image
            src={cleanMediaUrl(poster.src)}
            alt={poster.alt || product.name}
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
            src={cleanMediaUrl(secondaryImage.src)}
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
            src={cleanMediaUrl(video.src)}
            poster={poster ? cleanMediaUrl(poster.src) : ""}
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${showSecondMedia ? "opacity-100 visible" : "opacity-0 invisible"}`}
            onContextMenu={(e) => e.preventDefault()}
            onPlay={(e) => notifyMuteOthers(e.currentTarget)}
            onVolumeChange={(e) => notifyMuteOthers(e.currentTarget)}
          />
        )}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/40 to-transparent pointer-events-none z-1" />

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

        {!hideTags && activeTag && (
          <div
            className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-2xl border transition-all duration-300 shadow-sm ${
              activeTag.type === "new-drop"
                ? "bg-black/40 text-white border-white/20"
                : activeTag.type === "out-of-stock"
                  ? "bg-white/70 text-black border-white/40 dark:bg-black/40 dark:text-white dark:border-white/20"
                  : "bg-white/70 text-rose-600 border-white/40 dark:bg-black/40 dark:text-rose-400 dark:border-white/10"
            }`}
          >
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
