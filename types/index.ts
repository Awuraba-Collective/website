import type { Prisma } from "@/app/generated/prisma/client";

export type PageProps<P> = {
  params: Promise<P>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Product with all relations for shop display
export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    variants: true;
    category: true;
    collection: true;
  };
}>;

// Cart item type (client-side, for Redux store)
export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "Custom";
export type Length = "Petite" | "Regular" | "Tall";
export type FitCategory = "Standard" | "Loose";

export interface CustomMeasurements {
  bust?: string;
  waist?: string;
  hips?: string;
  height?: string;
  additionalNotes?: string;
}

export interface CartItem {
  id: string; // unique cart item id (product.id + selected options)
  productId: string;
  name: string;
  price: number;
  image: string;
  selectedSize: Size;
  selectedLength: Length;
  selectedVariant: string;
  fitCategory: FitCategory;
  customMeasurements?: CustomMeasurements;
  note?: string;
  quantity: number;
}
