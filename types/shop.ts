export type Size = string;
export type LooseSize = string;
export type FitCategory = string;
export type Length = 'Petite' | 'Regular' | 'Tall';

export interface ProductVariant {
    name: string;
    isAvailable: boolean;
}

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
    type: 'IMAGE' | 'VIDEO';
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
    fitCategory: FitCategory;
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
    price: number;
    priceUSD?: number;
    image: string;
    selectedSize: Size;
    selectedLength: Length;
    selectedVariant: string;
    fitCategory: FitCategory;
    customMeasurements?: CustomMeasurements;
    note?: string;
    quantity: number;
}
