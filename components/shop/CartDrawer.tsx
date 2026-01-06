'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleCart, removeFromCart, updateQuantity } from '@/store/slices/cartSlice';
import { useEffect } from 'react';

export function CartDrawer() {
    const dispatch = useAppDispatch();
    const { items, isOpen } = useAppSelector((state) => state.cart);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Prevent background scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => dispatch(toggleCart())}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
                    <h2 className="font-serif text-2xl">Your Cart ({items.length})</h2>
                    <button onClick={() => dispatch(toggleCart())} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="text-center py-20 text-neutral-500">
                            <p>Your cart is empty.</p>
                            <button
                                onClick={() => dispatch(toggleCart())}
                                className="mt-4 text-black dark:text-white underline font-medium"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="relative w-20 aspect-[3/4] bg-neutral-100 rounded-sm overflow-hidden flex-shrink-0">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium">{item.name}</h3>
                                            <button
                                                onClick={() => dispatch(removeFromCart(item.id))}
                                                className="text-neutral-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-neutral-500">
                                            {item.selectedSize} / {item.selectedLength} / {item.selectedColor}
                                        </p>
                                        <p className="text-sm font-medium mt-1">₵ {item.price.toFixed(2)}</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                                            className="p-1 border rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
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
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Subtotal</span>
                            <span>₵ {total.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-neutral-500 text-center">Shipping & taxes calculated at checkout</p>
                        <Link
                            href="/checkout"
                            onClick={() => dispatch(toggleCart())}
                            className="block w-full bg-black text-white dark:bg-white dark:text-black text-center py-4 uppercase tracking-widest font-bold hover:opacity-90 transition-opacity"
                        >
                            Checkout
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
