'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrency } from '@/store/slices/shopSlice';
import { motion } from 'framer-motion';

export function CurrencySwitcher() {
    const dispatch = useAppDispatch();
    const { currency } = useAppSelector((state) => state.shop);

    return (
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 rounded-full p-1 border border-neutral-200 dark:border-neutral-800">
            <button
                onClick={() => dispatch(setCurrency('GHS'))}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currency === 'GHS'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                    }`}
            >
                GHS
            </button>
            <button
                onClick={() => dispatch(setCurrency('USD'))}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currency === 'USD'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                    }`}
            >
                USD
            </button>
        </div>
    );
}
