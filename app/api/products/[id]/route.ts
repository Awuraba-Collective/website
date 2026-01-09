import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                media: { orderBy: { position: 'asc' } },
                variants: true,
                category: true,
                collection: true,
                fitCategory: true,
                prices: true,
                relatedProducts: true,
            },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Correctly perform hard delete
        const product = await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Product deleted permanently", id: product.id });
    } catch (error) {
        console.error("Failed to delete product:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const payload = await req.json();

        // If it's a simple isActive toggle (from the table)
        if (Object.keys(payload).length === 1 && payload.isActive !== undefined) {
            const product = await prisma.product.update({
                where: { id },
                data: { isActive: payload.isActive },
            });
            return NextResponse.json({ message: "Status updated", id: product.id });
        }

        // Full Product Update (from the form)
        const {
            name,
            description,
            category,
            fitCategory,
            collection,
            pricing,
            variants,
            images,
            frequentlyBoughtTogether,
            newDrop,
        } = payload;

        const result = await prisma.$transaction(
            async (tx) => {
                // 1. Update Core Product and handle relations in one nested operation
                const product = await tx.product.update({
                    where: { id },
                    data: {
                        name,
                        description,
                        price: pricing.priceGHS,
                        costPrice: pricing.costPrice,
                        discountId: pricing.discountId || null,
                        isNewDrop: !!newDrop?.enabled,
                        newDropExpiresAt: newDrop?.expiresAt ? new Date(newDrop.expiresAt) : null,
                        categoryId: category,
                        collectionId: collection || null,
                        fitCategoryId: fitCategory || null,
                        // Reconcile Frequently Bought Together links
                        ...(frequentlyBoughtTogether && {
                            relatedProducts: {
                                set: frequentlyBoughtTogether.map((rid: string) => ({ id: rid }))
                            }
                        })
                    }
                });

                // 2. Reconcile Variants (Delete and Recreate for simplicity)
                await tx.productVariant.deleteMany({ where: { productId: id } });
                await tx.productVariant.createMany({
                    data: variants.map((v: any) => ({
                        productId: id,
                        name: v.name,
                        isAvailable: v.available,
                    }))
                });

                // 3. Reconcile Media (Images)
                await tx.productMedia.deleteMany({ where: { productId: id } });
                await tx.productMedia.createMany({
                    data: images.map((img: any, index: number) => ({
                        productId: id,
                        src: img.url,
                        alt: img.alt,
                        type: "IMAGE",
                        position: index,
                        modelHeight: img.modelHeight,
                        modelWearingSize: img.wearingSize,
                        modelWearingVariant: img.wearingVariant,
                    }))
                });

                // 4. Reconcile Prices
                await tx.productPrice.deleteMany({ where: { productId: id } });
                await tx.productPrice.createMany({
                    data: pricing.productPrices.map((p: any) => ({
                        productId: id,
                        currencyCode: p.currencyCode,
                        price: p.price,
                        discountPrice: p.discountPrice || null,
                    }))
                });

                return product;
            },
            {
                timeout: 20000, // 20 seconds
            }
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to update product:", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}
