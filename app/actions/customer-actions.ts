"use server";

import { prisma } from "@/lib/database";

export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { totalSpent: "desc" },
      include: {
        orders: {
          select: {
            total: true,
            status: true,
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    // Serialize Decimal to strings and calculate confirmed/pending spend
    return customers.map((customer) => {
      const confirmedStatuses = ['CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'SHIPPED', 'DELIVERED'];

      let confirmedSpend = 0;
      let pendingSpend = 0;

      customer.orders.forEach(order => {
        const total = parseFloat(order.total.toString());
        if (confirmedStatuses.includes(order.status)) {
          confirmedSpend += total;
        } else if (order.status === 'PENDING') {
          pendingSpend += total;
        }
      });

      return {
        ...customer,
        totalSpent: customer.totalSpent.toString(),
        confirmedSpend: confirmedSpend.toString(),
        pendingSpend: pendingSpend.toString(),
        orders: customer.orders.map(order => ({
          ...order,
          total: order.total.toString()
        }))
      };
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return [];
  }
}

export async function getCustomerById(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            items: true,
          },
        },
      },
    });

    if (!customer) return null;

    const confirmedStatuses = ['CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'SHIPPED', 'DELIVERED'];
    let confirmedSpend = 0;
    let pendingSpend = 0;

    customer.orders.forEach(order => {
      const total = parseFloat(order.total.toString());
      if (confirmedStatuses.includes(order.status)) {
        confirmedSpend += total;
      } else if (order.status === 'PENDING') {
        pendingSpend += total;
      }
    });

    return {
      ...customer,
      totalSpent: customer.totalSpent.toString(),
      confirmedSpend: confirmedSpend.toString(),
      pendingSpend: pendingSpend.toString(),
      orders: customer.orders.map((order) => ({
        ...order,
        subtotal: order.subtotal.toString(),
        shippingCost: order.shippingCost.toString(),
        discount: order.discount.toString(),
        total: order.total.toString(),
        items: order.items.map((item) => ({
          ...item,
          unitPrice: item.unitPrice.toString(),
          totalPrice: item.totalPrice.toString(),
        })),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch customer by ID:", error);
    return null;
  }
}

export async function createCustomer(data: {
  firstName: string;
  lastName: string;
  whatsapp: string;
  address?: string;
  city?: string;
  region?: string;
}) {
  try {
    const whatsappClean = data.whatsapp.replace(/[\s\-\+\(\)]/g, "");

    const existing = await prisma.customer.findUnique({
      where: { whatsappNumber: whatsappClean },
    });

    if (existing) {
      return { success: false, error: "A customer with this WhatsApp number already exists." };
    }

    const customer = await prisma.customer.create({
      data: {
        firstName: data.firstName || "Guest",
        lastName: data.lastName || "",
        whatsappNumber: whatsappClean,
        lastAddress: data.address || undefined,
        lastCity: data.city || undefined,
        // @ts-ignore
        lastRegion: data.region || undefined,
        orderCount: 0,
      },
    });

    return { success: true, customer: { ...customer, totalSpent: customer.totalSpent.toString() } };
  } catch (error) {
    console.error("Failed to create customer:", error);
    return { success: false, error: "Failed to create customer. Please try again." };
  }
}
