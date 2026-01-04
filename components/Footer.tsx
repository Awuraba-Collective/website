import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook } from "lucide-react";

// TikTok icon is not in lucide-react default export sometimes, using a custom SVG or text if needed. 
// For now, I'll use a simple text or check if lucide has support, or map generic Video icon.
// Let's use simple SVGs for brand icons to be safe or text.

export function Footer() {
    return (
        <footer className="w-full bg-neutral-50 px-6 py-12 dark:bg-neutral-900 border-t border-black/5 dark:border-white/10">
            <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-6 sm:flex-row">
                <div className="flex flex-col items-center sm:items-start gap-8 md:gap-2">
                    <div className="relative h-28 w-32 md:h-40 md:w-56 transition-all duration-300 -mt-16 -ml-8">
                        <Image
                            src="/logos/black.svg"
                            alt="AWURABA Logo"
                            fill
                            className="object-contain dark:hidden"
                            priority
                        />
                        <Image
                            src="/logos/white.svg"
                            alt="AWURABA Logo"
                            fill
                            className="object-contain hidden dark:block"
                            priority
                        />
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-16">
                        © {new Date().getFullYear()} Awuraba. All rights reserved.
                    </p>
                </div>

                <div className="flex gap-6">
                    <a
                        href="https://www.instagram.com/shopawuraba"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                    >
                        <Instagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                    </a>
                    <a
                        href="https://www.tiktok.com/@shopawuraba"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                    >
                        {/* Simple TikTok SVG representation or use a generic icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                        >
                            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                        </svg>
                        <span className="sr-only">TikTok</span>
                    </a>
                    <a
                        href="https://www.facebook.com/shopawuraba"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                    >
                        <Facebook className="h-5 w-5" />
                        <span className="sr-only">Facebook</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}
