"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { ArrowLeft, CheckCircle, Info, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import posthog from "posthog-js";
import { createOrder } from "@/app/actions/order-actions";

interface OrderResult {
  success: boolean;
  orderNumber?: string;
  error?: string;
}

export function CheckoutForm() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const [step, setStep] = useState<"details" | "success">("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "+233",
    whatsapp: "",
    address: "",
    city: "",
    hasDeliveryDetails: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateGhanianPhone = (number: string) => {
    const cleanNumber = number.replace(/\s/g, "");
    const ghanaRegex = /^\+233\d{9}$/;
    return ghanaRegex.test(cleanNumber);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const hasPhone =
      formData.phone.trim() !== "+233" && formData.phone.trim() !== "";
    const hasWhatsapp =
      formData.whatsapp.trim() !== "+" && formData.whatsapp.trim() !== "";

    if (!hasPhone && !hasWhatsapp) {
      setError("Please provide either a Calling Number or a WhatsApp Number.");
      return;
    }

    if (hasPhone && !validateGhanianPhone(formData.phone)) {
      setError(
        "Please enter a valid Ghanaian phone number (e.g., +233 123456789)"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data for PostHog
      const orderData = {
        order_total: total,
        item_count: items.length,
        total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        items: items.map((item) => ({
          product_id: item.productId,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
          selected_size: item.selectedSize,
          selected_variant: item.selectedVariant,
          selected_length: item.selectedLength,
        })),
        customer_first_name: formData.firstName,
        customer_city: formData.city || null,
        has_delivery_details: formData.hasDeliveryDetails,
        contact_method: hasPhone ? "phone" : "whatsapp",
        currency: "GHS",
      };

      // Call server action
      const result: OrderResult = await createOrder({
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: hasPhone ? formData.phone : undefined,
          whatsapp: hasWhatsapp ? formData.whatsapp : undefined,
          address: formData.address || undefined,
          city: formData.city || undefined,
        },
        items: items,
      });

      if (!result.success) {
        setError(result.error || "Failed to place order. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // PostHog: Track order placed (conversion event)
      posthog.capture("order_placed", {
        ...orderData,
        order_number: result.orderNumber,
      });

      // PostHog: Identify user by phone/whatsapp for future correlation
      const contactInfo = hasPhone ? formData.phone : formData.whatsapp;
      posthog.identify(contactInfo, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone !== "+233" ? formData.phone : null,
        whatsapp: formData.whatsapp || null,
        city: formData.city || null,
        address: formData.address || null,
      });

      setOrderNumber(result.orderNumber || null);
      setStep("success");
      dispatch(clearCart());
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif">Order Confirmed!</h1>
          {orderNumber && (
            <p className="text-sm text-neutral-500 uppercase tracking-widest">
              Order #{orderNumber}
            </p>
          )}
          <p className="text-neutral-600 dark:text-neutral-400">
            Thank you for your selection, {formData.firstName}. We will contact
            you at{" "}
            <span className="text-black dark:text-white font-bold">
              {formData.phone !== "+233" ? formData.phone : formData.whatsapp}
            </span>{" "}
            shortly to arrange delivery and confirm payment.
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
          <Link href="/shop" className="underline">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-xs uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />{" "}
            Back to Bag
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Form Section */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-black p-6 sm:p-8 shadow-sm rounded-sm">
              <h2 className="font-serif text-2xl mb-6">Contact Details</h2>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 text-sm rounded-sm border border-red-100 mb-4">
                    {error}
                  </div>
                )}

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
                  <label className="text-sm font-medium">
                    Calling Number (Ghanaian)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full p-3 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest">
                    Must be a valid Ghanaian number
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">WhatsApp Number</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    className="w-full p-3 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        hasDeliveryDetails: !prev.hasDeliveryDetails,
                      }))
                    }
                    className="text-xs uppercase tracking-widest font-bold text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-2"
                  >
                    {formData.hasDeliveryDetails
                      ? "- Hide Delivery Details"
                      : "+ Add Delivery Details (Optional)"}
                  </button>

                  <AnimatePresence>
                    {formData.hasDeliveryDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 mt-6 overflow-hidden"
                      >
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Address / Specific Locality
                          </label>
                          <input
                            type="text"
                            name="address"
                            placeholder="e.g. East Legon, near Shoprite"
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
                            placeholder="Accra"
                            className="w-full p-3 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm"
                            value={formData.city}
                            onChange={handleInputChange}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white dark:bg-white dark:text-black py-4 uppercase tracking-widest font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit space-y-6">
            <div className="bg-white dark:bg-black p-6 sm:p-8 shadow-sm rounded-sm">
              <h3 className="font-serif text-xl mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="relative w-16 h-20 bg-neutral-100 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white dark:bg-white dark:text-black rounded-full text-[10px] flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                        {item.selectedSize} / {item.selectedVariant}
                      </p>
                      {item.note && (
                        <p className="text-[10px] text-neutral-400 italic mt-1 line-clamp-1">
                          Note: {item.note}
                        </p>
                      )}
                    </div>
                    <div className="text-sm font-bold">
                      ₵ {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-neutral-200 dark:border-neutral-700 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-bold">₵ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-neutral-500">Delivery Fee</span>
                  </div>
                  <span className="text-xs text-neutral-400 italic opacity-60">
                    Pay on Delivery
                  </span>
                </div>
                <div className="flex justify-between text-xl font-serif border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-2">
                  <span>Total Payable</span>
                  <span className="font-sans font-bold text-2xl tracking-tighter">
                    ₵ {total.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-4 opacity-70">
                  <Info className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                  <p className="text-[9px] uppercase tracking-widest leading-relaxed text-neutral-500">
                    We will contact you to finalize delivery and confirm
                    payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
