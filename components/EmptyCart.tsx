import Link from "next/link";
import { motion } from "framer-motion";

interface EmptyCartProps {
    onClose?: () => void;
    isDrawer?: boolean;
}

export function EmptyCart({ onClose, isDrawer = false }: EmptyCartProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center text-center ${isDrawer ? "py-12" : "min-h-[60vh]"
                } px-4 space-y-6`}
        >
            <div className={`${isDrawer ? "w-20 h-20" : "w-32 h-32"} mb-2 flex items-center justify-center`}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full text-black dark:text-white opacity-30"
                >
                    {/* Bag Handle */}
                    <motion.path
                        d="M9 10V8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8V10"
                        stroke="currentColor"
                        strokeWidth="0.75"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: 1.5,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "loop",
                            repeatDelay: 2
                        }}
                    />
                    {/* Bag Body */}
                    <motion.path
                        d="M5 10H19L18.5 20H5.5L5 10Z"
                        stroke="currentColor"
                        strokeWidth="0.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: 1.5,
                            ease: "easeInOut",
                            delay: 0.5,
                            repeat: Infinity,
                            repeatType: "loop",
                            repeatDelay: 2
                        }}
                    />
                </svg>
            </div>
            <div className="space-y-1">
                <h2 className={`font-serif ${isDrawer ? "text-xl" : "text-3xl lg:text-4xl"}`}>
                    Your Bag is Empty
                </h2>
                {!isDrawer && (
                    <p className="text-neutral-500 text-sm max-w-[280px] mx-auto leading-relaxed">
                        Discover our curated collection and find something you love.
                    </p>
                )}
            </div>
            <Link
                href="/shop"
                onClick={onClose}
                className="inline-block bg-black text-white dark:bg-white dark:text-black px-8 py-3 uppercase tracking-widest text-[10px] font-bold transition-all hover:opacity-90 active:scale-95"
            >
                Explore Shop
            </Link>
        </motion.div>
    );
}
