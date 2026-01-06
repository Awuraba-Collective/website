'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Upload,
    Plus,
    FileText,
    Image as ImageIcon,
    X,
    CheckCircle2,
    AlertCircle,
    Download,
    ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
    const [uploadType, setUploadType] = useState<'manual' | 'bulk'>('manual');
    const [isUploading, setIsUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        // Mock upload logic
        setTimeout(() => {
            setIsUploading(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }, 2000);
    };

    return (
        <div className="space-y-10 pb-20 max-w-4xl mx-auto">
            {/* Breadcrumbs/Back */}
            <Link href="/admin/products" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-black dark:hover:text-white transition-colors w-fit">
                <ChevronLeft className="w-3 h-3" />
                Back to Products
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-100 dark:border-neutral-900 pb-8">
                <div>
                    <h1 className="font-serif text-4xl font-bold text-black dark:text-white mb-2">New Product</h1>
                    <p className="text-neutral-500 font-light max-w-md">
                        Add a single piece or batch upload your inventory from a CSV or Excel file.
                    </p>
                </div>
            </div>

            {/* Selection Tabs */}
            <div className="grid grid-cols-2 gap-4 bg-neutral-50 dark:bg-neutral-900/50 p-1.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <button
                    onClick={() => setUploadType('manual')}
                    className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all ${uploadType === 'manual' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
                >
                    <Plus className="w-3.5 h-3.5" />
                    Single Upload
                </button>
                <button
                    onClick={() => setUploadType('bulk')}
                    className={`flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all ${uploadType === 'bulk' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
                >
                    <Upload className="w-3.5 h-3.5" />
                    Bulk Upload
                </button>
            </div>

            {uploadType === 'manual' ? (
                <motion.form
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    onSubmit={handleUpload}
                    className="space-y-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Media Section */}
                        <div className="md:col-span-1 space-y-4">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Media Gallery</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="aspect-square rounded-xl border-2 border-dashed border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:border-black dark:hover:border-white transition-all group overflow-hidden">
                                    <Plus className="w-5 h-5 text-neutral-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Upload</span>
                                </div>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="aspect-square rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 opacity-50 border-dashed" />
                                ))}
                            </div>
                            <p className="text-[9px] text-neutral-400 font-medium text-center uppercase tracking-tighter">Recommended: 1080x1350px (4:5 Ratio)</p>
                        </div>

                        {/* Fields Section */}
                        <div className="md:col-span-2 space-y-10">
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Product Name</label>
                                        <input type="text" className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-3 px-4 text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white transition-all uppercase" placeholder="e.g. Silk Wrap Dress" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Category</label>
                                        <select className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-3 px-4 text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white transition-all uppercase">
                                            <option>Dresses</option>
                                            <option>Sets</option>
                                            <option>Tops</option>
                                            <option>Bottoms</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Fit Category</label>
                                        <select className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-3 px-4 text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white transition-all uppercase">
                                            <option>Standard</option>
                                            <option>Loose</option>
                                            <option>Slim</option>
                                            <option>Oversized</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Collection</label>
                                        <input type="text" className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-3 px-4 text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white transition-all uppercase" placeholder="e.g. January 25th Drop" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Description</label>
                                    <textarea rows={4} className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-3 px-4 text-xs font-medium focus:outline-none focus:border-black dark:focus:border-white transition-all placeholder:font-light" placeholder="A timeless silhouette crafted from pure silk..." />
                                </div>
                            </div>

                            {/* Pricing & Profit */}
                            <div className="pt-10 border-t border-neutral-100 dark:border-neutral-900 space-y-6">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Financials</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Base Price (GH₵)</label>
                                        <input type="text" className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-3 px-4 text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white transition-all" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Profit (GH₵)</label>
                                        <input type="text" className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-3 px-4 text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white transition-all" placeholder="0.00" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Discount Type</label>
                                        <select className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-3 px-4 text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white transition-all uppercase">
                                            <option>None</option>
                                            <option>Percentage (%)</option>
                                            <option>Fixed Amount (GH₵)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Discount Value</label>
                                        <input type="text" className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-3 px-4 text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white transition-all" placeholder="0" />
                                    </div>
                                </div>
                            </div>

                            {/* Variants - Preorder based, no stocks */}
                            <div className="pt-10 border-t border-neutral-100 dark:border-neutral-900 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Variants (Preorder)</h2>
                                    <button type="button" className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                                        <Plus className="w-3 h-3" />
                                        Add Variant
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                                        <input type="text" className="bg-transparent border-none text-[11px] font-bold uppercase tracking-tight focus:outline-none w-1/3" placeholder="Variant Name (e.g. Emerald Green)" />
                                        <div className="h-4 w-px bg-neutral-200 dark:border-neutral-800" />
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className="w-3 h-3 bg-black dark:bg-white rounded-full" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Available</span>
                                        </div>
                                        <button className="text-neutral-300 hover:text-red-500 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-10 border-t border-neutral-100 dark:border-neutral-900">
                        <Link
                            href="/admin/products"
                            className="px-10 py-3 border border-neutral-200 dark:border-neutral-800 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="bg-black dark:bg-white text-white dark:text-black px-12 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        >
                            {isUploading ? 'Syncing...' : success ? <><CheckCircle2 className="w-4 h-4" /> Published</> : 'Publish Collection'}
                        </button>
                    </div>
                </motion.form>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-10"
                >
                    <div className="bg-white dark:bg-black py-20 px-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center space-y-8 shadow-xs">
                        <div className="w-24 h-24 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-full flex items-center justify-center relative group overflow-hidden">
                            <Upload className="w-8 h-8 text-neutral-300 group-hover:scale-110 group-hover:text-black dark:group-hover:text-white transition-all" />
                            <div className="absolute inset-0 bg-black dark:bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-black dark:text-white font-serif uppercase tracking-widest">Batch Inventory Upload</h3>
                            <p className="text-neutral-500 max-w-sm text-sm font-light">
                                Drag and drop your inventory file below.
                                <br />
                                Supported formats: **.csv**, **.xlsx**
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <label className="bg-black dark:bg-white text-white dark:text-black px-12 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-opacity cursor-pointer shadow-lg">
                                Upload Data
                                <input type="file" className="hidden" accept=".csv,.xlsx" />
                            </label>
                            <button className="flex items-center justify-center gap-2 px-8 py-3 border border-neutral-200 dark:border-neutral-800 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                                <Download className="w-3.5 h-3.5" />
                                Get Template
                            </button>
                        </div>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900/40 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800/50 flex gap-5">
                        <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-white dark:text-black" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white mb-2 underline underline-offset-4 decoration-black/20">Validation Guidelines</p>
                            <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                                Please ensure your headers match our template precisely. Image URLs should be publicly accessible or mapped to local storage identifiers.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
