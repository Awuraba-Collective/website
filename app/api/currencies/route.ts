import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const activeOnly = searchParams.get("active") === "true";

        const currencies = await prisma.currency.findMany({
            where: activeOnly ? { isActive: true } : undefined,
            orderBy: { isBase: 'desc' } // Base currency first
        });

        return NextResponse.json(currencies);
    } catch (error) {
        console.error("Failed to fetch currencies:", error);
        return NextResponse.json({ error: "Failed to fetch currencies" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { code, symbol, rate } = await req.json();

        if (!code || !symbol || rate === undefined) {
            return NextResponse.json({ error: "Code, symbol, and rate are required" }, { status: 400 });
        }

        // Check if currency already exists
        const existing = await prisma.currency.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (existing) {
            return NextResponse.json({ error: "Currency already exists" }, { status: 409 });
        }

        const currency = await prisma.currency.create({
            data: {
                code: code.toUpperCase(),
                symbol,
                rate: parseFloat(rate),
                isBase: false,
                isActive: true
            }
        });

        return NextResponse.json(currency, { status: 201 });
    } catch (error) {
        console.error("Failed to create currency:", error);
        return NextResponse.json({ error: "Failed to create currency" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { code, rate, symbol, isActive } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        // Build update data object
        const updateData: any = {};
        if (rate !== undefined) updateData.rate = parseFloat(rate);
        if (symbol !== undefined) updateData.symbol = symbol;
        if (isActive !== undefined) updateData.isActive = isActive;

        const currency = await prisma.currency.update({
            where: { code: code.toUpperCase() },
            data: updateData
        });

        return NextResponse.json(currency);
    } catch (error) {
        console.error("Failed to update currency:", error);
        return NextResponse.json({ error: "Failed to update currency" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        // Check if it's the base currency
        const currency = await prisma.currency.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (currency?.isBase) {
            return NextResponse.json({ error: "Cannot delete base currency" }, { status: 400 });
        }

        await prisma.currency.delete({
            where: { code: code.toUpperCase() }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete currency:", error);
        return NextResponse.json({ error: "Failed to delete currency" }, { status: 500 });
    }
}
