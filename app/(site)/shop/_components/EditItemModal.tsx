"use client";

import { useState, useEffect } from "react";
import { X, Ruler, Check, Info } from "lucide-react";
import Image from "next/image";
import { CartItem } from "@/types/shop";
import { SerializableFitSize } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Length, ProductVariant } from "@/app/generated/prisma";

const lengths = Object.values(Length);

interface EditItemModalProps {
  item: CartItem;
  variants: ProductVariant[];
  fitCategory?: {
    name: string;
    sizes: SerializableFitSize[];
  };
  media?: {
    src: string;
    type: string;
    modelWearingVariant?: string | null;
    alt: string;
  }[];
  onClose: () => void;
  onSave: (updatedItem: CartItem) => void;
}

export function EditItemModal({
  item,
  variants,
  fitCategory,
  media,
  onClose,
  onSave,
}: EditItemModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>(item.selectedSize);
  const [selectedLength, setSelectedLength] = useState<Length>(
    item.selectedLength
  );
  const [selectedVariant, setSelectedVariant] = useState(item.selectedVariant);
  const [note, setNote] = useState(item.note || "");

  const sizes = fitCategory?.sizes.map((s) => s.name) || [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
  ];

  const handleSave = () => {
    // Find correct image for the new variant if media is provided
    let newImage = item.image;
    if (media) {
      const variantImage = media.find(
        (m) =>
          m.type === "IMAGE" &&
          (m.modelWearingVariant?.toLowerCase() ===
            selectedVariant.name.toLowerCase() ||
            m.alt.toLowerCase().includes(selectedVariant.name.toLowerCase()))
      );
      if (variantImage) {
        newImage = variantImage.src;
      }
    }

    const updatedItem: CartItem = {
      ...item,
      id: `${item.productId}-${selectedSize}-${selectedLength}-${selectedVariant}`,
      selectedSize,
      selectedLength,
      selectedVariant,
      image: newImage,
      customMeasurements: undefined,
      note,
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
          <h2 className="font-serif text-2xl tracking-tight">
            Edit Selections
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Variant Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">
                Select Variant
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {variants.map((v) => {
                // Find the first IMAGE for this variant preview
                const variantPreview = media?.find(
                  (img) =>
                    img.type === "IMAGE" &&
                    (img.modelWearingVariant?.toLowerCase() ===
                      v.name.toLowerCase() ||
                      img.alt.toLowerCase().includes(v.name.toLowerCase()))
                );

                return (
                  <button
                    key={v.name}
                    disabled={!v.isAvailable}
                    onClick={() => setSelectedVariant(v)}
                    className={clsx(
                      "relative w-16 h-16 rounded-lg border-2 transition-all overflow-hidden",
                      selectedVariant.name === v.name
                        ? "border-black dark:border-white ring-2 ring-black dark:ring-white ring-offset-2"
                        : v.isAvailable
                        ? "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                        : "border-neutral-200 dark:border-neutral-800 cursor-not-allowed opacity-50"
                    )}
                    title={v.name}
                  >
                    {variantPreview && variantPreview.src ? (
                      <Image
                        src={variantPreview.src}
                        alt={v.name}
                        fill
                        className="object-cover scale-150"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase text-center px-1">
                          {v.name.substring(0, 3)}
                        </span>
                      </div>
                    )}
                    {!v.isAvailable && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center">
                        <div className="w-full h-[2px] bg-neutral-400 dark:bg-neutral-600 rotate-45" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">
                Select Size ({item.fitCategory})
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
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

          {/* Length Selection */}
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">
              Select Length
            </span>
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
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">
              Additional Note
            </span>
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
