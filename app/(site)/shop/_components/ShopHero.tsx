"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { SerializableProduct } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { getProductPrice, formatPrice } from "@/lib/utils/currency";
import { Countdown } from "@/components/Countdown";

interface ShopHeroProps {
    products: SerializableProduct[];
}

export function ShopHero({ products }: ShopHeroProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { currency } = useAppSelector((state) => state.shop);

    useEffect(() => {
        if (products.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % products.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [products.length]);

    if (!products || products.length === 0) {
        return (
            <div className="relative w-full bg-neutral-900 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-700 to-black"></div>
                </div>
                <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 text-center space-y-6">
                    <span className="inline-block border border-white/30 px-3 py-1 text-[10px] tracking-[0.3em] uppercase backdrop-blur-sm font-bold">
                        Monthly Event
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl tracking-tight">
                        The 25<sup>th</sup> Drop
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-300 font-light leading-relaxed">
                        Exclusive discounts on our new pieces,
                        available for a limited time only.
                    </p>
                </div>
            </div>
        );
    }

    const currentProduct = products[currentIndex];
    const heroImage = currentProduct.media.find(m => m.type === 'IMAGE')?.src || currentProduct.media[0]?.src;
    const { price, discountPrice } = getProductPrice(currentProduct, currency);

    return (
        <div className="relative w-full h-[60vh] md:h-[70vh] bg-black text-white overflow-hidden group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    {heroImage && (
                        <Image
                            src={heroImage}
                            alt={currentProduct.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    )}
                    {/* Dark Grid/Radial Overlay */}
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content Area */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <motion.div
                    key={`content-${currentIndex}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="space-y-4 md:space-y-8 max-w-5xl"
                >
                    {/* Top Badge */}
                    <div className="flex items-center justify-center">
                        {currentProduct.discount ? (
                            <span className="bg-white text-black px-4 py-1.5 text-[10px] md:text-[11px] tracking-[0.4em] uppercase font-black">
                                Sale
                            </span>
                        ) : currentProduct.isNewDrop ? (
                            <span className="border border-white/50 px-4 py-1.5 text-[10px] md:text-[11px] tracking-[0.4em] uppercase backdrop-blur-md font-bold text-white">
                                New Drop
                            </span>
                        ) : null}
                    </div>

                    {/* Title */}
                    <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.85] text-white">
                        {currentProduct.name}
                    </h2>

                    {/* Countdown Timer */}
                    {currentProduct.discount?.endDate && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="pt-4 border-t border-white/10"
                        >
                            <Countdown endDate={currentProduct.discount.endDate} variant="hero" />
                        </motion.div>
                    )}

                    {/* Pricing & CTA Row */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 pt-6">
                        <div className="flex items-center gap-4">
                            <p className="text-3xl md:text-5xl font-bold tracking-tighter text-white">
                                {formatPrice(discountPrice ?? price, currency)}
                            </p>
                            {discountPrice && (
                                <p className="text-xl md:text-2xl font-light tracking-tight text-white/40 line-through">
                                    {formatPrice(price, currency)}
                                </p>
                            )}
                        </div>

                        <Link
                            href={`/shop/${currentProduct.slug}`}
                            className="px-10 py-4 bg-white text-black font-bold text-xs md:text-sm uppercase tracking-[0.3em] rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl"
                        >
                            Shop Now
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                {products.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1 transition-all rounded-full ${currentIndex === idx
                            ? "w-8 bg-white"
                            : "w-2 bg-white/30 hover:bg-white/50"
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

            {/* Navigation Arrows (Visible on hover) */}
            <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
                aria-label="Previous slide"
            >
                <span className="text-xl">←</span>
            </button>
            <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % products.length)}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
                aria-label="Next slide"
            >
                <span className="text-xl">→</span>
            </button>
        </div>
    );
}
