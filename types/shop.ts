export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Custom';
export type Length = 'Petite' | 'Regular' | 'Tall';

export interface ProductImage {
    src: string;
    alt: string;
}

export interface Product {
    id: string;
    slug: string;
    name: string;
    price: number;
    description: string;
    images: ProductImage[];
    colors: string[]; // e.g. ["#000000", "#FF0000"] or Names "Black", "Red"
    category: string;
    collection?: string; // e.g., "Monthly Drop", "Classics"
    isNewDrop?: boolean;
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
    image: string;
    selectedSize: Size;
    selectedLength: Length;
    selectedColor: string;
    customMeasurements?: CustomMeasurements;
    note?: string; // User note per item
    quantity: number;
}
