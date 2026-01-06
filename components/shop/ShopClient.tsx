'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setFilter, fetchProducts } from '@/store/slices/shopSlice';
import { ProductCard } from '@/components/shop/ProductCard';
import { ShopHero } from '@/components/shop/ShopHero';
import { ProductSkeleton } from '@/components/shop/ProductSkeleton';
import { motion } from 'framer-motion';

export default function ShopClient() {
    const dispatch = useAppDispatch();
    const { filteredProducts, activeFilter, loading, products } = useAppSelector((state) => state.shop);

    const filters = ['All', 'New Drop', 'Dresses', 'Sets', 'Tops', 'Bottoms'];

    useEffect(() => {
        if (products.length === 0) {
            dispatch(fetchProducts());
        }
    }, [dispatch, products.length]);

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
                            onClick={() => dispatch(setFilter(filter))}
                            className={`text-sm tracking-widest uppercase transition-colors pb-2 -mb-4 border-b-2
                ${activeFilter === filter
                                    ? 'border-black dark:border-white text-black dark:text-white font-medium'
                                    : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
                                }
              `}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))
                    ) : (
                        filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </div>

                {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-20 text-neutral-500">
                        <p>No products found in this category.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
