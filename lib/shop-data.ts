import { Product } from "@/types/shop";

// TODO: Replace with real images later. Using placeholders for development.

export const products: Product[] = [
  {
    id: "1",
    slug: "elegant-maxi-dress",
    name: "The Awuraba Maxi",
    price: 450,
    description:
      "Our signature silhouette designed for effortless elegance. Features a flowing drape that flatters every curve. Perfect for both casual outings and formal events.",
    images: [
      {
        src: "/images/placeholder-dress-1.jpg",
        alt: "The Awuraba Maxi Dress in Emerald Green - Elegant African Fashion",
      },
      {
        src: "/images/placeholder-dress-2.jpg",
        alt: "Back view of The Awuraba Maxi Dress - Emerald Green",
      },
    ],
    variants: [
      {
        name: "Emerald Green",
        isAvailable: true,
        id: "1",
        productId: "1",
        sku: null,
      },
      {
        name: "Midnight Black",
        isAvailable: true,
        id: "2",
        productId: "1",
        sku: null,
      },
      {
        name: "Royal Blue",
        isAvailable: false,
        id: "3",
        productId: "1",
        sku: null,
      },
    ],
    fitCategory: "Standard",
    modelInfo: {
      height: "5'9\"",
      wearingSize: "M",
      wearingVariant: "Emerald Green",
    },
    discountPrice: 380,
    discountPriceUSD: 25.33,
    priceUSD: 30,
    discountEndsAt: "2026-01-20T23:59:59Z",
    category: "Dresses",
    collection: "January 25th Drop",
    isNewDrop: true,
  },
  {
    id: "2",
    slug: "classic-silk-set",
    name: "Silk Lounge Set",
    price: 600,
    description:
      "Luxurious comfort meets modern style. This two-piece set is crafted from premium silk-blend fabric, ensuring you look polished even while relaxing.",
    images: [
      {
        src: "/images/placeholder-set-1.jpg",
        alt: "Silk Lounge Set in Champagne - Handcrafted African Ready-to-wear",
      },
    ],
    variants: [
      {
        name: "Champagne",
        isAvailable: true,
        id: "1",
        productId: "2",
        sku: null,
      },
      {
        name: "Rose Gold",
        isAvailable: true,
        id: "2",
        productId: "2",
        sku: null,
      },
    ],
    fitCategory: "Loose",
    modelInfo: {
      height: "5'7\"",
      wearingSize: "S",
      wearingVariant: "Champagne",
    },
    priceUSD: 40,
    category: "Sets",
    collection: "Essentials",
    isNewDrop: false,
  },
  {
    id: "3",
    slug: "statement-wrap-top",
    name: "Statement Wrap Top",
    price: 250,
    description:
      "A versatile top with adjustable wrap ties, allowing for multiple styling options. The structured sleeves add a touch of drama to any outfit.",
    images: [
      {
        src: "/images/placeholder-top-1.jpg",
        alt: "AWURABA Statement Wrap Top in White - Versatile African Style",
      },
    ],
    variants: [
      { name: "White", isAvailable: true, id: "1", productId: "3", sku: null },
      {
        name: "Burnt Orange",
        isAvailable: true,
        id: "2",
        productId: "3",
        sku: null,
      },
    ],
    fitCategory: "Standard",
    priceUSD: 16.67,
    category: "Tops",
    collection: "January 25th Drop",
    isNewDrop: true,
  },
  {
    id: "4",
    slug: "flow-midi-skirt",
    name: "Flow Midi Skirt",
    price: 350,
    description:
      "A high-waisted midi skirt with a soft A-line flare. Moves beautifully with every step you take.",
    images: [
      {
        src: "/images/placeholder-skirt-1.jpg",
        alt: "Flow Midi Skirt in Navy - Elegant Ready-to-wear from Ghana",
      },
    ],
    variants: [
      {
        name: "Navy",
        isAvailable: true,
        id: "1",
        productId: "4",
        sku: null,
      },
      {
        name: "Mustard",
        isAvailable: false,
        id: "2",
        productId: "4",
        sku: null,
      },
    ],
    fitCategory: "Standard",
    priceUSD: 23.33,
    category: "Bottoms",
    collection: "Essentials",
    isNewDrop: false,
  },
];
