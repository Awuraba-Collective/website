import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const currencies = await prisma.currency.findMany({
            orderBy: { isBase: 'desc' } // Base currency first
        });

        return NextResponse.json(currencies);
    } catch (error) {
        console.error("Failed to fetch currencies:", error);
        return NextResponse.json({ error: "Failed to fetch currencies" }, { status: 500 });
    }
}
