import type { Metadata } from "next";
import HomeClient from "./_components/HomeClient";
import { prisma } from "@/lib/database";
import { serializePrisma } from "@/lib/serializers/serializePrisma";
import type { SerializableProduct } from "@/types";

export const metadata: Metadata = {
  title: "AWURABA | Elegant African Fashion",
  description: "Curated elegant African ready-to-wear pieces for everyday life, special occasions, and everything in between.",
};

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  // 1. Fetch Hero Products (copying logic from shop/page.tsx for consistency)
  const heroSourceProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      discount: { isNot: null },
      variants: { some: { isAvailable: true } },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      isNewDrop: true,
      media: {
        orderBy: { position: "asc" },
        take: 1,
        select: { src: true, alt: true, type: true, position: true }
      },
      prices: true,
      discount: true,
      variants: true,
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

  // 2. Fetch Best Sellers (explicitly marked by admin)
  const bestSellersSource = await prisma.product.findMany({
    where: {
      isActive: true,
      isBestSeller: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      isNewDrop: true,
      isBestSeller: true,
      media: {
        orderBy: { position: "asc" },
        take: 2,
        select: { src: true, alt: true, type: true, position: true }
      },
      prices: true,
      discount: true,
      variants: true,
      category: { select: { name: true } },
      collection: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" }, // most recent best sellers first
    take: 8,
  });
  const bestSellers = bestSellersSource.map(serializePrisma) as SerializableProduct[];

  // 3. Fetch Active Collections (using coverImage if available)
  const collectionsSource = await prisma.collection.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      coverImage: true,
      coverVideo: true,
      coverType: true,
      _count: {
        select: { products: { where: { isActive: true } } }
      },
      products: {
        where: { isActive: true },
        take: 1,
        select: {
          media: {
            orderBy: { position: 'asc' },
            take: 1,
            select: { src: true, type: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const collections = collectionsSource.map(serializePrisma);

  return (
    <HomeClient
      heroProducts={heroProducts}
      bestSellers={bestSellers}
      collections={collections.map(serializePrisma)}
    />
  );
}
