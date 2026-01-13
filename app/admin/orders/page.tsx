import { prisma } from "@/lib/database";
import { OrdersTable } from "./_components/OrdersTable";
import { serializePrisma } from "@/lib/serializers/serializePrisma";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
      timeline: {
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { items: true },
      },
    },
  });

  // Serialize Decimal objects to strings before passing to Client Component
  // const serializedOrders = orders.map(order => ({
  //   ...order,
  //   subtotal: order.subtotal.toString(),
  //   total: order.total.toString(),
  //   shippingCost: order.shippingCost.toString(),
  //   discount: order.discount.toString(),
  //   items: order.items.map(item => ({
  //     ...item,
  //     product: {
  //       ...item.product,
  //       costPrice: item.product.costPrice?.toString() || "0"
  //     }
  //   }))
  // }));

  const serializedOrders = serializePrisma(orders);

  return <OrdersTable orders={serializedOrders as any} />;
}
