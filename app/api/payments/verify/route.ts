import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { verifyPayment } from "@/lib/paystack";
import { OrderStatus, PaymentStatus, Prisma } from "@/app/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const verification = await verifyPayment(reference);

    if (!verification.status) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    const { data } = verification;

    // Find the payment record by reference
    const payment = await prisma.payment.findFirst({
      where: { providerRef: reference },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // Check if already processed
    if (payment.status === PaymentStatus.COMPLETED) {
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

      return NextResponse.json({
        success: false,
        status: "failed",
        orderNumber: payment.order.orderNumber,
        message: data.gateway_response,
      });
    } else {
      // pending or abandoned
      return NextResponse.json({
        success: false,
        status: data.status,
        orderNumber: payment.order.orderNumber,
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
