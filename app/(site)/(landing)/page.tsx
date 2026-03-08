import type { Metadata } from "next";
import HomeClient from "./_components/HomeClient";
import { prisma } from "@/lib/database";
import { serializePrisma } from "@/lib/serializers/serializePrisma";
import type { SerializableProduct } from "@/types";

export const metadata: Metadata = {
  title: "AWURABA | Elegant African Fashion",
  description: "Curated elegant African ready-to-wear pieces for everyday life, special occasions, and everything in between.",
};

export default async function Home() {
  // 1. Fetch Hero Products (copying logic from shop/page.tsx for consistency)
  const heroSourceProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [{ isNewDrop: true }, { discount: { isNot: null } }],
    },
    include: {
      media: { orderBy: { position: "asc" } },
      prices: true,
      discount: true,
    },
  });

  const heroProducts = heroSourceProducts
    .sort((a, b) => {
      const aOnSale = !!a.discount;
      const bOnSale = !!b.discount;
      if (aOnSale && !bOnSale) return -1;
      if (!aOnSale && bOnSale) return 1;
      const priceA = Number(a.prices.find((p) => p.currencyCode === "GHS")?.price || 0);
      const priceB = Number(b.prices.find((p) => p.currencyCode === "GHS")?.price || 0);
      return priceB - priceA;
    })
    .slice(0, 5)
    .map(serializePrisma) as SerializableProduct[];

  // 2. Fetch Best Sellers (Top 8 of currently active products)
  const bestSellersSource = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      media: { orderBy: { position: "asc" } },
      prices: true,
      discount: true,
      category: true,
      collection: true,
    },
    orderBy: { createdAt: "desc" }, // fallback: most recent
    take: 8,
  });
  const bestSellers = bestSellersSource.map(serializePrisma) as SerializableProduct[];

  // 3. Fetch Active Collections
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <HomeClient
      heroProducts={heroProducts}
      bestSellers={bestSellers}
      collections={collections.map(serializePrisma)}
    />
  );
}
