import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { verifyWebhookSignature } from "@/lib/paystack";
import { OrderStatus, PaymentStatus, Prisma } from "@/app/generated/prisma";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.error("Invalid Paystack webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: PaystackWebhookEvent = JSON.parse(body);
    console.log(`Paystack webhook received: ${event.event}`);

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
          console.error(`Payment not found for reference: ${reference}`);
          return NextResponse.json({ received: true });
        }

        // Skip if already completed
        if (payment.status === PaymentStatus.COMPLETED) {
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

        console.log(`Payment ${reference} marked as completed`);
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
        }
        break;
      }

      default:
        console.log(`Unhandled Paystack event: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Return 200 to prevent Paystack from retrying
    return NextResponse.json({ received: true });
  }
}
