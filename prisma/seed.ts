import { prisma } from "../lib/database";
import { DiscountType, Prisma } from "../app/generated/prisma";

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
  {
    name: "Standard Fit",
    slug: "standard",
    description: "Regular fit true to size.",
  },
  {
    name: "Loose Fit",
    slug: "loose",
    description: "Relaxed, comfortable fit.",
  },
];

const currencies = [
  { code: "GHS", symbol: "₵", rate: 1.0, isBase: true },
  { code: "USD", symbol: "$", rate: 15.38, isBase: false }, // 1 USD = 15.38 GHS
  { code: "EUR", symbol: "€", rate: 16.5, isBase: false },
  { code: "GBP", symbol: "£", rate: 19.5, isBase: false },
];

const products = [
  {
    name: "The Awuraba Maxi",
    slug: "elegant-maxi-dress",
    description:
      "Our signature silhouette designed for effortless elegance. Features a flowing drape that flatters every curve. Perfect for both casual outings and formal events.",
    price: new Prisma.Decimal(450),
    discountPrice: new Prisma.Decimal(380),
    discountEndsAt: new Date("2026-01-20T23:59:59Z"),
    isNewDrop: true,
    isActive: true,
    categorySlug: "dresses",
    collectionSlug: "january-25th-drop",
    fitCategorySlug: "standard",
    images: [
      {
        src: "https://d17a17kld06uk8.cloudfront.net/products/QYHVEYS/9KE7U4A6-original.jpg",
        alt: "The Awuraba Maxi Dress in Emerald Green - Elegant African Fashion",
        position: 0,
        modelHeight: "5'9\"",
        modelWearingSize: "M",
        modelWearingVariant: "Emerald Green",
      },
      {
        src: "https://d17a17kld06uk8.cloudfront.net/products/QYHVEYS/9KE7U4A6-original.jpg",
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
    price: new Prisma.Decimal(600),
    isNewDrop: false,
    isActive: true,
    categorySlug: "sets",
    collectionSlug: "essentials",
    fitCategorySlug: "loose",
    images: [
      {
        src: "https://d17a17kld06uk8.cloudfront.net/products/QYHVEYS/9KE7U4A6-original.jpg",
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
    price: new Prisma.Decimal(250),
    isNewDrop: true,
    isActive: true,
    categorySlug: "tops",
    collectionSlug: "january-25th-drop",
    fitCategorySlug: "standard",
    images: [
      {
        src: "https://d17a17kld06uk8.cloudfront.net/products/QYHVEYS/9KE7U4A6-original.jpg",
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
    price: new Prisma.Decimal(350),
    isNewDrop: false,
    isActive: true,
    categorySlug: "bottoms",
    collectionSlug: "essentials",
    fitCategorySlug: "standard",
    images: [
      {
        src: "https://d17a17kld06uk8.cloudfront.net/products/QYHVEYS/9KE7U4A6-original.jpg",
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
  await prisma.productMedia.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.category.deleteMany();
  // New cleanups
  await prisma.fitCategory.deleteMany();
  await prisma.currency.deleteMany();
  await prisma.fitSize.deleteMany();
  await prisma.lengthStandard.deleteMany();
  await prisma.productPrice.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.measurementType.deleteMany();

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

  // Create Fit Categories (Size Scales)
  console.log("Creating fit categories...");
  const fitCategoryMap: Record<string, string> = {};

  // Common Measurement Types
  const measurementTypes = ["Bust", "Waist", "Hips", "Thigh", "Back", "Under Bust", "Shoulder", "Length", "Leg Opening"];
  for (const [index, name] of measurementTypes.entries()) {
    await prisma.measurementType.create({
      data: { name, order: index }
    });
  }

  // Standard Scale
  const standardFit = await prisma.fitCategory.create({
    data: {
      name: "Standard Fit",
      slug: "standard",
      isStandard: true,
      description: "True-to-size pieces designed to follow your body's natural silhouette.",
      measurementLabels: ["UK Size", "Bust", "Waist", "Hips", "Thigh", "Back", "Under Bust"],
      sizes: {
        create: [
          { name: "XS", order: 1, measurements: { "UK Size": "6 - 8", "Bust": "30 - 32", "Waist": "23 - 25", "Hips": "34 - 36", "Thigh": "20 - 22", "Back": "14.5 - 15", "Under Bust": "13 - 13.5" } },
          { name: "S", order: 2, measurements: { "UK Size": "10", "Bust": "33 - 35", "Waist": "26 - 28", "Hips": "37 - 39", "Thigh": "23 - 25", "Back": "15.5 - 16", "Under Bust": "14 - 14.5" } },
          { name: "M", order: 3, measurements: { "UK Size": "12", "Bust": "36 - 38", "Waist": "29 - 31", "Hips": "40 - 42", "Thigh": "25 - 27", "Back": "16.5 - 17", "Under Bust": "15 - 15.5" } },
          { name: "L", order: 4, measurements: { "UK Size": "14", "Bust": "39 - 41", "Waist": "32 - 35", "Hips": "43 - 45", "Thigh": "27 - 29", "Back": "17.5 - 18", "Under Bust": "16 - 16.5" } },
          { name: "XL", order: 5, measurements: { "UK Size": "16", "Bust": "42 - 45", "Waist": "36 - 39", "Hips": "46 - 49", "Thigh": "30 - 32", "Back": "18.5 - 19", "Under Bust": "17 - 17.5" } },
          { name: "XXL", order: 6, measurements: { "UK Size": "18 - 20", "Bust": "46 - 50", "Waist": "40 - 45", "Hips": "50 - 54", "Thigh": "33 - 35", "Back": "19.5 - 20.5", "Under Bust": "18 - 19" } },
        ]
      }
    }
  });
  fitCategoryMap["standard"] = standardFit.id;

  // Loose Scale
  const looseFit = await prisma.fitCategory.create({
    data: {
      name: "Loose Fit",
      slug: "loose",
      isStandard: false,
      description: "Styles meant to be worn voluminously (like 'Bola' or Boubou styles). These are cut generously for a relaxed look.",
      measurementLabels: [], // Loose fits usually just show mapping
      sizes: {
        create: [
          { name: "S", order: 1, standardMapping: "Standard XS - S" },
          { name: "M", order: 2, standardMapping: "Standard M - L" },
          { name: "L", order: 3, standardMapping: "Standard XL - XXL" },
        ]
      }
    }
  });
  fitCategoryMap["loose"] = looseFit.id;

  // UK Scale Example
  const ukFit = await prisma.fitCategory.create({
    data: {
      name: "UK Sizing",
      slug: "uk-sizing",
      isStandard: false,
      description: "Traditional UK numeric sizing.",
      measurementLabels: ["Bust", "Waist", "Hips"],
      sizes: {
        create: [
          { name: "6", order: 1, measurements: { "Bust": "31", "Waist": "24", "Hips": "34" } },
          { name: "8", order: 2, measurements: { "Bust": "32", "Waist": "25", "Hips": "35" } },
          { name: "10", order: 3, measurements: { "Bust": "34", "Waist": "27", "Hips": "37" } },
          { name: "12", order: 4, measurements: { "Bust": "36", "Waist": "29", "Hips": "39" } },
        ]
      }
    }
  });
  fitCategoryMap["uk-sizing"] = ukFit.id;

  // Create Length Standards
  console.log("Creating length standards...");
  const lengthStandards = [
    { part: "Short Sleeve", petite: "6", regular: "7", tall: "8.5", order: 0 },
    { part: "Long Sleeve", petite: "21", regular: "23", tall: "25", order: 1 },
    { part: "Short Length (Dress)", petite: "35-37", regular: "38-40", tall: "41-42", order: 2 },
    { part: "3/4 Length (Dress)", petite: "38-40", regular: "41-43", tall: "44-46", order: 3 },
    { part: "Full / Long Length", petite: "52-54", regular: "55-57", tall: "60-62", order: 4 },
  ];

  for (const length of lengthStandards) {
    await prisma.lengthStandard.create({ data: length });
  }

  // Create Currencies
  console.log("Creating currencies...");
  for (const curr of currencies) {
    await prisma.currency.create({ data: curr });
  }

  // Create products with images and variants
  console.log("Creating products...");
  const discounts = [
    {
      description: "Summer Sale 2026",
      type: DiscountType.PERCENTAGE,
      value: new Prisma.Decimal(10),
      startDate: new Date(),
      isActive: true,
      code: "SUMMER10",
    },
    {
      description: "Welcome Offer",
      type: DiscountType.FIXED_AMOUNT,
      value: new Prisma.Decimal(50),
      startDate: new Date(),
      isActive: true,
      code: "WELCOME50",
    },
  ];

  for (const discount of discounts) {
    await prisma.discount.create({ data: discount });
  }

  // Create products with images and variants
  console.log("Creating products...");
  for (const product of products) {
    const {
      price,
      discountPrice,
      discountEndsAt,
      categorySlug,
      collectionSlug,
      fitCategorySlug,
      images,
      variants,
      ...productData
    } = product;

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

        media: {
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
        prices: {
          create: [
            {
              currencyCode: "GHS",
              price: price,
            },
            ...currencies
              .filter(c => !c.isBase)
              .map(c => {
                const convertedPrice = price.div(c.rate);
                return {
                  currencyCode: c.code,
                  price: convertedPrice,
                };
              })
          ]
        }
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
