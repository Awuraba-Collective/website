import { Length, Prisma, ProductVariant } from "@/app/generated/prisma";

export interface ModelInfo {
  height: string;
  wearingSize: string;
  wearingVariant: string;
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductMedia {
  src: string;
  type: "IMAGE" | "VIDEO";
  modelWearingVariant?: string | null;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  priceUSD?: number;
  description: string;
  images: ProductImage[];
  media?: ProductMedia[];
  variants: ProductVariant[];
  fitCategory: string;
  modelInfo?: ModelInfo;
  discountPrice?: number;
  discountPriceUSD?: number;
  costPriceGHS?: number;
  discountEndsAt?: string; // ISO date string
  category: string;
  collection?: string;
  isNewDrop?: boolean;
  frequentlyBoughtTogether?: string[]; // Array of product IDs
}

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
  price: number; // GHS price (base currency)
  priceUSD?: number; // Legacy USD price
  currency: string; // Currency code when added to cart
  currencyPrice: number; // Price in the selected currency when added
  prices: any[]; // Full pricing list from the product
  discount?: any; // Discount information from the product
  image: string;
  selectedSize: string;
  selectedLength: Length;
  selectedVariant: Omit<ProductVariant, "isAvailable" | "sku">;
  fitCategory: string;
  customMeasurements?: CustomMeasurements;
  note?: string;
  quantity: number;
}

// export type ProductWithRelations = Prisma.ProductGetPayload<{
//   include: {
//     media: true;
//     variants: true;
//     category: true;
//     collection: true;
//     discount: true;
//     prices: true;
//     fitCategory: {
//       include: {
//         sizes: true;
//       };
//     };
//     relatedProducts: {
//       include: {
//         media: true;
//         category: true;
//         prices: true;
//         discount: true;
//       };
//     };
//   };
// }>;

// export type SerializeDecimal<T> = T extends Prisma.Decimal
//   ? number
//   : T extends Array<infer U>
//   ? SerializeDecimal<U>[]
//   : T extends object
//   ? { [K in keyof T]: SerializeDecimal<T[K]> }
//   : T;

// export type SerializedProduct = SerializeDecimal<ProductWithRelations>;
