"use server";

import { prisma } from "@/lib/database";

export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { totalSpent: "desc" },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    // Serialize Decimal to strings for Client Components
    return customers.map((customer) => ({
      ...customer,
      totalSpent: customer.totalSpent.toString(),
    }));
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

    return {
      ...customer,
      totalSpent: customer.totalSpent.toString(),
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
