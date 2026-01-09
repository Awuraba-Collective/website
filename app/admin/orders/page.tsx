import { prisma } from "@/lib/database";
import { OrdersTable } from "@/app/admin/_components/OrdersTable";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });

  return <OrdersTable orders={orders} />;
}
