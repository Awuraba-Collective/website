"use client";

import { motion } from "framer-motion";

interface PageLoaderProps {
    text?: string;
}

export function PageLoader({ text = "Loading..." }: PageLoaderProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-6">
                {/* Animated Logo/Brand Element */}
                <motion.div
                    className="relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Spinning Circle */}
                    <motion.div
                        className="w-16 h-16 border-2 border-neutral-800 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    >
                        <div className="absolute inset-0 border-t-2 border-white rounded-full" />
                    </motion.div>

                    {/* Center Dot */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1, 0] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <div className="w-2 h-2 bg-white rounded-full" />
                    </motion.div>
                </motion.div>

                {/* Loading Text */}
                {text && (
                    <motion.p
                        className="text-sm uppercase tracking-[0.3em] font-bold text-neutral-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        {text}
                    </motion.p>
                )}
            </div>
        </div>
    );
}
