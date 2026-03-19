import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const collectionId = searchParams.get("collectionId");

    if (!query) {
        return NextResponse.json([]);
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive',
                },
                isActive: true,
                ...(collectionId && { collectionId })
            },
            take: 10,
            select: {
                id: true,
                name: true,
                media: {
                    orderBy: {
                        position: 'asc'
                    },
                    select: {
                        src: true,
                        type: true
                    }
                }
            }
        });

        // Format for frontend
        const formatted = products.map(p => ({
            id: p.id,
            name: p.name,
            media: p.media
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Failed to search products:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
