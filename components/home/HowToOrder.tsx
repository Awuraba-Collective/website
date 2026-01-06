'use client';

import { ShoppingBag, Ruler, MessageCircle, Truck } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
    {
        step: "01",
        title: "Select Your Style",
        desc: "Browse our monthly drops and choose the pieces that speak to you.",
        icon: <ShoppingBag className="w-6 h-6" />
    },
    {
        step: "02",
        title: "Find Your Fit",
        desc: "Choose a standard size or enter your custom measurements for a tailored feel.",
        icon: <Ruler className="w-6 h-6" />
    },
    {
        step: "03",
        title: "Easy Checkout",
        desc: "Place your order securely. We'll confirm your details personally.",
        icon: <MessageCircle className="w-6 h-6" />
    },
    {
        step: "04",
        title: "Delivery",
        desc: "Sit back as we prepare and deliver your package with care.",
        icon: <Truck className="w-6 h-6" />
    }
];

export function HowToOrder() {
    return (
        <section className="relative z-20 py-24 bg-white dark:bg-black px-4 sm:px-6 lg:px-8 border-t border-neutral-100 dark:border-neutral-900">
            <div className="mx-auto max-w-7xl">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="font-serif text-4xl text-black dark:text-white mb-4"
                    >
                        How to Order
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-neutral-500 dark:text-neutral-400"
                    >
                        Your journey to elegance in 4 simple steps.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    {/* Dynamic Connecting Line */}
                    <div className="absolute top-8 left-[12.5%] right-[12.5%] h-px bg-neutral-200 dark:bg-neutral-800 hidden md:block -z-10">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                            className="h-full bg-black dark:bg-white origin-left"
                        />
                    </div>

                    {steps.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.2 }}
                            className="relative flex flex-col items-center text-center space-y-4 group"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-16 h-16 rounded-full bg-white dark:bg-black border-2 border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-black dark:text-white transition-colors group-hover:border-black dark:group-hover:border-white shadow-sm z-10"
                            >
                                {item.icon}
                            </motion.div>
                            <h3 className="font-serif text-lg font-bold">{item.title}</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
