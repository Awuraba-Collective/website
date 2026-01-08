import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

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
