"use server";

import { prisma } from "@/lib/database";
import {
  generateOrderNumber,
  mapSizeToEnum,
  mapLengthToEnum,
  mapFitToEnum,
} from "@/lib/order";
import { OrderStatus, PaymentStatus } from "@/app/generated/prisma/client";
import type { CartItem } from "@/types/shop";
import { Decimal } from "../generated/prisma/internal/prismaNamespace";

interface CustomerInfo {
  firstName: string;
  lastName: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
}

interface CreateOrderInput {
  customer: CustomerInfo;
  items: CartItem[];
}

interface CreateOrderResult {
  success: boolean;
  orderNumber?: string;
  orderId?: string;
  error?: string;
}

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  try {
    const { customer, items } = input;

    if (!items || items.length === 0) {
      return { success: false, error: "No items in cart" };
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = 0; // Pay on delivery
    const discount = 0;
    const total = subtotal + shippingCost - discount;

    // Generate unique order number
    let orderNumber = generateOrderNumber();

    // Ensure uniqueness (retry if collision)
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.order.findUnique({
        where: { orderNumber },
      });
      if (!existing) break;
      orderNumber = generateOrderNumber();
      attempts++;
    }

    // Create order with items, payment, and initial event
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: OrderStatus.PENDING,

        // Guest checkout info
        guestEmail: undefined,
        guestPhone: customer.phone || customer.whatsapp,

        // Pricing
        subtotal: new Decimal(subtotal),
        shippingCost: new Decimal(shippingCost),
        discount: new Decimal(discount),
        total: new Decimal(total),
        currency: "GHS",

        // Shipping address
        shippingName: `${customer.firstName} ${customer.lastName}`,
        shippingAddress: customer.address || "To be confirmed",
        shippingCity: customer.city || "To be confirmed",
        shippingCountry: "Ghana",
        shippingPhone: customer.phone || customer.whatsapp || "",

        // Order items
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.productId, // Will need proper variantId mapping when products are in DB
            productName: item.name,
            variantName: item.selectedVariant,
            unitPrice: new Decimal(item.price),
            quantity: item.quantity,
            totalPrice: new Decimal(item.price * item.quantity),
            selectedSize: mapSizeToEnum(item.selectedSize),
            selectedLength: mapLengthToEnum(item.selectedLength),
            fitCategory: mapFitToEnum(item.fitCategory),
            customBust: item.customMeasurements?.bust,
            customWaist: item.customMeasurements?.waist,
            customHips: item.customMeasurements?.hips,
            customHeight: item.customMeasurements?.height,
            customNotes: item.customMeasurements?.additionalNotes,
            note: item.note,
          })),
        },

        // Initial payment record (placeholder for Paystack)
        payments: {
          create: {
            amount: new Decimal(total),
            currency: "GHS",
            status: PaymentStatus.PENDING,
            provider: "paystack", // Placeholder
          },
        },

        // Initial timeline event
        timeline: {
          create: {
            status: OrderStatus.PENDING,
            note: "Order placed via website",
          },
        },
      },
      include: {
        items: true,
        payments: true,
      },
    });

    return {
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
    };
  } catch (error) {
    console.error("Failed to create order:", error);
    return {
      success: false,
      error: "Failed to create order. Please try again.",
    };
  }
}

export async function getOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });
  return orders;
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: true,
      timeline: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return order;
}
