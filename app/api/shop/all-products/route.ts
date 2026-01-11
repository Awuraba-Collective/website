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

    // Helper to serialize Prisma objects (Decimals to Numbers, etc.)
    // const serialize = (obj: any): any => {
    //   if (obj === null || obj === undefined) return obj;
    //   if (typeof obj.toNumber === "function") return obj.toNumber();
    //   if (obj instanceof Date) return obj.toISOString();
    //   if (Array.isArray(obj)) return obj.map(serialize);
    //   if (typeof obj === "object") {
    //     const newObj: any = {};
    //     for (const key in obj) {
    //       if (key === "costPrice") continue;
    //       newObj[key] = serialize(obj[key]);
    //     }
    //     return newObj;
    //   }
    //   return obj;
    // };

    const serializedItems = serializePrisma(products);

    return NextResponse.json(serializedItems);
  } catch (error) {
    console.error("Failed to fetch shop products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
