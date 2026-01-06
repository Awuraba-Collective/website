'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    X,
    ChevronLeft,
    Trash2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Variant {
    id: string;
    name: string;
    available: boolean;
}

interface ProductImage {
    id: string;
    file: File | null;
    previewUrl: string | null;
    modelHeight: string;
    wearingSize: string;
    wearingVariant: string;
}

export default function UploadPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Pricing State
    const [cost, setCost] = useState<number>(0);
    const [projectedProfit, setProjectedProfit] = useState<number>(0);
    const [discountType, setDiscountType] = useState<'none' | 'percent' | 'fixed'>('none');
    const [discountValue, setDiscountValue] = useState<number>(0);

    // Derived Financials
    const retailPrice = cost + projectedProfit;
    let actualDiscount = 0;
    if (discountType === 'percent') {
        actualDiscount = retailPrice * (discountValue / 100);
    } else if (discountType === 'fixed') {
        actualDiscount = discountValue;
    }

    const finalSellingPrice = retailPrice - actualDiscount;
    const actualProfit = projectedProfit - actualDiscount;

    // Collection State
    const [collections, setCollections] = useState(['January 25th Drop', 'Essentials', 'Resort 2024']);
    const [isAddingCollection, setIsAddingCollection] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');

    // Dynamic Variants State
    const [variants, setVariants] = useState<Variant[]>([
        { id: '1', name: 'Emerald Green', available: true },
        { id: '2', name: 'Midnight Black', available: true }
    ]);

    // Media & Model Info State
    const [productImages, setProductImages] = useState<ProductImage[]>([]);

    const addProductImage = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        setProductImages([...productImages, {
            id: newId,
            file: null,
            previewUrl: null,
            modelHeight: '',
            wearingSize: '',
            wearingVariant: ''
        }]);
    };

    const removeProductImage = (id: string) => {
        setProductImages(productImages.filter(img => img.id !== id));
    };

    const updateImageInfo = (id: string, field: keyof ProductImage, value: string) => {
        setProductImages(productImages.map(img =>
            img.id === id ? { ...img, [field]: value } : img
        ));
    };

    const handleImageChange = (id: string, file: File) => {
        const url = URL.createObjectURL(file);
        setProductImages(productImages.map(img =>
            img.id === id ? { ...img, file, previewUrl: url } : img
        ));
    };

    const addVariant = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        setVariants([...variants, { id: newId, name: '', available: true }]);
    };

    const removeVariant = (id: string) => {
        setVariants(variants.filter(v => v.id !== id));
    };

    const toggleVariantAvailability = (id: string) => {
        setVariants(variants.map(v =>
            v.id === id ? { ...v, available: !v.available } : v
        ));
    };

    const updateVariantName = (id: string, name: string) => {
        setVariants(variants.map(v =>
            v.id === id ? { ...v, name } : v
        ));
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }, 2000);
    };

    return (
        <div className="space-y-10 pb-20 max-w-[1200px] mx-auto px-4">
            {/* Breadcrumbs/Back */}
            <Link href="/admin/products" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-black dark:hover:text-white transition-colors w-fit">
                <ChevronLeft className="w-3 h-3" />
                Back to Products
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-100 dark:border-neutral-900 pb-8">
                <div>
                    <h1 className="font-serif text-4xl font-bold text-black dark:text-white mb-2">Create Product</h1>
                    <p className="text-neutral-500 font-light max-w-md text-sm">
                        Define pricing, variants, and model specifications for your new release.
                    </p>
                </div>
            </div>

            <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Media & Model Details */}
                <div className="lg:col-span-1 space-y-10">
                    {/* Media Gallery with Integrated Model Insights */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Media & Model Insights</Label>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addProductImage}
                                className="h-8 rounded-full text-[8px] font-black uppercase tracking-widest px-4 border-neutral-200 dark:border-neutral-800"
                            >
                                <Plus className="w-3 h-3 mr-2" /> Add Image
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <AnimatePresence initial={false}>
                                {productImages.map((img, index) => (
                                    <motion.div
                                        key={img.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-5 bg-white dark:bg-black border border-neutral-100 dark:border-neutral-800 rounded-2xl space-y-5 relative group"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => removeProductImage(img.id)}
                                            className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        <div className="aspect-[4/5] rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all overflow-hidden relative">
                                            {img.previewUrl ? (
                                                <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <Plus className="w-6 h-6 text-neutral-300" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                                                        {index === 0 ? 'Upload Thumbnail' : 'Upload Alt View'}
                                                    </span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => e.target.files?.[0] && handleImageChange(img.id, e.target.files[0])}
                                            />
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            <div className="space-y-1.5">
                                                <Label className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Model Height</Label>
                                                <Input
                                                    placeholder="e.g. 5'9"
                                                    value={img.modelHeight}
                                                    onChange={(e) => updateImageInfo(img.id, 'modelHeight', e.target.value)}
                                                    className="h-10 text-[11px] font-bold bg-neutral-50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Size</Label>
                                                    <Input
                                                        placeholder="M"
                                                        value={img.wearingSize}
                                                        onChange={(e) => updateImageInfo(img.id, 'wearingSize', e.target.value)}
                                                        className="h-10 text-[11px] font-bold bg-neutral-50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800 uppercase"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Variant</Label>
                                                    <Input
                                                        placeholder="Color"
                                                        value={img.wearingVariant}
                                                        onChange={(e) => updateImageInfo(img.id, 'wearingVariant', e.target.value)}
                                                        className="h-10 text-[11px] font-bold bg-neutral-50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {productImages.length === 0 && (
                                <div
                                    onClick={addProductImage}
                                    className="aspect-[4/5] rounded-3xl border-2 border-dashed border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus className="w-6 h-6 text-neutral-300" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Add Primary Image</p>
                                        <p className="text-[8px] text-neutral-300 mt-1 uppercase tracking-tighter">Start your product drop</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Form Fields */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Basic Info & Collection */}
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Product Name</Label>
                                <Input placeholder="e.g. The Awuraba Maxi" className="bg-white dark:bg-black font-bold h-12 uppercase" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Collection</Label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <Select disabled={isAddingCollection}>
                                            <SelectTrigger className="bg-white dark:bg-black font-bold !h-12 w-full flex-1">
                                                <SelectValue placeholder="Select Collection" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {collections.map(c => (
                                                    <SelectItem key={c} value={c} className="uppercase font-bold text-xs">{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsAddingCollection(!isAddingCollection)}
                                            className="h-12 w-12 border-neutral-200 dark:border-neutral-800 p-0"
                                        >
                                            {isAddingCollection ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    <AnimatePresence>
                                        {isAddingCollection && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex gap-2 overflow-hidden"
                                            >
                                                <Input
                                                    value={newCollectionName}
                                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                                    className="flex-1 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 font-bold uppercase"
                                                    placeholder="New Collection Name..."
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        if (newCollectionName) {
                                                            setCollections([...collections, newCollectionName]);
                                                            setNewCollectionName('');
                                                            setIsAddingCollection(false);
                                                        }
                                                    }}
                                                    className="bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px]"
                                                >
                                                    Create
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Category</Label>
                                <Select>
                                    <SelectTrigger className="bg-white dark:bg-black font-bold !h-12 w-full">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dresses" className="uppercase font-bold text-xs">Dresses</SelectItem>
                                        <SelectItem value="sets" className="uppercase font-bold text-xs">Sets</SelectItem>
                                        <SelectItem value="tops" className="uppercase font-bold text-xs">Tops</SelectItem>
                                        <SelectItem value="bottoms" className="uppercase font-bold text-xs">Bottoms</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Fit Category</Label>
                                <Select>
                                    <SelectTrigger className="bg-white dark:bg-black font-bold !h-12 w-full">
                                        <SelectValue placeholder="Select Fit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="standard" className="uppercase font-bold text-xs">Standard</SelectItem>
                                        <SelectItem value="loose" className="uppercase font-bold text-xs">Loose</SelectItem>
                                        <SelectItem value="slim" className="uppercase font-bold text-xs">Slim</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Description</Label>
                            <Textarea rows={5} className="bg-white dark:bg-black font-medium leading-relaxed resize-none" placeholder="Tell the story of this piece..." />
                        </div>
                    </div>

                    {/* Robust Pricing System */}
                    <div className="pt-12 border-t border-neutral-100 dark:border-neutral-900 space-y-10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-black dark:text-white font-serif uppercase tracking-widest text-sm">Financial Structure</h2>
                            <div className="h-0.5 w-12 bg-black dark:bg-white"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Manufacturing Cost (GH₵)</Label>
                                    <Input
                                        type="number"
                                        value={cost || ''}
                                        onChange={(e) => setCost(Number(e.target.value))}
                                        className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 h-14 text-xl font-bold"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Projected Profit (GH₵)</Label>
                                    <Input
                                        type="number"
                                        value={projectedProfit || ''}
                                        onChange={(e) => setProjectedProfit(Number(e.target.value))}
                                        className="bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 h-14 text-xl font-bold"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Discount Type</Label>
                                        <Select
                                            value={discountType}
                                            onValueChange={(value: any) => setDiscountType(value)}
                                        >
                                            <SelectTrigger className="bg-white dark:bg-black font-bold !h-12 w-full uppercase text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none" className="uppercase font-bold text-xs">None</SelectItem>
                                                <SelectItem value="percent" className="uppercase font-bold text-xs">Percent (%)</SelectItem>
                                                <SelectItem value="fixed" className="uppercase font-bold text-xs">Fixed (GH₵)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Value</Label>
                                        <Input
                                            type="number"
                                            value={discountValue || ''}
                                            disabled={discountType === 'none'}
                                            onChange={(e) => setDiscountValue(Number(e.target.value))}
                                            className="bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 h-12 font-bold"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Summary Card */}
                            <div className="bg-black text-white dark:bg-white dark:text-black p-8 rounded-2xl space-y-8 shadow-xl">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Revenue Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="opacity-60">Retail Base Price</span>
                                        <span className="font-bold font-serif text-lg">GH₵ {retailPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-white/10 dark:border-black/5 pb-4">
                                        <span className="opacity-60">Marketing Discount</span>
                                        <span className="font-bold text-rose-500/90">- GH₵ {actualDiscount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-[9px]">Selling Price</span>
                                            <span className="text-3xl font-black font-serif">GH₵ {finalSellingPrice.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-[9px]">Net Profit</span>
                                            <span className={`text-xl font-bold ${actualProfit < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                GH₵ {actualProfit.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variant Logic (Dynamic) */}
                    <div className="pt-12 border-t border-neutral-100 dark:border-neutral-900 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-black dark:text-white font-serif uppercase tracking-widest text-sm">Variants</h2>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addVariant}
                                className="rounded-full text-[9px] font-black uppercase tracking-widest h-8 px-4 border-neutral-200 dark:border-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                            >
                                <Plus className="w-3 h-3 mr-2" /> Add
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <AnimatePresence initial={false}>
                                {variants.map((v) => (
                                    <motion.div
                                        key={v.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-900/10 border border-neutral-100 dark:border-neutral-800 rounded-xl group transition-all hover:border-neutral-200 dark:hover:border-neutral-700"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-sm">
                                                <div className="w-2.5 h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                                            </div>
                                            <Input
                                                value={v.name}
                                                onChange={(e) => updateVariantName(v.id, e.target.value)}
                                                placeholder="e.g. Emerald Green"
                                                className="bg-transparent border-none font-bold uppercase tracking-tight focus-visible:ring-0 px-0 h-auto text-[11px] flex-1 placeholder:text-neutral-300"
                                            />
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${v.available ? 'text-emerald-500' : 'text-neutral-400'}`}>
                                                    {v.available ? 'Available' : 'Sold Out'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleVariantAvailability(v.id)}
                                                    className={`w-9 h-4.5 rounded-full relative cursor-pointer transition-colors ${v.available ? 'bg-black dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-400/20'}`}
                                                >
                                                    <div className={`absolute top-0.75 w-3 h-3 rounded-full transition-all ${v.available ? 'right-0.75 bg-white dark:bg-black' : 'left-0.75 bg-neutral-500'}`} />
                                                </button>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeVariant(v.id)}
                                                className="text-neutral-300 hover:text-rose-500 h-8 w-8 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {variants.length === 0 && (
                                <div className="text-center py-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/20">
                                    <p className="text-[9px] text-neutral-400 uppercase font-black tracking-[0.2em]">No Active Variants</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-12 border-t border-neutral-100 dark:border-neutral-900 flex justify-end gap-3">
                        <Button
                            asChild
                            variant="outline"
                            className="px-8 h-14 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-neutral-200 dark:border-neutral-800"
                        >
                            <Link href="/admin/products">Back to Collection</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={isUploading}
                            className="bg-black dark:bg-white text-white dark:text-black px-12 h-14 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            {isUploading ? 'Finalizing Drop...' : success ? 'Published Successfully' : 'Launch Product'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
