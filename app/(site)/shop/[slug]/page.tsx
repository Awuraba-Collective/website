import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductDetailClient } from "../_components/ProductDetailClient";
import { prisma } from "@/lib/database";
import { ProductWithRelations } from "@/types";
import { serializePrisma } from "@/lib/serializers/serializePrisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      media: { orderBy: { position: "asc" } },
    },
  });

  if (!product) return {};

  const poster =
    product.media.find((m) => m.type === "IMAGE") || product.media[0];

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | AWURABA`,
      description: product.description,
      images: poster ? [{ url: poster.src }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: poster ? [poster.src] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, measurementTypes, lengthStandards, standardFitCategory] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
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
        relatedProducts: {
          include: {
            media: { orderBy: { position: "asc" } },
            category: true,
            prices: true,
            discount: true,
            variants: true,
          },
        },
      },
    }),
    prisma.measurementType.findMany({ orderBy: { order: "asc" } }),
    prisma.lengthStandard.findMany({ orderBy: { order: "asc" } }),
    prisma.fitCategory.findFirst({
      where: { slug: "standard" },
      include: {
        sizes: { orderBy: { order: "asc" } },
      },
    }),
  ]);

  if (!product) {
    notFound();
  }

  // Fetch fallback recommendations if needed (concurrently to reduce sequential roundtrips)
  let fallbackRecommendations: any[] = [];
  if (product.relatedProducts.length === 0) {
    const [categoryFallback, collectionFallback, latestFallback] = await Promise.all([
      // 1. Try Category
      prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          isActive: true,
        },
        take: 4,
        include: {
          media: { orderBy: { position: "asc" } },
          category: true,
          prices: true,
          discount: true,
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      // 2. Try Collection (if available)
      product.collectionId ? prisma.product.findMany({
        where: {
          collectionId: product.collectionId,
          id: { not: product.id },
          isActive: true,
        },
        take: 4,
        include: {
          media: { orderBy: { position: "asc" } },
          category: true,
          prices: true,
          discount: true,
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      }) : Promise.resolve([]),
      // 3. Try Latest
      prisma.product.findMany({
        where: {
          id: { not: product.id },
          isActive: true,
        },
        take: 4,
        include: {
          media: { orderBy: { position: "asc" } },
          category: true,
          prices: true,
          discount: true,
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      })
    ]);

    fallbackRecommendations = categoryFallback.length > 0 
      ? categoryFallback 
      : collectionFallback.length > 0 
      ? collectionFallback 
      : latestFallback;
  }

  const prod = product as ProductWithRelations;

  const serializableProduct = serializePrisma(prod);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: prod.name,
    image: prod.media.map((m: any) => m.src),
    description: prod.description,
    sku: prod.variants[0]?.sku || prod.slug,
    offers: {
      "@type": "Offer",
      price: serializableProduct.prices.find(
        (p: any) => p.currencyCode === "GHS"
      )?.price,
      priceCurrency: "GHS",
      availability: prod.variants.some((v: any) => v.isAvailable)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="product-detail-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={serializableProduct}
        recommendations={serializePrisma(fallbackRecommendations)}
        measurementTypes={measurementTypes as any}
        lengthStandards={lengthStandards as any}
        standardFitCategory={standardFitCategory as any}
      />
    </div>
  );
}
