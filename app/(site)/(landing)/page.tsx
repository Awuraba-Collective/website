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
  const [heroSourceProducts, bestSellersSource, collectionsSource, newArrivalsSource] = await Promise.all([
    // 1. Fetch Hero Products
    prisma.product.findMany({
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
    }),
    // 2. Fetch Best Sellers
    prisma.product.findMany({
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
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    // 3. Fetch Active Collections
    prisma.collection.findMany({
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
    }),
    // 4. Fetch New Arrivals
    prisma.product.findMany({
      where: {
        isActive: true,
        isNewDrop: true,
        OR: [
          { newDropExpiresAt: null },
          { newDropExpiresAt: { gt: new Date() } }
        ]
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
      orderBy: { createdAt: "desc" },
      take: 8,
    })
  ]);

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

  const bestSellers = bestSellersSource.map(serializePrisma) as SerializableProduct[];
  const collections = collectionsSource.map(serializePrisma);
  const newArrivals = newArrivalsSource.map(serializePrisma) as SerializableProduct[];

  return (
    <HomeClient
      heroProducts={heroProducts}
      bestSellers={bestSellers}
      newArrivals={newArrivals}
      collections={collections.map(serializePrisma)}
    />
  );
}
