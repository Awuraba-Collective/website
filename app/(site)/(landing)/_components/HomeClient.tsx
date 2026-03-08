'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { WhatWeOffer } from "./WhatWeOffer";
import { HowToOrder } from "./HowToOrder";
import { ShopHero } from "@/components/ShopHero";
import { ProductCard } from "../../shop/_components/ProductCard";
import type { SerializableProduct } from "@/types";
import { Countdown } from "@/components/Countdown";
import { getDropStatus } from "@/lib/utils/drop-logic";

interface HomeClientProps {
    heroProducts: SerializableProduct[];
    bestSellers: SerializableProduct[];
    collections: any[]; // Specific type based on Prisma include
}
export default function HomeClient({ heroProducts, bestSellers, collections }: HomeClientProps) {
    // Automated Drop Cycle Logic
    const { status, targetDate, label, title, description, buttonText } = getDropStatus();

    return (
        <div className="flex flex-col bg-white dark:bg-black">
            {/* Hero Carousel */}
            <section className="relative w-full">
                <ShopHero products={heroProducts} />
            </section>

            {/* Introduction */}
            <section className="relative z-20 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center space-y-8">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="font-serif text-3xl md:text-4xl font-medium italic text-neutral-800 dark:text-neutral-200"
                    >
                        "Elegance and style for everyone."
                    </motion.h2>
                    <div className="h-px w-24 bg-black/10 dark:bg-white/10 mx-auto" />
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-lg"
                    >
                        AWURABA curates distinctive, high-quality African fashion, making timeless pieces accessible to all. We are shaping a future where African fashion is versatile, empowering, and fairly priced.
                    </motion.p>
                </div>
            </section>

            {/* Best Sellers Section */}
            {bestSellers.length > 0 && (
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-900/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="font-serif text-3xl md:text-5xl text-black dark:text-white">Best Sellers</h2>
                            <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-2xl mx-auto">Most loved. Most worn. Shop the iconic pieces that define the AWURABA style.</p>
                            <div className="pt-2">
                                <Link
                                    href="/shop"
                                    className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-black dark:text-white border-b border-black/10 dark:border-white/10 pb-1 hover:border-black dark:hover:border-white transition-all"
                                >
                                    View All Products <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {bestSellers.slice(0, 4).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Drop Countdown Section */}
            <section className="relative py-24 px-4 overflow-hidden bg-black text-white">
                <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-700 to-black"></div>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-10">
                    <div className="space-y-4">
                        <span className="inline-block border border-white/30 px-4 py-1.5 text-[11px] tracking-[0.4em] uppercase font-bold text-white/80">
                            {label}
                        </span>
                        <h2 className="font-serif text-3xl sm:text-4xl md:text-7xl">
                            {title}
                        </h2>
                        <p className="hidden md:block text-neutral-400 text-xl max-w-2xl mx-auto">
                            {description}
                        </p>
                    </div>

                    <div className="flex justify-center py-4">
                        <Countdown endDate={targetDate} variant="hero" />
                    </div>

                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-full font-black uppercase tracking-[0.2em] text-sm hover:scale-105 transition-transform shadow-2xl"
                    >
                        {buttonText}
                    </Link>
                </div>
            </section>

            {/* Collections Showcase */}
            <WhatWeOffer collections={collections} />

            <HowToOrder />

            {/* Final CTA */}
            <section className="relative py-32 px-4 text-center bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="font-serif text-4xl sm:text-6xl text-black dark:text-white leading-tight">Elevate Your Wardrobe with AWURABA</h2>
                    <p className="text-neutral-600 dark:text-neutral-400 text-lg md:text-xl">
                        Discover the perfect blend of modern silhouettes and traditional African craftsmanship.
                    </p>
                    <div className="pt-4">
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-12 py-5 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
                        >
                            Browse Full Shop <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
