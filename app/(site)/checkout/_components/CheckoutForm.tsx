"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePaystackPayment } from "react-paystack";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  CheckCircle,
  Info,
  Loader2,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import posthog from "posthog-js";
import {
  getProductPrice,
  CURRENCY_SYMBOLS,
} from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EmptyCart } from "@/components/EmptyCart";

// Paystack public key from environment
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

interface Currency {
  code: string;
  symbol: string;
  rate: number;
  isBase: boolean;
  isActive: boolean;
}

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

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  whatsapp: z.string().min(1, "WhatsApp number is required").regex(/^\+\d{7,15}$/, "Invalid international phone format (e.g. +233123456789)"),
  phone: z.string().regex(/^\+\d{7,15}$/, "Invalid international phone format (e.g. +233123456789)").or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  hasDeliveryDetails: z.boolean(),
  useWhatsAppAsPhone: z.boolean(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
  const dispatch = useAppDispatch();
  const { items, currency: selectedCurrency, currencyRate: exchangeRate } = useAppSelector((state) => ({
    items: state.cart.items,
    currency: state.shop.currency,
    currencyRate: state.shop.currencyRate,
  }));

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      whatsapp: "+",
      address: "",
      city: "",
      region: "",
      hasDeliveryDetails: false,
      useWhatsAppAsPhone: false,
    },
  });

  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const whatsapp = watch("whatsapp");
  const useWhatsAppAsPhone = watch("useWhatsAppAsPhone");

  // Sync WhatsApp to phone when checkbox is checked
  useEffect(() => {
    if (useWhatsAppAsPhone) {
      setValue("phone", whatsapp);
    }
  }, [whatsapp, useWhatsAppAsPhone, setValue]);

  const [step, setStep] = useState<"details" | "success">("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaystackConfig | null>(
    null
  );

  // Success message and tracking data after payment
  const [submittedData, setSubmittedData] = useState<CheckoutFormData | null>(null);

  // Helper function to get item price in current selected currency
  const getItemDisplayPrice = (item: typeof items[0]) => {
    const { price, discountPrice } = getProductPrice(item, selectedCurrency);
    return discountPrice ?? price;
  };

  // Calculate total in selected currency for display
  const total = items.reduce(
    (sum, item) => sum + getItemDisplayPrice(item) * item.quantity,
    0
  );

  // Calculate GHS total for Paystack
  const ghsTotal = items.reduce((sum, item) => {
    // Get the price defined for the selected currency
    const currentPrice = getItemDisplayPrice(item);

    // If foreign currency, convert to GHS using exchange rate from Redux
    if (selectedCurrency !== 'GHS') {
      return sum + (currentPrice * exchangeRate * item.quantity);
    }

    // If GHS, use the price directly
    return sum + currentPrice * item.quantity;
  }, 0);

  // No longer fetching currencies here as they are managed in the store via CurrencySwitcher

  // Initialize payment via API
  const initializePayment = async (data: CheckoutFormData) => {
    setError(null);
    setIsSubmitting(true);

    // Store for success message and tracking
    setSubmittedData(data);

    // Derived email for Paystack and tracking
    const whatsappClean = data.whatsapp.replace(/[\s\-\+\(\)]/g, "");
    const derivedEmail = `${whatsappClean}@awuraba.com`;

    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: data.useWhatsAppAsPhone ? data.whatsapp : (data.phone || data.whatsapp),
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address || undefined,
          city: data.city || undefined,
          region: data.region || undefined,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            variant: item.selectedVariant,
            price: item.price,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedLength: item.selectedLength,
            fitCategory: item.fitCategory,
            note: item.note,
          })),
          currency: selectedCurrency,
          exchangeRate: exchangeRate,
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
        email: derivedEmail,
        amount: Math.round(ghsTotal * 100), // Convert GHS to pesewas
        publicKey: PAYSTACK_PUBLIC_KEY,
        currency: "GHS",
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: `${data.firstName} ${data.lastName}`,
            },
            {
              display_name: "Phone",
              variable_name: "phone",
              value: data.useWhatsAppAsPhone ? data.whatsapp : (data.phone || data.whatsapp),
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

    // Identify user if data exists
    if (submittedData) {
      posthog.identify(submittedData.whatsapp, {
        first_name: submittedData.firstName,
        last_name: submittedData.lastName,
        phone: submittedData.phone || null,
        whatsapp: submittedData.whatsapp,
      });
    }

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
  useEffect(() => {
    if (paymentConfig && isSubmitting) {
      const timer = setTimeout(() => {
        initPaystack({
          onSuccess: onPaymentSuccess,
          onClose: onPaymentClose,
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [paymentConfig, isSubmitting, initPaystack]);

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
            Thank you for your order, {submittedData?.firstName}! We&apos;ve received
            your payment and will contact you at{" "}
            <span className="text-black dark:text-white font-bold">
              {submittedData?.whatsapp}
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
      <div className="min-h-screen pt-20">
        <EmptyCart />
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
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(initializePayment)}
                  className="space-y-4"
                >
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 text-sm rounded-sm border border-red-100 mb-4">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            First Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="First Name"
                              className="bg-transparent border-neutral-200 dark:border-neutral-800"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Last Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Last Name"
                              className="bg-transparent border-neutral-200 dark:border-neutral-800"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          WhatsApp Number <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+233 123456789"
                            className="bg-transparent border-neutral-200 dark:border-neutral-800"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-[10px] text-neutral-400 uppercase tracking-widest">
                          Include country code (e.g., +233 for Ghana)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Calling Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1 234567890"
                            disabled={useWhatsAppAsPhone}
                            className="bg-transparent border-neutral-200 dark:border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="useWhatsAppAsPhone"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                          Use WhatsApp number as calling number
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <FormField
                      control={form.control}
                      name="hasDeliveryDetails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-xs uppercase tracking-widest font-bold text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer">
                            {field.value
                              ? "- Hide Delivery Details"
                              : "+ Add Delivery Details (Optional)"}
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <AnimatePresence>
                      {watch("hasDeliveryDetails") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 mt-6 overflow-hidden"
                        >
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">
                                  Address / Specific Locality
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g. East Legon, near Shoprite"
                                    className="bg-transparent border-neutral-200 dark:border-neutral-800"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">City</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Accra"
                                    className="bg-transparent border-neutral-200 dark:border-neutral-800"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 bg-black text-white dark:bg-white dark:text-black uppercase tracking-widest font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 rounded-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Pay {CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency}
                          {total.toFixed(2)} Now
                        </>
                      )}
                    </Button>
                    <p className="text-[10px] text-center text-neutral-400 mt-3 uppercase tracking-widest">
                      Secure payment powered by Paystack
                    </p>
                  </div>
                </form>
              </Form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit space-y-6">
            <div className="bg-white dark:bg-black p-6 sm:p-8 shadow-sm rounded-sm">
              <h3 className="font-serif text-xl mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto py-2 pr-4 custom-scrollbar">
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
                      {CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency} {(getItemDisplayPrice(item) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-neutral-200 dark:border-neutral-700 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-bold">{CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency} {total.toFixed(2)}</span>
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
                  <div className="text-right">
                    <div className="font-sans font-bold text-2xl tracking-tighter">
                      {CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency} {total.toFixed(2)}
                    </div>
                  </div>
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
