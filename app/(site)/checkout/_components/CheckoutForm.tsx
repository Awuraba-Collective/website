"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePaystackPayment } from "react-paystack";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import {
  ArrowLeft,
  CheckCircle,
  Info,
  Loader2,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import posthog from "posthog-js";

// Paystack public key from environment
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

interface OrderResult {
  success: boolean;
  orderNumber?: string;
  error?: string;
}

interface PaystackConfig {
  reference: string;
  email: string;
  amount: number;
  publicKey: string;
  currency: string;
  metadata: {
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
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
  const [paymentConfig, setPaymentConfig] = useState<PaystackConfig | null>(
    null
  );

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Initialize payment via API
  const initializePayment = async () => {
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!formData.email || !validateEmail(formData.email)) {
      setError("Please enter a valid email address for payment receipt.");
      setIsSubmitting(false);
      return;
    }

    const hasPhone =
      formData.phone.trim() !== "+233" && formData.phone.trim() !== "";
    const hasWhatsapp =
      formData.whatsapp.trim() !== "+" && formData.whatsapp.trim() !== "";

    if (!hasPhone && !hasWhatsapp) {
      setError("Please provide either a Calling Number or a WhatsApp Number.");
      setIsSubmitting(false);
      return;
    }

    if (hasPhone && !validateGhanianPhone(formData.phone)) {
      setError(
        "Please enter a valid Ghanaian phone number (e.g., +233 123456789)"
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          phone: hasPhone ? formData.phone : formData.whatsapp,
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address || undefined,
          city: formData.city || undefined,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            variant: item.selectedVariant,
            price: item.price,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedLength: item.selectedLength,
            fitCategory: item.fitCategory,
            customMeasurements: item.customMeasurements,
            note: item.note,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.error || "Failed to initialize payment. Please try again."
        );
        setIsSubmitting(false);
        return;
      }

      // Track checkout initiated
      posthog.capture("checkout_payment_initiated", {
        order_total: total,
        item_count: items.length,
        payment_reference: result.reference,
      });

      // Store order number for success tracking
      setOrderNumber(result.orderNumber);

      // Set up Paystack config for popup
      setPaymentConfig({
        reference: result.reference,
        email: formData.email,
        amount: Math.round(total * 100), // Convert to pesewas
        publicKey: PAYSTACK_PUBLIC_KEY,
        currency: "GHS",
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: `${formData.firstName} ${formData.lastName}`,
            },
            {
              display_name: "Phone",
              variable_name: "phone",
              value: hasPhone ? formData.phone : formData.whatsapp,
            },
          ],
        },
      });
    } catch (err) {
      console.error("Payment initialization error:", err);
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Paystack success handler
  const onPaymentSuccess = async () => {
    // Track successful payment
    posthog.capture("order_payment_completed", {
      order_number: orderNumber,
      order_total: total,
      item_count: items.length,
    });

    // Identify user
    posthog.identify(formData.email, {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone !== "+233" ? formData.phone : null,
      whatsapp: formData.whatsapp || null,
    });

    setStep("success");
    dispatch(clearCart());
    setIsSubmitting(false);
    setPaymentConfig(null);
  };

  // Paystack close handler (popup closed without completing)
  const onPaymentClose = () => {
    posthog.capture("checkout_payment_abandoned", {
      order_total: total,
      item_count: items.length,
    });

    setIsSubmitting(false);
    setPaymentConfig(null);
    setError(
      "Payment was cancelled. Your order is still pending - you can try again."
    );
  };

  // Paystack payment hook - only initialize when config is ready
  const initPaystack = usePaystackPayment(
    paymentConfig || {
      reference: "",
      email: "",
      amount: 0,
      publicKey: PAYSTACK_PUBLIC_KEY,
    }
  );

  // Effect to trigger Paystack popup when config is ready
  const handlePayNow = () => {
    if (paymentConfig) {
      initPaystack({
        onSuccess: onPaymentSuccess,
        onClose: onPaymentClose,
      });
    } else {
      initializePayment();
    }
  };

  // When paymentConfig changes and isSubmitting is true, open popup
  if (paymentConfig && isSubmitting) {
    // Use setTimeout to defer the popup opening
    setTimeout(() => {
      initPaystack({
        onSuccess: onPaymentSuccess,
        onClose: onPaymentClose,
      });
    }, 100);
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif">Payment Successful!</h1>
          {orderNumber && (
            <p className="text-sm text-neutral-500 uppercase tracking-widest">
              Order #{orderNumber}
            </p>
          )}
          <p className="text-neutral-600 dark:text-neutral-400">
            Thank you for your order, {formData.firstName}! We&apos;ve received
            your payment and will contact you at{" "}
            <span className="text-black dark:text-white font-bold">
              {formData.phone !== "+233" ? formData.phone : formData.whatsapp}
            </span>{" "}
            to confirm delivery details.
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
              <h2 className="font-serif text-2xl mb-6">Contact & Payment</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePayNow();
                }}
                className="space-y-4"
              >
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
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="your@email.com"
                    className="w-full p-3 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest">
                    Required for payment receipt
                  </p>
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
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay ₵{total.toFixed(2)} Now
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-neutral-400 mt-3 uppercase tracking-widest">
                    Secure payment powered by Paystack
                  </p>
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
                        {item.selectedSize} / {item.selectedVariant.name}
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
                    Calculated at delivery
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
                    Delivery fee will be confirmed separately after payment.
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
