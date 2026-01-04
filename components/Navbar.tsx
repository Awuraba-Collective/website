"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import clsx from "clsx";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Sizing", href: "/sizing" },
    { name: "FAQ", href: "/faq" },
    { name: "Partners", href: "/partners" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-md dark:bg-black/80 dark:border-white/10">
            <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative h-28 w-32 md:h-40 md:w-56 transition-all duration-300 md:-ml-16">
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
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex md:items-center md:gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium uppercase tracking-wider text-neutral-600 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Right side icons (Mobile menu toggle) */}
                <div className="flex items-center gap-4">
                    {/* Future: Cart Icon could go here */}

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <div
                className={clsx(
                    "md:hidden absolute top-16 left-0 w-full bg-white dark:bg-black border-b border-black/5 dark:border-white/10 transition-all duration-300 ease-in-out overflow-hidden",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="flex flex-col space-y-4 p-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="text-lg font-medium text-neutral-800 dark:text-neutral-200"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
