import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

// Helper to generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const {
            name,
            description,
            category, // ID
            fitCategory, // ID
            collection, // ID
            pricing,
            variants,
            images,
            frequentlyBoughtTogether,
            newDrop,
        } = payload;

        const slug = generateSlug(name);

        // Transaction to ensure all related data is created correctly
        const result = await prisma.$transaction(
            async (tx) => {
                // 1. Create the Product and related data in one go
                const product = await tx.product.create({
                    data: {
                        name,
                        slug,
                        description,
                        price: pricing.priceGHS,
                        costPrice: pricing.costPrice,
                        discountId: pricing.discountId || null,

                        // New Drop Logic
                        isNewDrop: !!newDrop?.enabled,
                        newDropExpiresAt: newDrop?.expiresAt ? new Date(newDrop.expiresAt) : null,

                        // Relations (IDs)
                        categoryId: category,
                        collectionId: collection || null,
                        fitCategoryId: fitCategory || null,

                        // Variants
                        variants: {
                            create: variants.map((v: any) => ({
                                name: v.name,
                                isAvailable: v.available,
                            })),
                        },

                        // Images
                        media: {
                            create: images.map((img: any, index: number) => ({
                                src: img.url,
                                alt: img.alt,
                                type: "IMAGE",
                                position: index,
                                modelHeight: img.modelHeight,
                                modelWearingSize: img.wearingSize,
                                modelWearingVariant: img.wearingVariant,
                            })),
                        },

                        // Multi-currency Prices
                        prices: {
                            create: pricing.productPrices.map((p: any) => ({
                                currencyCode: p.currencyCode,
                                price: p.price,
                                discountPrice: p.discountPrice || null,
                            })),
                        },

                        // Handle Frequently Bought Together links immediately
                        ...(frequentlyBoughtTogether && frequentlyBoughtTogether.length > 0 && {
                            relatedProducts: {
                                connect: frequentlyBoughtTogether.map((id: string) => ({ id })),
                            },
                        }),
                    },
                });

                return product;
            },
            {
                timeout: 20000, // 20 seconds
            }
        );

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Failed to create product:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const categoryId = searchParams.get("categoryId");
        const collectionId = searchParams.get("collectionId");
        const search = searchParams.get("search");

        const where: any = {
            ...(categoryId && { categoryId }),
            ...(collectionId && { collectionId }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ]
            }),
        };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                include: {
                    media: { orderBy: { position: 'asc' }, take: 1 },
                    category: true,
                    collection: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where })
        ]);

        return NextResponse.json({
            products,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
