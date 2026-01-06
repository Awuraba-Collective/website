'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
    const dispatch = useAppDispatch();
    const { items } = useAppSelector((state) => state.cart);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [step, setStep] = useState<'details' | 'success'>('details');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate order processing
        setTimeout(() => {
            setStep('success');
            dispatch(clearCart());
        }, 1500);
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
                <div className="text-center space-y-6 max-w-md">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-serif">Order Confirmed!</h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Thank you for your order, {formData.firstName}. We will contact you shortly to confirm payment and delivery details.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-block bg-black text-white dark:bg-white dark:text-black px-8 py-3 uppercase tracking-widest font-bold mt-4"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <div className="text-center">
                    <h1 className="text-2xl font-serif mb-4">Your cart is empty</h1>
                    <Link href="/shop" className="underline">Return to Shop</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/shop" className="inline-flex items-center text-sm text-neutral-500 hover:text-black dark:hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* Form Section */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-black p-6 sm:p-8 shadow-sm rounded-sm">
                            <h2 className="font-serif text-2xl mb-6">Contact & Shipping</h2>
                            <form onSubmit={handlePlaceOrder} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            required
                                            className="w-full p-3 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            required
                                            className="w-full p-3 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full p-3 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        className="w-full p-3 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        className="w-full p-3 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        className="w-full p-3 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="pt-6">
                                    <button type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black py-4 uppercase tracking-widest font-bold hover:opacity-90 transition-opacity">
                                        Place Order
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:sticky lg:top-24 h-fit space-y-6">
                        <div className="bg-white dark:bg-black p-6 sm:p-8 shadow-sm rounded-sm">
                            <h3 className="font-serif text-xl mb-6">Order Summary</h3>
                            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4 last:border-0 last:pb-0">
                                        <div className="relative w-16 h-20 bg-neutral-100 flex-shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs flex items-center justify-center font-bold">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{item.name}</p>
                                            <p className="text-xs text-neutral-500">{item.selectedSize} / {item.selectedColor}</p>
                                            {item.note && <p className="text-xs text-neutral-400 italic mt-1">Note: {item.note}</p>}
                                        </div>
                                        <div className="text-sm font-medium">
                                            ₵ {(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-neutral-200 dark:border-neutral-700 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Subtotal</span>
                                    <span>₵ {total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Shipping</span>
                                    <span className="text-neutral-400 italic">Calculated later</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-2">
                                    <span>Total</span>
                                    <span>₵ {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
