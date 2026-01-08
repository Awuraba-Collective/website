import { prisma } from "@/lib/database";
import { OrdersTable } from "@/components/admin/OrdersTable";

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
