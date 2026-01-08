import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { code, description, type, value, startDate, endDate, isActive } = body;

        // Basic validation
        if (!description || !type || value === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const updatedDiscount = await prisma.discount.update({
            where: { id },
            data: {
                code: code || null,
                description,
                type,
                value: parseFloat(value),
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : null,
                isActive: isActive ?? true
            }
        });

        return NextResponse.json(updatedDiscount);
    } catch (error) {
        console.error("Failed to update discount:", error);
        return NextResponse.json({ error: "Failed to update discount" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Check if discount is used by any products?
        // Ideally we should prevent deletion if used, or just unlink.
        // For now, let's just delete (cascade handling should be in schema, or simple delete)
        // Schema relation: Product -> Discount (optional). 
        // If we delete discount, products with that discountId might complain if relation is strict.
        // Let's set product.discountId to null first.

        await prisma.product.updateMany({
            where: { discountId: id },
            data: { discountId: null }
        });

        await prisma.discount.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete discount:", error);
        return NextResponse.json({ error: "Failed to delete discount" }, { status: 500 });
    }
}
