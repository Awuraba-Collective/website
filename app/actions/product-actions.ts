"use server";

import { prisma } from "@/lib/database";
import { Prisma } from "@/app/generated/prisma";

export async function searchProductsForOrder(query: string) {
    try {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { slug: { contains: query, mode: "insensitive" } },
                ],
                isActive: true,
            },
            include: {
                variants: {
                    where: { isAvailable: true },
                },
                prices: true,
                fitCategory: {
                    include: {
                        sizes: {
                            orderBy: { order: "asc" },
                        },
                    },
                },
                media: {
                    take: 1,
                    orderBy: { position: "asc" },
                },
            },
            take: 10,
        });

        return products.map(p => ({
            ...p,
            costPrice: p.costPrice?.toString(),
            prices: p.prices.map(pr => ({ ...pr, price: pr.price.toString() })),
            // Add a simple GHS price for quick display
            basePrice: parseFloat(p.prices.find(pr => pr.currencyCode === "GHS")?.price.toString() || "0"),
        }));
    } catch (error) {
        console.error("Failed to search products for order:", error);
        return [];
    }
}
