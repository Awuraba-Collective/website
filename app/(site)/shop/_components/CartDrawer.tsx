"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  toggleCart,
  removeFromCart,
  updateQuantity,
} from "@/store/slices/cartSlice";
import { useEffect } from "react";
import posthog from "posthog-js";
import { formatPrice } from "@/lib/utils/currency";

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const { currency } = useAppSelector((state) => state.shop);
  const { items, isOpen } = useAppSelector((state) => state.cart);

  const total = items.reduce((sum, item) => {
    const price =
      currency === "USD" ? item.priceUSD ?? item.price / 15 : item.price;
    return sum + price * item.quantity;
  }, 0);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity cursor-pointer"
        onClick={() => dispatch(toggleCart())}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 h-screen shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10">
          <h2 className="font-serif text-2xl">Your Bag ({items.length})</h2>
          <button
            onClick={() => dispatch(toggleCart())}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50/50 dark:bg-neutral-900/50">
          {items.length === 0 ? (
            <div className="text-center py-20 text-neutral-500">
              <p>Your bag is empty.</p>
              <button
                onClick={() => dispatch(toggleCart())}
                className="mt-4 text-black dark:text-white underline font-medium"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3 bg-white dark:bg-black border border-neutral-100 dark:border-neutral-800 rounded-sm shadow-sm transition-all hover:shadow-md"
              >
                <div className="relative w-20 aspect-[3/4] bg-neutral-100 rounded-xs overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400 font-bold uppercase">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{item.name}</h3>
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
                            removal_location: "cart_drawer",
                            currency: "GHS",
                          });
                          dispatch(removeFromCart(item.id));
                        }}
                        className="text-neutral-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-neutral-500">
                      {item.selectedSize} / {item.selectedLength} /{" "}
                      {item.selectedVariant.name}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {formatPrice(
                        currency === "USD"
                          ? item.priceUSD ?? item.price / 15
                          : item.price,
                        currency
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const newQuantity = item.quantity - 1;
                        // PostHog: Track cart item quantity changed
                        posthog.capture("cart_item_quantity_changed", {
                          product_id: item.productId,
                          product_name: item.name,
                          price: item.price,
                          old_quantity: item.quantity,
                          new_quantity: newQuantity,
                          change_type: "decrease",
                          location: "cart_drawer",
                          currency: "GHS",
                        });
                        dispatch(
                          updateQuantity({ id: item.id, quantity: newQuantity })
                        );
                      }}
                      className="p-1 border rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        const newQuantity = item.quantity + 1;
                        // PostHog: Track cart item quantity changed
                        posthog.capture("cart_item_quantity_changed", {
                          product_id: item.productId,
                          product_name: item.name,
                          price: item.price,
                          old_quantity: item.quantity,
                          new_quantity: newQuantity,
                          change_type: "increase",
                          location: "cart_drawer",
                          currency: "GHS",
                        });
                        dispatch(
                          updateQuantity({ id: item.id, quantity: newQuantity })
                        );
                      }}
                      className="p-1 border rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4 bg-white dark:bg-neutral-900">
            <div className="flex justify-between items-center text-lg font-serif">
              <span>Subtotal</span>
              <span>{formatPrice(total, currency)}</span>
            </div>
            <div className="space-y-3">
              <Link
                href="/cart"
                onClick={() => dispatch(toggleCart())}
                className="block w-full border border-black dark:border-white text-black dark:text-white text-center py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
              >
                View Full Bag
              </Link>
              <Link
                href="/checkout"
                onClick={() => {
                  // PostHog: Track proceed to checkout clicked
                  posthog.capture("proceed_to_checkout_clicked", {
                    cart_total: total,
                    item_count: items.length,
                    total_quantity: items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    ),
                    source: "cart_drawer",
                    currency: "GHS",
                  });
                  dispatch(toggleCart());
                }}
                className="block w-full bg-black text-white dark:bg-white dark:text-black text-center py-4 uppercase tracking-[0.2em] text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
