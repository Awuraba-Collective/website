"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { ShopHero } from "./ShopHero";
import { motion } from "framer-motion";
import posthog from "posthog-js";
import type { ProductWithRelations } from "@/types";

interface ShopClientProps {
  products: ProductWithRelations[];
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

  const handleFilterClick = (filter: string) => {
    // PostHog: Track shop filter changed
    if (filter !== activeFilter) {
      posthog.capture("shop_filter_changed", {
        previous_filter: activeFilter,
        new_filter: filter,
        available_filters: filters,
      });
    }

    // Navigate with new filter (server handles filtering)
    const params = new URLSearchParams(searchParams.toString());
    if (filter === "All") {
      params.delete("category");
    } else {
      params.set("category", filter);
    }
    router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
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
        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-12 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterClick(filter)}
              className={`text-sm tracking-widest uppercase transition-colors pb-2 -mb-4 border-b-2
                ${activeFilter === filter
                  ? "border-black dark:border-white text-black dark:text-white font-medium"
                  : "border-transparent text-neutral-500 hover:text-black dark:hover:text-white"
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
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
