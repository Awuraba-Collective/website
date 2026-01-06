'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Edit3,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Package
} from 'lucide-react';
import Link from 'next/link';

const products = [
    { id: 'PROD-001', name: 'Silk Wrap Dress', category: 'Dresses', collection: 'January 25th Drop', costPrice: 'GH₵ 250', sellingPrice: 'GH₵ 450' },
    { id: 'PROD-002', name: 'Linen Set Coral', category: 'Sets', collection: 'Essentials', costPrice: 'GH₵ 180', sellingPrice: 'GH₵ 350' },
    { id: 'PROD-003', name: 'Ankara Maxi', category: 'Dresses', collection: 'Resort 2024', costPrice: 'GH₵ 300', sellingPrice: 'GH₵ 550' },
    { id: 'PROD-004', name: 'Velvet Evening Gown', category: 'Dresses', collection: 'January 25th Drop', costPrice: 'GH₵ 450', sellingPrice: 'GH₵ 850' },
    { id: 'PROD-005', name: 'Cotton Summer Top', category: 'Tops', collection: 'Essentials', costPrice: 'GH₵ 60', sellingPrice: 'GH₵ 120' },
    { id: 'PROD-006', name: 'High-Waist Trousers', category: 'Bottoms', collection: 'Resort 2024', costPrice: 'GH₵ 140', sellingPrice: 'GH₵ 280' },
];

export default function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-10 pb-10 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-100 dark:border-neutral-900 pb-8">
                <div>
                    <h1 className="font-serif text-4xl font-bold text-black dark:text-white mb-2">Products</h1>
                    <p className="text-neutral-500 font-light max-w-md">
                        Manage your collection and inventory across all categories.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/products/upload"
                        className="flex items-center gap-2 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                        <Filter className="w-3.5 h-3.5 text-neutral-400" />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                        <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                        Sort
                    </button>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white dark:bg-black rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/10">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">Product</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">Category</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">Collection</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">Cost Price</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">Selling Price</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-neutral-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900">
                            {products.map((product) => (
                                <tr key={product.id} className="group hover:bg-neutral-50/30 dark:hover:bg-neutral-900/5 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center overflow-hidden">
                                                <Package className="w-5 h-5 text-neutral-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-black dark:text-white uppercase tracking-tight">{product.name}</p>
                                                <p className="text-[10px] font-bold text-neutral-400 mt-0.5 tracking-tight">{product.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-xs text-neutral-500 font-medium">{product.category}</td>
                                    <td className="px-6 py-6 text-xs text-neutral-500 font-medium">{product.collection}</td>
                                    <td className="px-6 py-6 text-xs font-bold text-neutral-400">{product.costPrice}</td>
                                    <td className="px-6 py-6 text-xs font-bold text-black dark:text-white">{product.sellingPrice}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md transition-colors" title="View details">
                                                <Eye className="w-4 h-4 text-neutral-500" />
                                            </button>
                                            <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md transition-colors" title="Edit product">
                                                <Edit3 className="w-4 h-4 text-neutral-500" />
                                            </button>
                                            <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Delete product">
                                                <Trash2 className="w-4 h-4 text-rose-500" />
                                            </button>
                                        </div>
                                        <div className="group-hover:hidden">
                                            <MoreHorizontal className="w-4 h-4 text-neutral-400" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-6 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Showing 1-6 of 24 products
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-md disabled:opacity-30 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
