'use client';

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface WhatWeOfferProps {
    collections: any[];
}

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemAnim: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } }
};

export function WhatWeOffer({ collections }: WhatWeOfferProps) {
    if (!collections || collections.length === 0) return null;

    return (
        <section className="relative z-20 py-24 bg-white dark:bg-black px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="mx-auto max-w-7xl">
                <div className="text-center mb-16 space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="font-serif text-3xl md:text-5xl text-black dark:text-white"
                    >
                        Our Collections
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-neutral-500 dark:text-neutral-400 text-lg max-w-2xl mx-auto"
                    >
                        Explore curated styles designed for the modern woman.
                    </motion.p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {collections.map((item, index) => (
                        <Link
                            key={item.id}
                            href={`/shop?category=${encodeURIComponent(item.name)}`}
                            className="block"
                        >
                            <motion.div
                                variants={itemAnim}
                                className="relative group h-[500px] rounded-2xl overflow-hidden shadow-2xl"
                            >
                                <Image
                                    src={item.image || "/images/placeholder-collection.jpg"}
                                    alt={item.name}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                <div className="absolute bottom-0 left-0 right-0 p-8 text-white transition-transform duration-500 group-hover:-translate-y-2">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <span className="text-[10px] tracking-[0.3em] uppercase opacity-70 font-bold">
                                                {item._count?.products || 0} Pieces
                                            </span>
                                            <h3 className="font-serif text-3xl font-medium">{item.name}</h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                            <ArrowRight className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
