import { Product } from "@/types/shop";

// TODO: Replace with real images later. Using placeholders for development.

export const products: Product[] = [
    {
        id: "1",
        slug: "elegant-maxi-dress",
        name: "The Awuraba Maxi",
        price: 450,
        description: "Our signature silhouette designed for effortless elegance. Features a flowing drape that flatters every curve. Perfect for both casual outings and formal events.",
        images: [
            { src: "/images/placeholder-dress-1.jpg", alt: "Awuraba Maxi Front" },
            { src: "/images/placeholder-dress-2.jpg", alt: "Awuraba Maxi Back" },
        ],
        colors: ["Emerald Green", "Midnight Black", "Royal Blue"],
        category: "Dresses",
        collection: "January 25th Drop",
        isNewDrop: true,
    },
    {
        id: "2",
        slug: "classic-silk-set",
        name: "Silk Lounge Set",
        price: 600,
        description: "Luxurious comfort meets modern style. This two-piece set is crafted from premium silk-blend fabric, ensuring you look polished even while relaxing.",
        images: [
            { src: "/images/placeholder-set-1.jpg", alt: "Silk Set Front" },
        ],
        colors: ["Champagne", "Rose Gold"],
        category: "Sets",
        collection: "Essentials",
        isNewDrop: false,
    },
    {
        id: "3",
        slug: "statement-wrap-top",
        name: "Statement Wrap Top",
        price: 250,
        description: "A versatile top with adjustable wrap ties, allowing for multiple styling options. The structured sleeves add a touch of drama to any outfit.",
        images: [
            { src: "/images/placeholder-top-1.jpg", alt: "Wrap Top Front" },
        ],
        colors: ["White", "Burnt Orange"],
        category: "Tops",
        collection: "January 25th Drop",
        isNewDrop: true,
    },
    {
        id: "4",
        slug: "flow-midi-skirt",
        name: "Flow Midi Skirt",
        price: 350,
        description: "A high-waisted midi skirt with a soft A-line flare. Moves beautifully with every step you take.",
        images: [
            { src: "/images/placeholder-skirt-1.jpg", alt: "Midi Skirt" },
        ],
        colors: ["Navy", "Mustard"],
        category: "Bottoms",
        collection: "Essentials",
        isNewDrop: false,
    },
];
