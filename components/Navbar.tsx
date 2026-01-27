"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleCart } from "@/store/slices/cartSlice";
import posthog from "posthog-js";
import { CurrencySwitcher } from "@/app/(site)/shop/_components/CurrencySwitcher";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Shop", href: "/shop" },
    { name: "Sizing", href: "/sizing" },
    { name: "Partners", href: "/partners" },
    { name: "FAQ", href: "/faq" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { items } = useAppSelector((state) => state.cart);
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-md dark:bg-black/80 dark:border-white/10">
            <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative h-28 w-32 lg:h-40 lg:w-56 transition-all duration-300 lg:-ml-16">
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
                <div className="hidden lg:flex lg:items-center lg:gap-10">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={clsx(
                                    "relative text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 py-2 group",
                                    isActive
                                        ? "text-black dark:text-white"
                                        : "text-neutral-400 hover:text-black dark:hover:text-white"
                                )}
                            >
                                <span className="relative z-10">{link.name}</span>
                                {isActive ? (
                                    <motion.div
                                        layoutId="nav-underline"
                                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                ) : (
                                    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-neutral-200 dark:bg-neutral-800 transition-all duration-300 group-hover:w-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Right side icons (Mobile menu toggle) */}
                <div className="flex items-center gap-4">
                    {pathname !== "/" && pathname !== "/checkout" && (
                        <>
                            <div className="hidden sm:block">
                                <CurrencySwitcher />
                            </div>
                            {/* Cart Icon */}
                            <button
                                onClick={() => {
                                    // PostHog: Track cart drawer opened
                                    posthog.capture('cart_drawer_opened', {
                                        cart_item_count: items.length,
                                        cart_total_quantity: cartCount,
                                        source: 'navbar_icon',
                                    });
                                    dispatch(toggleCart());
                                }}
                                className="relative p-2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                            >
                                <ShoppingBag className="h-5 w-5" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] flex items-center justify-center font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </>
                    )}

                    {/* Cart Drawer is moved to RootLayout for global access and z-index stability */}

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <div
                className={clsx(
                    "lg:hidden absolute top-16 left-0 w-full bg-white dark:bg-black border-b border-black/5 dark:border-white/10 transition-all duration-500 ease-in-out overflow-hidden z-[60]",
                    isOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="flex flex-col space-y-6 p-10">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={clsx(
                                    "relative text-2xl font-serif tracking-tight flex items-center justify-between group",
                                    isActive ? "text-black dark:text-white" : "text-neutral-400"
                                )}
                            >
                                <span>{link.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="mobile-indicator"
                                        className="h-px bg-black dark:bg-white flex-grow ml-4 origin-left"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            // PostHog: Track cart drawer opened from mobile nav
                            posthog.capture('cart_drawer_opened', {
                                cart_item_count: items.length,
                                cart_total_quantity: cartCount,
                                source: 'mobile_nav',
                            });
                            dispatch(toggleCart());
                        }}
                        className="text-xl font-medium text-neutral-400 text-left flex items-center gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-900"
                    >
                        Bag (<span className="text-black dark:text-white font-bold">{cartCount}</span>)
                    </button>
                    <div className="pt-6 border-t border-neutral-100 dark:border-neutral-900 flex justify-between items-center sm:hidden">
                        <span className="text-sm font-bold uppercase tracking-widest text-neutral-400">Currency</span>
                        <CurrencySwitcher />
                    </div>
                </div>
            </div>
        </nav>
    );
}
