import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

// GET: Fetch ALL discounts (for management, including inactive or expired)
export async function GET() {
    try {
        const discounts = await prisma.discount.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(discounts);
    } catch (error) {
        console.error("Failed to fetch discounts:", error);
        return NextResponse.json({ error: "Failed to fetch discounts" }, { status: 500 });
    }
}

// POST: Create a new discount
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, description, type, value, startDate, endDate, isActive } = body;

        // Basic validation
        if (!description || !type || value === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newDiscount = await prisma.discount.create({
            data: {
                code,
                description,
                type,
                value: parseFloat(value),
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : null,
                isActive: isActive ?? true
            }
        });

        return NextResponse.json(newDiscount);
    } catch (error) {
        console.error("Failed to create discount:", error);
        return NextResponse.json({ error: "Failed to create discount" }, { status: 500 });
    }
}
