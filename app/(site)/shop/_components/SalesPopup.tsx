"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";

export function SalesPopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Cutoff date: 1st February 2026
        const cutoffDate = new Date("2026-02-01T00:00:00Z").getTime();
        const now = new Date().getTime();

        if (now > cutoffDate) return;

        // Check localStorage for the last shown time
        const lastShown = localStorage.getItem("sales_popup_last_shown");
        const eightHours = 8 * 60 * 60 * 1000;

        if (!lastShown || now - parseInt(lastShown) > eightHours) {
            // Delay it slightly for a better UX
            const timer = setTimeout(() => {
                setIsOpen(true);
                localStorage.setItem("sales_popup_last_shown", now.toString());
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const closePopup = () => setIsOpen(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closePopup}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-sm overflow-hidden shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={closePopup}
                            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white text-black rounded-full shadow-xl border border-neutral-200 transition-all hover:scale-110 active:scale-95"
                            aria-label="Close popup"
                        >
                            <X className="w-6 h-6 stroke-[2.5]" />
                        </button>

                        {/* Sales Image */}
                        <div className="relative aspect-[4/5] w-full cursor-pointer" onClick={closePopup}>
                            <Image
                                src="/images/sales.png"
                                alt="Latest Sales at AWURABA"
                                fill
                                className="object-cover"
                                priority
                            />

                            {/* Subtle Overlay Hint */}
                            <div className="absolute inset-x-0 bottom-10 p-8 bg-gradient-to-t from-black/60 to-transparent flex justify-center">
                                <motion.button
                                    animate={{
                                        scale: [1, 1.05, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-3 bg-white text-black text-xs font-bold uppercase tracking-[0.3em] rounded-full shadow-lg"
                                >
                                    Shop the Sale
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
