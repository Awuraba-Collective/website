import ShopClient from "@/components/shop/ShopClient";
import type { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";
import type { PageProps } from "@/types";
import { prisma } from "@/lib/database";

type Props = PageProps<Record<string, never>>;

const FILTERS = [
  "All",
  "New Drop",
  "Dresses",
  "Sets",
  "Tops",
  "Bottoms",
] as const;

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category as string | undefined;

  const previousImages = (await parent).openGraph?.images || [];

  const baseTitle = "Shop All";
  const title = category ? `${category} | Shop` : baseTitle;
  const description = category
    ? `Explore our ${category.toLowerCase()} collection. Handcrafted African ready-to-wear pieces from AWURABA.`
    : "Explore the full collection of AWURABA. From statement dresses to versatile sets, find handcrafted African ready-to-wear pieces for every occasion.";

  return {
    title,
    description,
    keywords: [
      "Shop African dresses",
      "Handmade in Ghana",
      "African print clothing",
      "Ready-to-wear Ghana",
      "Modern African fashion",
    ],
    openGraph: {
      title: `${title} | AWURABA`,
      description,
      images: [...previousImages],
    },
  };
}

export default async function ShopPage({
  searchParams,
}: PageProps<Record<string, never>>) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = (resolvedSearchParams.category as string) || "All";

  // Fetch products with related data from database
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      category: true,
      collection: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter products on server
  const filteredProducts = products.filter((product) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "New Drop") return product.isNewDrop;
    return (
      product.category.name === activeFilter ||
      product.collection?.name === activeFilter
    );
  });

  return (
    <Suspense
      fallback={<div className="min-h-screen bg-white dark:bg-black" />}
    >
      <ShopClient
        products={filteredProducts}
        activeFilter={activeFilter}
        filters={[...FILTERS]}
      />
    </Suspense>
  );
}
