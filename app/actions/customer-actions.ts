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
