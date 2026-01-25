import { prisma } from "@/lib/database";
import { serializePrisma } from "@/lib/serializers/serializePrisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        media: { orderBy: { position: "asc" } },
        variants: { orderBy: { id: "asc" } },
        category: true,
        collection: true,
        discount: true,
        prices: true,
        fitCategory: {
          include: {
            sizes: { orderBy: { order: "asc" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const serializedItems = serializePrisma(products);

    return NextResponse.json(serializedItems);
  } catch (error) {
    console.error("Failed to fetch shop products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
