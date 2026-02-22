import { prisma } from "@/lib/database";
import { OrdersTable } from "./_components/OrdersTable";
import { serializePrisma } from "@/lib/serializers/serializePrisma";

export const dynamic = 'force-dynamic';

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

  const serializedOrders = serializePrisma(orders);

  return <OrdersTable orders={serializedOrders as any} />;
}
