/**
 * Paystack Payment Integration Utilities
 *
 * Server-side functions for payment initialization and verification
 */

// Environment variables
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

/**
 * Convert GHS amount to pesewas (smallest currency unit)
 * Paystack requires amounts in the smallest currency denomination
 */
export function toPesewas(amountInGHS: number): number {
  return Math.round(amountInGHS * 100);
}

/**
 * Convert pesewas back to GHS
 */
export function toGHS(amountInPesewas: number): number {
  return amountInPesewas / 100;
}

interface InitializePaymentInput {
  email: string;
  amount: number; // In GHS
  reference?: string;
  metadata?: Record<string, unknown>;
  callbackUrl?: string;
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

/**
 * Initialize a Paystack transaction
 * This creates a new payment that the customer can complete
 */
export async function initializePayment(
  input: InitializePaymentInput
): Promise<PaystackInitializeResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: toPesewas(input.amount),
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
      currency: "GHS",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Paystack initialization failed: ${error}`);
  }

  return response.json();
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: "success" | "failed" | "abandoned" | "pending";
    reference: string;
    amount: number;
    gateway_response: string;
    paid_at: string | null;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, unknown>;
    customer: {
      id: number;
      email: string;
      customer_code: string;
      phone: string | null;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
    };
  };
}

/**
 * Verify a Paystack transaction
 * Always verify payments server-side before completing orders
 */
export async function verifyPayment(
  reference: string
): Promise<PaystackVerifyResponse> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Paystack verification failed: ${error}`);
  }

  return response.json();
}

/**
 * Generate a unique payment reference
 * Format: AWR-PAY-TIMESTAMP-RANDOM
 */
export function generatePaymentReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AWR-PAY-${timestamp}-${random}`;
}

/**
 * Verify Paystack webhook signature
 * Used to validate that webhook events are genuinely from Paystack
 */
export async function verifyWebhookSignature(
  body: string,
  signature: string
): Promise<boolean> {
  const crypto = await import("crypto");
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");
  return hash === signature;
}
