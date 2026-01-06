'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { WhatWeOffer } from "@/components/home/WhatWeOffer";
import { HowToOrder } from "@/components/home/HowToOrder";

export default function HomeClient() {
    return (
        <div className="flex flex-col">
            <section
                className="relative flex h-screen w-full flex-col items-center justify-center px-4 text-center text-white overflow-hidden"
                style={{ clipPath: "inset(0)" }}
            >
                <div className="fixed inset-0 z-0">
                    <Image
                        src="/images/fabrics.webp"
                        alt="Awuraba Fabrics"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/80" />
                </div>

                <div className="relative z-10 max-w-4xl space-y-6 px-4">
                    <motion.h1
                        className="font-serif text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl break-words overflow-hidden flex justify-center"
                    >
                        {"AWURABA".split("").map((letter, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                    duration: 0.1,
                                    delay: index * 0.25,
                                    ease: "easeIn",
                                }}
                                className="inline-block"
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="mx-auto max-w-2xl text-base font-light tracking-wide text-neutral-200 sm:text-xl md:text-2xl"
                    >
                        Curated elegant African ready-to-wear pieces for everyday life, special occasions, and everything in between.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                        className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-black transition-transform hover:scale-105 hover:bg-neutral-200"
                        >
                            Shop Collection
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex items-center gap-2 rounded-full border border-white px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-transform hover:scale-105 hover:bg-white/10"
                        >
                            Our Story
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Introduction */}
            <section className="relative z-20 py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
                <div className="mx-auto max-w-3xl text-center space-y-8">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="font-serif text-3xl font-medium italic text-neutral-800 dark:text-neutral-200"
                    >
                        "Dignity and grace should be accessible, not exclusive."
                    </motion.h2>
                    <div className="h-px w-24 bg-black/10 dark:bg-white/10 mx-auto" />
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-neutral-600 dark:text-neutral-400 leading-relaxed"
                    >
                        AWURABA is a curated clothing line bringing unique, high-quality pieces to women across Ghana.
                        We are building a future where African fashion is versatile, empowering, and clearly priced.
                    </motion.p>
                </div>
            </section>

            <WhatWeOffer />

            <HowToOrder />

            {/* CTA */}
            <section className="relative z-20 py-32 px-4 text-center bg-black text-white overflow-hidden">
                <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="font-serif text-4xl sm:text-5xl mb-4">The 25th Drop</h2>
                        <p className="text-neutral-300 text-lg mb-8">
                            New collections drop on the 25th of every month.
                            Shop during the launch window for exclusive discounted prices.
                        </p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                        >
                            Shop The Drop <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
