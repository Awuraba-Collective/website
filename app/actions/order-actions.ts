"use server";

import { prisma } from "@/lib/database";
import { requireAdmin } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/order";
import { OrderStatus, PaymentStatus, Prisma } from "@/app/generated/prisma";
import type { CartItem } from "@/types/shop";

interface CustomerInfo {
  firstName: string;
  lastName: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  region?: string;
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
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  try {
    const { customer, items } = input;

    if (!items || items.length === 0) {
      return { success: false, error: "No items in cart" };
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
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

    // Customer Intelligence: Find or create customer by WhatsApp number
    const whatsappClean = (customer.whatsapp || customer.phone || "").replace(
      /[\s\-\+\(\)]/g,
      "",
    );

    const dbCustomer = await prisma.customer.upsert({
      where: { whatsappNumber: whatsappClean },
      update: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone || undefined,
        lastAddress: customer.address || undefined,
        lastCity: customer.city || undefined,
        // @ts-ignore - region might not be in the interface yet but added to schema
        lastRegion: customer.region || undefined,
        orderCount: { increment: 1 },
        totalSpent: { increment: new Prisma.Decimal(total) },
      },
      create: {
        whatsappNumber: whatsappClean,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone || undefined,
        lastAddress: customer.address || undefined,
        lastCity: customer.city || undefined,
        // @ts-ignore
        lastRegion: customer.region || undefined,
        orderCount: 1,
        totalSpent: new Prisma.Decimal(total),
      },
    });

    // Create order with items, payment, and initial event
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: OrderStatus.PENDING,
        customerId: dbCustomer.id,

        // Pricing
        subtotal: new Prisma.Decimal(subtotal),
        shippingCost: new Prisma.Decimal(shippingCost),
        discount: new Prisma.Decimal(discount),
        total: new Prisma.Decimal(total),
        currency: "GHS",

        // Shipping address
        shippingName: `${customer.firstName} ${customer.lastName}`,
        shippingAddress: customer.address || "To be confirmed",
        shippingCity: customer.city || "To be confirmed",
        // @ts-ignore
        shippingRegion: customer.region || "To be confirmed",
        shippingCountry: "Ghana",
        shippingPhone: customer.phone || customer.whatsapp || "",

        // Order items
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.selectedVariant.id,
            productName: item.name,
            variantName: item.selectedVariant.name,
            unitPrice: new Prisma.Decimal(item.price),
            quantity: item.quantity,
            totalPrice: new Prisma.Decimal(item.price * item.quantity),
            selectedSize: item.selectedSize,
            selectedLength: item.selectedLength,
            fitCategory: item.fitCategory,
            note: item.note,
          })),
        },

        // Initial payment record (placeholder for Paystack)
        payments: {
          create: {
            amount: new Prisma.Decimal(total),
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

// Admin only
export async function getOrders() {
  await requireAdmin();

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

// Admin only
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
) {
  await requireAdmin();

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        timeline: {
          create: {
            status,
            note: note || `Order status updated to ${status}`,
          },
        },
      },
    });

    return { success: true, order };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}
