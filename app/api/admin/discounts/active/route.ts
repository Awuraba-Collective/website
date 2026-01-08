import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const discounts = await prisma.discount.findMany({
            where: {
                isActive: true,
                OR: [
                    { endDate: null },
                    { endDate: { gt: new Date() } }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(discounts);
    } catch (error) {
        console.error("Failed to fetch discounts:", error);
        return NextResponse.json({ error: "Failed to fetch discounts" }, { status: 500 });
    }
}
