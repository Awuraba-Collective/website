import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

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
                isArchived: false
            },
            take: 10,
            select: {
                id: true,
                name: true,
                images: {
                    take: 1,
                    select: {
                        url: true
                    }
                }
            }
        });

        // Format for frontend
        const formatted = products.map(p => ({
            id: p.id,
            name: p.name,
            image: p.images[0]?.url || ''
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Failed to search products:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
