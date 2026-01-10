"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { ShopHero } from "./ShopHero";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import posthog from "posthog-js";
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import type { SerializableProduct } from "@/types";

interface ShopClientProps {
  products: SerializableProduct[];
  activeFilter: string;
  filters: string[];
}

export default function ShopClient({
  products,
  activeFilter,
  filters,
}: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  // Sync search query to URL
  useEffect(() => {
    const query = createQueryString("search", debouncedSearch);
    router.push(`/shop?${query}`, { scroll: false });
  }, [debouncedSearch, createQueryString, router]);

  const handleFilterClick = (filter: string) => {
    if (filter !== activeFilter) {
      posthog.capture("shop_filter_changed", {
        previous_filter: activeFilter,
        new_filter: filter,
        available_filters: filters,
      });
    }

    const value = filter === "All" ? "" : filter;
    const query = createQueryString("category", value);
    router.push(`/shop?${query}`, { scroll: false });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-black min-h-screen pb-20"
    >
      <ShopHero />

      <div className="max-w-7xl mx-auto px-6 mt-12 mb-12">
        {/* Search & Filters Container */}
        <div className="space-y-12 mb-16 text-center">
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-14 py-4 bg-neutral-50 dark:bg-neutral-900 border-none rounded-full text-sm focus:ring-2 focus:ring-black dark:focus:ring-white transition-all placeholder:text-neutral-400 placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-[9px] font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters - Centered on desktop, Horizontal Scroll on Mobile */}
          <div className="relative group">
            <div className="flex overflow-x-auto scrollbar-hide gap-10 pb-4 border-b border-neutral-100 dark:border-neutral-900 -mx-6 px-6 md:mx-0 md:px-0 md:justify-center">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  className={`text-[9px] sm:text-[10px] tracking-[0.3em] uppercase transition-all whitespace-nowrap pb-4 -mb-4 border-b-2 relative
                    ${activeFilter === filter
                      ? "text-black dark:text-white font-bold"
                      : "border-transparent text-neutral-400 hover:text-black dark:hover:text-white"
                    }
                  `}
                >
                  {filter}
                  {activeFilter === filter && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
            {/* Gradient masks for scroll indication on mobile */}
            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-white dark:from-black to-transparent pointer-events-none md:hidden" />
          </div>
        </div>

        {/* Product Grid - 1 column on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {products.length === 0 && (
          <div className="text-center py-20 text-neutral-500">
            <p>No products found in this category.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
