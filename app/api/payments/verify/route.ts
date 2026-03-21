import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { paymentRatelimit, checkRateLimit } from "@/lib/ratelimit";
import { verifyPayment } from "@/lib/paystack";
import { OrderStatus, PaymentStatus, Prisma } from "@/app/generated/prisma";
import { getLogger, withFlush } from "@/lib/logger";

const log = getLogger("payments/verify");

export const GET = withFlush(async (request: NextRequest) => {
  // Rate limiting: 5 requests per minute per IP
  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "anonymous";
  const { success: rateLimitOk } = await checkRateLimit(paymentRatelimit, ip);

  if (!rateLimitOk) {
    log.warn("Rate limit exceeded", { endpoint: "/api/payments/verify", ip });
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      log.warn("Verify called without reference parameter", {
        endpoint: "/api/payments/verify",
        ip,
      });
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 },
      );
    }

    // Verify payment with Paystack
    const verification = await verifyPayment(reference);

    if (!verification.status) {
      log.error("Paystack verification returned failure status", {
        endpoint: "/api/payments/verify",
        reference,
      });
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 },
      );
    }

    const { data } = verification;

    // Find the payment record by reference
    const payment = await prisma.payment.findFirst({
      where: { providerRef: reference },
      include: { order: true },
    });

    if (!payment) {
      log.error("Payment record not found", {
        endpoint: "/api/payments/verify",
        reference,
      });
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 },
      );
    }

    // Check if already processed
    if (payment.status === PaymentStatus.COMPLETED) {
      log.info("Idempotent verify — payment already completed", {
        endpoint: "/api/payments/verify",
        reference,
        orderId: payment.orderId,
        orderNumber: payment.order.orderNumber,
      });
      return NextResponse.json({
        success: true,
        status: "already_completed",
        orderNumber: payment.order.orderNumber,
      });
    }

    // Update based on Paystack status
    if (data.status === "success") {
      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(data.paid_at!),
          providerData: data as unknown as Prisma.InputJsonValue,
        },
      });

      // Update order status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.CONFIRMED },
      });

      // Add timeline event
      await prisma.orderEvent.create({
        data: {
          orderId: payment.orderId,
          status: OrderStatus.CONFIRMED,
          note: `Payment confirmed via ${data.channel}. Reference: ${reference}`,
        },
      });

      log.info("Payment verified and order confirmed", {
        endpoint: "/api/payments/verify",
        reference,
        orderId: payment.orderId,
        orderNumber: payment.order.orderNumber,
        channel: data.channel,
        paidAt: data.paid_at ?? "",
      });

      return NextResponse.json({
        success: true,
        status: "completed",
        orderNumber: payment.order.orderNumber,
        paidAt: data.paid_at,
      });
    } else if (data.status === "failed") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          providerData: data as unknown as Prisma.InputJsonValue,
        },
      });

      log.warn("Payment failed", {
        endpoint: "/api/payments/verify",
        reference,
        orderId: payment.orderId,
        orderNumber: payment.order.orderNumber,
        gatewayResponse: data.gateway_response ?? "",
      });

      return NextResponse.json({
        success: false,
        status: "failed",
        orderNumber: payment.order.orderNumber,
        message: data.gateway_response,
      });
    } else {
      // pending or abandoned
      log.warn("Payment in non-terminal state", {
        endpoint: "/api/payments/verify",
        reference,
        orderId: payment.orderId,
        orderNumber: payment.order.orderNumber,
        paystackStatus: data.status,
      });

      return NextResponse.json({
        success: false,
        status: data.status,
        orderNumber: payment.order.orderNumber,
      });
    }
  } catch (error: any) {
    log.error("Unhandled exception in payment verification", {
      endpoint: "/api/payments/verify",
      error: error?.message ?? "unknown",
    });
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 },
    );
  }
});
