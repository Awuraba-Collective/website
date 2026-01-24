import type { Prisma } from "@/app/generated/prisma";

// Helper to convert Prisma types to serializable client-safe types
export type Serialize<T> = T extends { toNumber(): number }
  ? number
  : T extends Date
  ? Date
  : T extends Array<infer U>
  ? Array<Serialize<U>>
  : T extends object
  ? { [K in keyof T]: Serialize<T[K]> }
  : T;

export type PageProps<P> = {
  params: Promise<P>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Product with all relations for shop display
export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    media: true;
    variants: true;
    category: true;
    collection: true;
    discount: true;
    prices: true;
    fitCategory: {
      include: {
        sizes: true;
      };
    };
    relatedProducts: {
      include: {
        media: true;
        prices: true;
        discount: true;
      };
    };
  };
}>;

export type SerializableProduct = Omit<
  Serialize<ProductWithRelations>,
  "costPrice"
>;

// Cart item type (client-side, for Redux store)
export type Size = string;
export type Length = "PETITE" | "REGULAR" | "TALL";
export type FitCategory = string;

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
  prices: any[]; // Full pricing list from the product
  discount?: any; // Discount information from the product
  image: string;
  selectedSize: Size;
  selectedLength: Length;
  selectedVariant: string;
  fitCategory: FitCategory;
  customMeasurements?: CustomMeasurements;
  note?: string;
  quantity: number;
}

export type SerializableMeasurementType = Serialize<
  Prisma.MeasurementTypeGetPayload<{}>
>;
export type SerializableLengthStandard = Serialize<
  Prisma.LengthStandardGetPayload<{}>
>;
export type SerializableFitSize = Serialize<Prisma.FitSizeGetPayload<{}>>;
