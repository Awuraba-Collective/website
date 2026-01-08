import { prisma } from "../lib/database";
import { FitCategoryType, DiscountType } from "../app/generated/prisma/client";
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

const fitCategories = [
  { name: "Standard Fit", slug: "standard", description: "Regular fit true to size." },
  { name: "Loose Fit", slug: "loose", description: "Relaxed, comfortable fit." },
];

const currencies = [
  { code: "GHS", symbol: "₵", rate: 1.0, isBase: true },
  { code: "USD", symbol: "$", rate: 0.065, isBase: false }, // ~15.38 GHS/USD
  { code: "EUR", symbol: "€", rate: 0.060, isBase: false },
  { code: "GBP", symbol: "£", rate: 0.050, isBase: false },
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
    isNewDrop: true,
    isActive: true,
    categorySlug: "dresses",
    collectionSlug: "january-25th-drop",
    fitCategorySlug: "standard",
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
    isNewDrop: false,
    isActive: true,
    categorySlug: "sets",
    collectionSlug: "essentials",
    fitCategorySlug: "loose",
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
    isNewDrop: true,
    isActive: true,
    categorySlug: "tops",
    collectionSlug: "january-25th-drop",
    fitCategorySlug: "standard",
    images: [
      {
        src: "/images/placeholder-top-1.jpg",
        alt: "AWURABA Statement Wrap Top in White - Versatile African Style",
        position: 0,
        modelHeight: null,
        modelWearingSize: null,
        modelWearingVariant: null,
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
    isNewDrop: false,
    isActive: true,
    categorySlug: "bottoms",
    collectionSlug: "essentials",
    fitCategorySlug: "standard",
    images: [
      {
        src: "/images/placeholder-skirt-1.jpg",
        alt: "Flow Midi Skirt in Navy - Elegant Ready-to-wear from Ghana",
        position: 0,
        modelHeight: null,
        modelWearingSize: null,
        modelWearingVariant: null,
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
  // New cleanups
  await prisma.fitCategory.deleteMany();
  await prisma.currency.deleteMany();
  await prisma.bodyMeasurement.deleteMany();
  await prisma.lengthStandard.deleteMany();
  await prisma.looseFitMap.deleteMany();
  await prisma.discount.deleteMany();


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

  // Create Fit Categories
  console.log("Creating fit categories...");
  const fitCategoryMap: Record<string, string> = {};
  for (const fit of fitCategories) {
    const created = await prisma.fitCategory.create({
      data: fit,
    });
    fitCategoryMap[fit.slug] = created.id;
  }

  // Create Currencies
  console.log("Creating currencies...");
  for (const curr of currencies) {
    await prisma.currency.create({ data: curr });
  }

  // Define Sizing Data
  // Body Measurements
  const bodySizes = [
    { size: 'XS', bust: '30-33', waist: '23-26', hips: '34-37', thigh: '20-22', back: '14.5-15.5', underBust: '13-14', order: 1 },
    { size: 'S', bust: '33-36', waist: '26-29', hips: '37-40', thigh: '22-24', back: '15-16', underBust: '13.5-14.5', order: 2 },
    { size: 'M', bust: '36-39', waist: '29-32', hips: '40-43', thigh: '24-26', back: '15.5-16.5', underBust: '14-15', order: 3 },
    { size: 'L', bust: '39-42', waist: '32-36', hips: '43-46', thigh: '26-28', back: '16-17', underBust: '14.5-15.5', order: 4 },
    { size: 'XL', bust: '42-46', waist: '36-40', hips: '46-50', thigh: '28-31', back: '16.5-17.5', underBust: '15-16', order: 5 },
    { size: 'XXL', bust: '46-50', waist: '40-45', hips: '50-54', thigh: '31-34', back: '17-18', underBust: '16-17', order: 6 },
  ];
  console.log("Creating body measurements...");
  for (const size of bodySizes) {
    await prisma.bodyMeasurement.create({ data: size });
  }

  // Length Guide
  const lengths = [
    { part: "Short Sleeve", petite: "6", regular: "7", tall: "8.5", order: 1 },
    { part: "Long Sleeve", petite: "21", regular: "23", tall: "25", order: 2 },
    { part: "Short Length (Dress)", petite: "35-37", regular: "38-40", tall: "41-42", order: 3 },
    { part: "3/4 Length (Dress)", petite: "38-40", regular: "40-43", tall: "44-46", order: 4 },
    { part: "Full / Long Length", petite: "52-54", regular: "55-57", tall: "60-62", order: 5 },
  ];
  console.log("Creating length standards...");
  for (const len of lengths) {
    await prisma.lengthStandard.create({ data: len });
  }

  // Loose Fit Map
  const looseFits = [
    { looseSize: 'S', fitsStandard: 'Standard XS - S', order: 1 },
    { looseSize: 'M', fitsStandard: 'Standard M - L', order: 2 },
    { looseSize: 'L', fitsStandard: 'Standard XL - XXL', order: 3 },
  ];
  console.log("Creating loose fit map...");
  for (const map of looseFits) {
    await prisma.looseFitMap.create({ data: map });
  }

  // Create Discounts
  console.log("Creating discounts...");
  const discounts = [
    {
      description: "Summer Sale 2026",
      type: DiscountType.PERCENTAGE,
      value: new Decimal(10),
      startDate: new Date(),
      isActive: true,
      code: "SUMMER10"
    },
    {
      description: "Welcome Offer",
      type: DiscountType.FIXED_AMOUNT,
      value: new Decimal(50),
      startDate: new Date(),
      isActive: true,
      code: "WELCOME50"
    }
  ];

  for (const discount of discounts) {
    await prisma.discount.create({ data: discount });
  }



  // Create products with images and variants
  console.log("Creating products...");
  for (const product of products) {
    const { categorySlug, collectionSlug, fitCategorySlug, images, variants, ...productData } = product;

    // Fallback ID if not found (shouldn't happen if seeded correctly)
    const fitCategoryId = fitCategoryMap[fitCategorySlug];

    await prisma.product.create({
      data: {
        ...productData,
        categoryId: categoryMap[categorySlug],
        collectionId: collectionSlug ? collectionMap[collectionSlug] : null,
        fitCategoryId: fitCategoryId, // Link to model
        // Also set legacy enum if needed, but we deprecated it in Seed.
        // If schema requires it, we might need value, but typical default handles it?
        // Wait, schema has: // fitCategory FitCategoryType @default(STANDARD) (Commented out in model, but what about actualDB column?)
        // If I commented it out in schema, Prisma won't try to write to it via client. That's good.

        images: {
          create: images.map((img) => ({
            src: img.src,
            alt: img.alt,
            position: img.position,
            modelHeight: img.modelHeight,
            modelWearingSize: img.modelWearingSize,
            modelWearingVariant: img.modelWearingVariant,
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
  console.log(`   - ${currencies.length} currencies`);
  console.log(`   - Sizing standards populated.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
