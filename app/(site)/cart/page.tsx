"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  Ruler,
  Edit,
  MessageCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  removeFromCart,
  updateQuantity,
  updateCartItem,
} from "@/store/slices/cartSlice";
import { motion, AnimatePresence } from "framer-motion";
import { EditItemModal } from "@/app/(site)/shop/_components/EditItemModal";
import { useState, useEffect } from "react";
import { fetchProducts } from "@/store/slices/shopSlice";
import { CartItem } from "@/types/shop";
import posthog from "posthog-js";
import { formatPrice } from "@/lib/utils/currency";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const { products, loading, currency } = useAppSelector((state) => state.shop);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  const total = items.reduce((sum, item) => {
    const itemPrice =
      currency === "USD" ? item.priceUSD ?? item.price / 15 : item.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6">
          <h1 className="font-serif text-4xl lg:text-5xl">Your Bag is Empty</h1>
          <p className="text-neutral-500 max-w-md mx-auto">
            Looks like you haven't added any pieces to your collection yet.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-black text-white dark:bg-white dark:text-black px-12 py-4 uppercase tracking-[0.2em] text-xs font-bold transition-transform active:scale-95"
          >
            Explore Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black min-h-screen py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 border-b border-neutral-100 dark:border-neutral-900 pb-8">
          <div className="space-y-2">
            <Link
              href="/shop"
              className="text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-2 group transition-colors"
            >
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />{" "}
              Back to Shop
            </Link>
            <h1 className="font-serif text-4xl lg:text-5xl tracking-tight">
              Your Selection
            </h1>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Subtotal
            </p>
            <p className="text-2xl font-bold">{formatPrice(total, currency)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-12">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group grid grid-cols-1 sm:grid-cols-12 gap-6 pb-12 border-b border-neutral-50 dark:border-neutral-900 last:border-0"
                >
                  {/* Product Image */}
                  <div className="sm:col-span-4 lg:col-span-3">
                    <div className="relative aspect-[3/4] bg-neutral-100 rounded-sm overflow-hidden border border-neutral-100 dark:border-neutral-800">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-xs text-neutral-400 font-bold uppercase">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="sm:col-span-8 lg:col-span-9 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-serif mb-1 group-hover:underline underline-offset-4 decoration-neutral-200 transition-all">
                          {item.name}
                        </h3>
                        <p className="text-sm font-bold tracking-wider">
                          {formatPrice(
                            currency === "USD"
                              ? item.priceUSD ?? item.price / 15
                              : item.price,
                            currency
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                          title="Edit Selections"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            // PostHog: Track cart item removed
                            posthog.capture("cart_item_removed", {
                              product_id: item.productId,
                              product_name: item.name,
                              price: item.price,
                              quantity: item.quantity,
                              selected_size: item.selectedSize,
                              selected_variant: item.selectedVariant,
                              selected_length: item.selectedLength,
                              removal_location: "cart_page",
                              currency: "GHS",
                            });
                            dispatch(removeFromCart(item.id));
                          }}
                          className="p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Row of Options */}
                    <div className="flex flex-wrap gap-x-8 gap-y-4 mb-6 py-4 border-y border-neutral-50 dark:border-neutral-900">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 block">
                          Variant
                        </span>
                        <span className="text-xs font-bold uppercase">
                          {item.selectedVariant.name}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 block">
                          Size (Fit)
                        </span>
                        <span className="text-xs font-bold uppercase">
                          {item.selectedSize}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 block">
                          Length
                        </span>
                        <span className="text-xs font-bold uppercase">
                          {item.selectedLength}
                        </span>
                      </div>
                    </div>

                    {/* Custom Measurements & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                      {item.note && (
                        <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-sm space-y-3">
                          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                            <MessageCircle className="w-3 h-3" /> Note
                          </div>
                          <p className="text-xs italic text-neutral-600 dark:text-neutral-400">
                            "{item.note}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-4 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-sm">
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                id: item.id,
                                quantity: item.quantity - 1,
                              })
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                id: item.id,
                                quantity: item.quantity + 1,
                              })
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm font-bold">
                        {formatPrice(
                          (currency === "USD"
                            ? item.priceUSD ?? item.price / 15
                            : item.price) * item.quantity,
                          currency
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32 bg-neutral-50 dark:bg-neutral-900 p-8 rounded-sm space-y-8">
              <h2 className="font-serif text-2xl pb-4 border-b border-neutral-200 dark:border-neutral-800">
                Summary
              </h2>

              <div className="space-y-4">
                {/* <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Subtotal</span>
                                    <span className="font-bold">₵ {total.toFixed(2)}</span>
                                </div> */}
                {/* <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Shipping</span>
                                    <span className="text-xs italic text-neutral-400">Calculated at checkout</span>
                                </div> */}
                <div className=" border-neutral-200 dark:border-neutral-800 flex justify-between items-end">
                  <span className="font-serif text-xl">Total</span>
                  <span className="text-2xl font-bold">
                    {formatPrice(total, currency)}
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Link
                  href="/checkout"
                  className="block w-full bg-black text-white dark:bg-white dark:text-black text-center py-5 uppercase tracking-[0.25em] text-xs font-black transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <EditItemModal
            item={editingItem}
            variants={
              products.find((p) => p.id === editingItem.productId)?.variants ||
              []
            }
            media={
              products.find((p) => p.id === editingItem.productId)?.media as any
            }
            fitCategory={
              (products.find((p) => p.id === editingItem.productId) as any)
                ?.fitCategory
            }
            onClose={() => setEditingItem(null)}
            onSave={(updatedItem) => {
              dispatch(
                updateCartItem({ id: editingItem.id, newItem: updatedItem })
              );
              setEditingItem(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
