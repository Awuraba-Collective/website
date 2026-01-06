'use client';

import { useState, useEffect } from 'react';
import { X, Ruler, Check, Info } from 'lucide-react';
import { CartItem, Size, Length, CustomMeasurements, FitCategory, ProductVariant } from '@/types/shop';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface EditItemModalProps {
    item: CartItem;
    variants: ProductVariant[];
    onClose: () => void;
    onSave: (updatedItem: CartItem) => void;
}

const standardSizes: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];
const looseSizes: Size[] = ['S', 'M', 'L', 'Custom'];
const lengths: Length[] = ['Petite', 'Regular', 'Tall'];

export function EditItemModal({ item, variants, onClose, onSave }: EditItemModalProps) {
    const [selectedSize, setSelectedSize] = useState<Size>(item.selectedSize);
    const [selectedLength, setSelectedLength] = useState<Length>(item.selectedLength);
    const [selectedVariant, setSelectedVariant] = useState(item.selectedVariant);
    const [customMeasurements, setCustomMeasurements] = useState<CustomMeasurements>(item.customMeasurements || {});
    const [note, setNote] = useState(item.note || '');

    const sizes = item.fitCategory === 'Loose' ? looseSizes : standardSizes;

    const handleSave = () => {
        const updatedItem: CartItem = {
            ...item,
            id: `${item.productId}-${selectedSize}-${selectedLength}-${selectedVariant}`,
            selectedSize,
            selectedLength,
            selectedVariant,
            customMeasurements: selectedSize === 'Custom' ? customMeasurements : undefined,
            note
        };
        onSave(updatedItem);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
                    <h2 className="font-serif text-2xl tracking-tight">Edit Selections</h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10">

                    {/* Variant Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Select Variant</span>
                            <span className="text-xs font-serif italic text-black dark:text-white">{selectedVariant}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {variants.map((v) => (
                                <button
                                    key={v.name}
                                    onClick={() => v.isAvailable && setSelectedVariant(v.name)}
                                    disabled={!v.isAvailable}
                                    className={clsx(
                                        "px-4 py-2 text-xs uppercase tracking-widest border transition-all relative overflow-hidden",
                                        selectedVariant === v.name
                                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                                            : "border-neutral-200 text-neutral-500 hover:border-black dark:border-neutral-800 dark:hover:border-white",
                                        !v.isAvailable && "opacity-30 cursor-not-allowed strike-through"
                                    )}
                                >
                                    {v.name}
                                    {!v.isAvailable && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-full h-[1px] bg-neutral-400 -rotate-12" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Select Size ({item.fitCategory} Fit)</span>
                            <button className="text-[10px] uppercase tracking-widest flex items-center gap-1.5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                                <Info className="w-3 h-3" /> Size Guide
                            </button>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={clsx(
                                        "h-12 flex items-center justify-center text-xs border transition-all",
                                        selectedSize === size
                                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-bold"
                                            : "border-neutral-200 text-neutral-500 hover:border-black dark:border-neutral-800 dark:hover:border-white"
                                    )}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Measurements (Conditional) */}
                    <AnimatePresence>
                        {selectedSize === 'Custom' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 overflow-hidden"
                            >
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">
                                    <Ruler className="w-3 h-3" /> Measurements (Inches)
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {['bust', 'waist', 'hips', 'height'].map((field) => (
                                        <div key={field} className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-neutral-400">{field}</label>
                                            <input
                                                type="text"
                                                placeholder={field === 'height' ? "5'9\"" : '34"'}
                                                value={(customMeasurements as any)[field] || ''}
                                                onChange={(e) => setCustomMeasurements({ ...customMeasurements, [field]: e.target.value })}
                                                className="w-full bg-neutral-50 dark:bg-neutral-800 border-none px-4 py-3 text-sm focus:ring-1 focus:ring-black dark:focus:ring-white transition-all outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Length Selection */}
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Select Length</span>
                        <div className="grid grid-cols-3 gap-2">
                            {lengths.map((length) => (
                                <button
                                    key={length}
                                    onClick={() => setSelectedLength(length)}
                                    className={clsx(
                                        "h-12 flex items-center justify-center text-xs uppercase tracking-widest border transition-all",
                                        selectedLength === length
                                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-bold"
                                            : "border-neutral-200 text-neutral-500 hover:border-black dark:border-neutral-800 dark:hover:border-white"
                                    )}
                                >
                                    {length}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-4 pt-4">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Additional Note</span>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Tell us about any specific adjustments..."
                            className="w-full bg-neutral-50 dark:bg-neutral-800 border-none p-4 text-sm focus:ring-1 focus:ring-black dark:focus:ring-white transition-all outline-none min-h-[100px] resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-black text-white dark:bg-white dark:text-black py-4 text-xs uppercase tracking-[0.2em] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
