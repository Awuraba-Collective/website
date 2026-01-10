import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const types = await prisma.measurementType.findMany({
            orderBy: {
                order: 'asc'
            }
        });

        return NextResponse.json(types);
    } catch (error) {
        console.error("Failed to fetch measurement types:", error);
        return NextResponse.json({ error: "Failed to fetch measurement types" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name } = await req.json();

        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // Check if already exists
        const existing = await prisma.measurementType.findUnique({
            where: { name: name.trim() }
        });

        if (existing) {
            return NextResponse.json({ error: "Measurement type already exists" }, { status: 409 });
        }

        // Get highest order
        const last = await prisma.measurementType.findFirst({
            orderBy: { order: 'desc' }
        });

        const type = await prisma.measurementType.create({
            data: {
                name: name.trim(),
                order: (last?.order ?? -1) + 1
            }
        });

        return NextResponse.json(type, { status: 201 });
    } catch (error) {
        console.error("Failed to create measurement type:", error);
        return NextResponse.json({ error: "Failed to create measurement type" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await prisma.measurementType.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete measurement type:", error);
        return NextResponse.json({ error: "Failed to delete measurement type" }, { status: 500 });
    }
}
