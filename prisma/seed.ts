import { prisma } from "../lib/database";
import { FitCategory } from "../app/generated/prisma/client";
import { Decimal } from "@/app/generated/prisma/internal/prismaNamespace";

// Seed data based on lib/shop-data.ts
const categories = [
  {
    name: "Dresses",
    slug: "dresses",
    description: "Elegant dresses for every occasion",
  },
  { name: "Sets", slug: "sets", description: "Coordinated two-piece sets" },
  { name: "Tops", slug: "tops", description: "Stylish tops and blouses" },
  { name: "Bottoms", slug: "bottoms", description: "Skirts and trousers" },
];

const collections = [
  {
    name: "January 25th Drop",
    slug: "january-25th-drop",
    description: "Our latest collection for 2026",
    isActive: true,
  },
  {
    name: "Essentials",
    slug: "essentials",
    description: "Timeless pieces for your wardrobe",
    isActive: true,
  },
];

const products = [
  {
    name: "The Awuraba Maxi",
    slug: "elegant-maxi-dress",
    description:
      "Our signature silhouette designed for effortless elegance. Features a flowing drape that flatters every curve. Perfect for both casual outings and formal events.",
    price: new Decimal(450),
    discountPrice: new Decimal(380),
    discountEndsAt: new Date("2026-01-20T23:59:59Z"),
    fitCategory: FitCategory.STANDARD,
    isNewDrop: true,
    isActive: true,
    categorySlug: "dresses",
    collectionSlug: "january-25th-drop",
    images: [
      {
        src: "/images/placeholder-dress-1.jpg",
        alt: "The Awuraba Maxi Dress in Emerald Green - Elegant African Fashion",
        position: 0,
        modelHeight: "5'9\"",
        modelWearingSize: "M",
        modelWearingVariant: "Emerald Green",
      },
      {
        src: "/images/placeholder-dress-2.jpg",
        alt: "Back view of The Awuraba Maxi Dress - Emerald Green",
        position: 1,
      },
    ],
    variants: [
      { name: "Emerald Green", isAvailable: true },
      { name: "Midnight Black", isAvailable: true },
      { name: "Royal Blue", isAvailable: false },
    ],
  },
  {
    name: "Silk Lounge Set",
    slug: "classic-silk-set",
    description:
      "Luxurious comfort meets modern style. This two-piece set is crafted from premium silk-blend fabric, ensuring you look polished even while relaxing.",
    price: new Decimal(600),
    fitCategory: FitCategory.LOOSE,
    isNewDrop: false,
    isActive: true,
    categorySlug: "sets",
    collectionSlug: "essentials",
    images: [
      {
        src: "/images/placeholder-set-1.jpg",
        alt: "Silk Lounge Set in Champagne - Handcrafted African Ready-to-wear",
        position: 0,
        modelHeight: "5'7\"",
        modelWearingSize: "S",
        modelWearingVariant: "Champagne",
      },
    ],
    variants: [
      { name: "Champagne", isAvailable: true },
      { name: "Rose Gold", isAvailable: true },
    ],
  },
  {
    name: "Statement Wrap Top",
    slug: "statement-wrap-top",
    description:
      "A versatile top with adjustable wrap ties, allowing for multiple styling options. The structured sleeves add a touch of drama to any outfit.",
    price: new Decimal(250),
    fitCategory: FitCategory.STANDARD,
    isNewDrop: true,
    isActive: true,
    categorySlug: "tops",
    collectionSlug: "january-25th-drop",
    images: [
      {
        src: "/images/placeholder-top-1.jpg",
        alt: "AWURABA Statement Wrap Top in White - Versatile African Style",
        position: 0,
      },
    ],
    variants: [
      { name: "White", isAvailable: true },
      { name: "Burnt Orange", isAvailable: true },
    ],
  },
  {
    name: "Flow Midi Skirt",
    slug: "flow-midi-skirt",
    description:
      "A high-waisted midi skirt with a soft A-line flare. Moves beautifully with every step you take.",
    price: new Decimal(350),
    fitCategory: FitCategory.STANDARD,
    isNewDrop: false,
    isActive: true,
    categorySlug: "bottoms",
    collectionSlug: "essentials",
    images: [
      {
        src: "/images/placeholder-skirt-1.jpg",
        alt: "Flow Midi Skirt in Navy - Elegant Ready-to-wear from Ghana",
        position: 0,
      },
    ],
    variants: [
      { name: "Navy", isAvailable: true },
      { name: "Mustard", isAvailable: false },
    ],
  },
];

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data (in reverse order of dependencies)
  console.log("Cleaning existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.orderEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  console.log("Creating categories...");
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.create({
      data: cat,
    });
    categoryMap[cat.slug] = created.id;
  }

  // Create collections
  console.log("Creating collections...");
  const collectionMap: Record<string, string> = {};
  for (const col of collections) {
    const created = await prisma.collection.create({
      data: col,
    });
    collectionMap[col.slug] = created.id;
  }

  // Create products with images and variants
  console.log("Creating products...");
  for (const product of products) {
    const { categorySlug, collectionSlug, images, variants, ...productData } =
      product;

    await prisma.product.create({
      data: {
        ...productData,
        categoryId: categoryMap[categorySlug],
        collectionId: collectionSlug ? collectionMap[collectionSlug] : null,
        images: {
          create: images.map((img) => ({
            src: img.src,
            alt: img.alt,
            position: img.position,
            modelHeight: null,
            modelWearingSize: null,
            modelWearingVariant: null,
          })),
        },
        variants: {
          create: variants.map((v) => ({
            name: v.name,
            isAvailable: v.isAvailable,
          })),
        },
      },
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${collections.length} collections`);
  console.log(`   - ${products.length} products`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
