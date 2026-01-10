"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type VerificationStatus = "loading" | "success" | "failed" | "error";

interface VerificationResult {
  success: boolean;
  status: string;
  orderNumber?: string;
  message?: string;
}

export default function CheckoutCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (!reference) {
      setStatus("error");
      setErrorMessage("Payment reference not found");
      return;
    }

    async function verifyPayment() {
      try {
        const response = await fetch(
          `/api/payments/verify?reference=${encodeURIComponent(reference!)}`
        );
        const result: VerificationResult = await response.json();

        if (
          result.success ||
          result.status === "already_completed" ||
          result.status === "completed"
        ) {
          setStatus("success");
          setOrderNumber(result.orderNumber || null);
        } else if (result.status === "failed") {
          setStatus("failed");
          setErrorMessage(result.message || "Payment was declined");
        } else {
          setStatus("error");
          setErrorMessage(result.message || "Payment verification failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setErrorMessage("Unable to verify payment. Please contact support.");
      }
    }

    verifyPayment();
  }, [searchParams, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
        <div className="text-center space-y-6">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-neutral-400" />
          <h1 className="text-2xl font-serif">Verifying Payment...</h1>
          <p className="text-neutral-500">
            Please wait while we confirm your payment
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
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
            Thank you for your order! We&apos;ve received your payment and will
            begin processing your order shortly. You&apos;ll receive a
            confirmation message soon.
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

  // Failed or error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif">
          {status === "failed" ? "Payment Failed" : "Something Went Wrong"}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          {errorMessage ||
            "We couldn't process your payment. Please try again."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Link
            href="/checkout"
            className="inline-block bg-black text-white dark:bg-white dark:text-black px-8 py-3 uppercase tracking-widest font-bold"
          >
            Try Again
          </Link>
          <Link
            href="/cart"
            className="inline-block border border-black dark:border-white px-8 py-3 uppercase tracking-widest font-bold"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
