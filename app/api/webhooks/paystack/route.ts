import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { verifyWebhookSignature } from "@/lib/paystack";
import { OrderStatus, PaymentStatus, Prisma } from "@/app/generated/prisma";
import { getLogger, withFlush } from "@/lib/logger";

const log = getLogger("webhooks/paystack");

interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    gateway_response: string;
    paid_at: string | null;
    created_at: string;
    channel: string;
    currency: string;
    metadata: {
      orderId?: string;
      orderNumber?: string;
      customerName?: string;
      customerPhone?: string;
    };
    customer: {
      email: string;
      customer_code: string;
    };
  };
}

export const POST = withFlush(async (request: NextRequest) => {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(body, signature);
    if (!isValid) {
      log.error("Invalid Paystack webhook signature", {
        endpoint: "/api/webhooks/paystack",
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: PaystackWebhookEvent = JSON.parse(body);

    log.info(`Paystack webhook received: ${event.event}`, {
      endpoint: "/api/webhooks/paystack",
      eventType: event.event,
      reference: event.data.reference,
    });

    // Handle different event types
    switch (event.event) {
      case "charge.success": {
        const { reference } = event.data;

        // Find payment by reference
        const payment = await prisma.payment.findFirst({
          where: { providerRef: reference },
          include: { order: true },
        });

        if (!payment) {
          log.warn("charge.success received but payment record not found", {
            endpoint: "/api/webhooks/paystack",
            reference,
          });
          return NextResponse.json({ received: true });
        }

        // Skip if already completed
        if (payment.status === PaymentStatus.COMPLETED) {
          log.info("charge.success ignored — payment already completed", {
            endpoint: "/api/webhooks/paystack",
            reference,
            orderId: payment.orderId,
          });
          return NextResponse.json({ received: true });
        }

        // Update payment
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.COMPLETED,
            paidAt: event.data.paid_at
              ? new Date(event.data.paid_at)
              : new Date(),
            providerData: event.data as unknown as Prisma.InputJsonValue,
          },
        });

        // Update order
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.CONFIRMED },
        });

        // Add timeline event
        await prisma.orderEvent.create({
          data: {
            orderId: payment.orderId,
            status: OrderStatus.CONFIRMED,
            note: `Payment confirmed via webhook. Channel: ${event.data.channel}`,
          },
        });

        log.info("charge.success processed — order confirmed", {
          endpoint: "/api/webhooks/paystack",
          reference,
          orderId: payment.orderId,
          orderNumber: payment.order.orderNumber,
          channel: event.data.channel,
          amountKobo: event.data.amount,
        });
        break;
      }

      case "charge.failed": {
        const { reference, gateway_response } = event.data;

        const payment = await prisma.payment.findFirst({
          where: { providerRef: reference },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.FAILED,
              providerData: event.data as unknown as Prisma.InputJsonValue,
            },
          });

          await prisma.orderEvent.create({
            data: {
              orderId: payment.orderId,
              status: OrderStatus.PENDING,
              note: `Payment failed: ${gateway_response}`,
            },
          });

          log.warn("charge.failed processed", {
            endpoint: "/api/webhooks/paystack",
            reference,
            orderId: payment.orderId,
            gatewayResponse: gateway_response,
          });
        } else {
          log.warn("charge.failed received but payment record not found", {
            endpoint: "/api/webhooks/paystack",
            reference,
          });
        }
        break;
      }

      default:
        log.info(`Unhandled Paystack event type: ${event.event}`, {
          endpoint: "/api/webhooks/paystack",
          eventType: event.event,
          reference: event.data.reference,
        });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    log.error("Unhandled exception in Paystack webhook handler", {
      endpoint: "/api/webhooks/paystack",
      error: error?.message ?? "unknown",
    });
    // Return 200 to prevent Paystack from retrying
    return NextResponse.json({ received: true });
  }
});
