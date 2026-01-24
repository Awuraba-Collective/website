import type { Metadata, ResolvingMetadata } from "next";
import type { PageProps, SerializableProduct } from "@/types";
import { prisma } from "@/lib/database";
import ShopClient from "./_components/ShopClient";

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
  const searchQuery = (resolvedSearchParams.search as string) || "";

  // Fetch unique categories for filters
  const categories = await prisma.category.findMany({
    where: { products: { some: { isActive: true } } },
    select: { name: true },
    orderBy: { name: "asc" },
  });

  const categoryNames = categories.map((c) => c.name);
  const allFilters = ["All", "New Drop", ...categoryNames];

  // Base where clause
  const where: any = {
    isActive: true,
  };

  // Apply search query
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  // Apply category/drop filters
  if (activeFilter === "New Drop") {
    where.isNewDrop = true;
  } else if (activeFilter !== "All") {
    where.OR = [
      { category: { name: activeFilter } },
      { collection: { name: activeFilter } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      media: { orderBy: { position: "asc" } },
      variants: true,
      category: true,
      collection: true,
      discount: true,
      prices: true,
      fitCategory: {
        include: {
          sizes: true,
        },
      },
      relatedProducts: {
        include: {
          media: true,
          prices: true,
          discount: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const filteredProducts: SerializableProduct[] = products.map(
    ({ costPrice, ...product }) => ({
      ...product,
      discount: product.discount
        ? {
          ...product.discount,
          value: Number(product.discount.value),
        }
        : null,
      prices:
        product.prices?.map((p) => ({
          ...p,
          price: Number(p.price),
        })) || [],
      fitCategory: product.fitCategory
        ? {
          ...product.fitCategory,
          sizes: product.fitCategory.sizes.map((s) => ({
            ...s,
            measurements: s.measurements as any,
          })),
        }
        : null,
      relatedProducts:
        product.relatedProducts?.map((rp) => ({
          ...rp,
          prices:
            rp.prices?.map((p) => ({ ...p, price: Number(p.price) })) || [],
          discount: rp.discount
            ? { ...rp.discount, value: Number(rp.discount.value) }
            : null,
        })) || [],
    })
  ) as any; // Cast as any if still complex, but structure is now correct for the type

  return (
    <ShopClient
      products={filteredProducts}
      activeFilter={activeFilter}
      filters={allFilters}
    />
  );
}
