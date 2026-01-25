import { prisma } from "@/lib/database";
import { requireAdminApi } from "@/lib/auth";
import { NextResponse } from "next/server";
import { generateSlug } from "@/lib/utils";

// GET: Public (product detail page)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        media: { orderBy: { position: "asc" } },
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
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// DELETE: Admin only
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;

    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemCount > 0) {
      const product = await prisma.product.update({
        where: { id },
        data: {
          isActive: false,
        },
      });

      return NextResponse.json({
        message: "Product archived",
        id: product.id,
      });
    } else {
      // Delete related records first to avoid FK constraint violations
      await prisma.$transaction(async (tx) => {
        // Delete variants (if not in use by cart/order items)
        await tx.productVariant.deleteMany({ where: { productId: id } });
        // Delete media
        await tx.productMedia.deleteMany({ where: { productId: id } });
        // Delete prices
        await tx.productPrice.deleteMany({ where: { productId: id } });
        // Finally delete the product
        await tx.product.delete({ where: { id } });
      });

      return NextResponse.json({
        message: "Product deleted permanently",
        id,
      });
    }
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}

// PATCH: Admin only
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if (!auth.success) return auth.response;

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

    const slug = generateSlug(name);

    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Update Core Product and handle relations in one nested operation
        const product = await tx.product.update({
          where: { id },
          data: {
            name,
            slug,
            description,
            costPrice: pricing.costPrice,
            discountId: pricing.discountId || null,
            isNewDrop: !!newDrop?.enabled,
            newDropExpiresAt: newDrop?.expiresAt
              ? new Date(newDrop.expiresAt)
              : null,
            categoryId: category,
            collectionId: collection || null,
            fitCategoryId: fitCategory || null,
            // Reconcile Frequently Bought Together links
            ...(frequentlyBoughtTogether && {
              relatedProducts: {
                set: frequentlyBoughtTogether.map((rid: string) => ({
                  id: rid,
                })),
              },
            }),
          },
        });

        // 2. Reconcile Variants
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id },
        });
        const incomingVariantIds = variants
          .map((v: any) => v.id)
          .filter(Boolean);

        // Identify variants to delete
        const variantsToDelete = existingVariants.filter(
          (ev) => !incomingVariantIds.includes(ev.id),
        );

        for (const variant of variantsToDelete) {
          // Check if variant is in use
          const inUse =
            (await tx.cartItem.findFirst({
              where: { variantId: variant.id },
            })) ||
            (await tx.orderItem.findFirst({
              where: { variantId: variant.id },
            }));

          if (inUse) {
            // Soft-delete if in use
            await tx.productVariant.update({
              where: { id: variant.id },
              data: { isAvailable: false },
            });
          } else {
            // Hard delete if safe
            await tx.productVariant.delete({ where: { id: variant.id } });
          }
        }

        // Update or Create incoming variants
        for (const v of variants) {
          if (v.id) {
            await tx.productVariant.upsert({
              where: { id: v.id },
              create: {
                name: v.name,
                isAvailable: v.available,
                productId: id,
              },
              update: {
                name: v.name,
                isAvailable: v.available,
              },
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,
                name: v.name,
                isAvailable: v.available,
              },
            });
          }
        }

        // 3. Reconcile Media (Images)
        // Media is safer to delete/recreate but reconciliation is cleaner
        const existingMedia = await tx.productMedia.findMany({
          where: { productId: id },
        });
        const incomingMediaIds = images
          .map((img: any) => img.id)
          .filter(Boolean);

        await tx.productMedia.deleteMany({
          where: {
            productId: id,
            id: { notIn: incomingMediaIds },
          },
        });

        for (const [index, img] of images.entries()) {
          const mediaData = {
            src: img.url,
            alt: img.alt,
            type: img.type || "IMAGE",
            position: index,
            modelHeight: img.modelHeight,
            modelWearingSize: img.wearingSize,
            modelWearingVariant: img.wearingVariant,
          };

          if (img.id) {
            await tx.productMedia.update({
              where: { id: img.id },
              data: mediaData,
            });
          } else {
            await tx.productMedia.create({
              data: {
                ...mediaData,
                productId: id,
              },
            });
          }
        }

        // 4. Reconcile Prices
        await tx.productPrice.deleteMany({ where: { productId: id } });
        await tx.productPrice.createMany({
          data: pricing.productPrices.map((p: any) => ({
            productId: id,
            currencyCode: p.currencyCode,
            price: p.price,
          })),
        });

        return product;
      },
      {
        timeout: 20000, // 20 seconds
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}
