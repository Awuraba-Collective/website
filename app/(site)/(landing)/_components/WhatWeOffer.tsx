'use client';

import { motion, Variants } from "framer-motion";
import Image from "next/image";

const offers = [
    {
        title: "Curated Collections",
        description: "5 unique styles released every month.",
        image: "/images/shop-curated.png",
    },
    {
        title: "Versatile Styling",
        description: "Up to 3 color variations per style.",
        image: "/images/shop-versatiles.png",
    },
    {
        title: "Inclusive Sizing",
        description: "Standard sizes XS-XXL, with custom options available.",
        image: "/images/shop-inclusive-sizing.png",
    },
];

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

export function WhatWeOffer() {
    return (
        <section className="relative z-20 py-24 bg-neutral-50 dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="mx-auto max-w-7xl">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="font-serif text-4xl text-black dark:text-white mb-4"
                    >
                        What We Offer
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-neutral-500 dark:text-neutral-400"
                    >
                        Where Elegance meets Affordability.
                    </motion.p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {offers.map((item, index) => (
                        <motion.div
                            key={index}
                            variants={itemAnim}
                            className="relative group h-[400px] rounded-2xl overflow-hidden"
                        >
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                <h3 className="font-serif text-2xl font-medium mb-3">{item.title}</h3>
                                <p className="text-neutral-300 leading-relaxed opacity-90">{item.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
