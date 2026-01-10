import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

// GET: Fetch all sizing standards (FitCategories with nested sizes + LengthStandards)
export async function GET() {
    try {
        const [fitCategories, lengthStandards] = await Promise.all([
            prisma.fitCategory.findMany({
                include: {
                    sizes: {
                        orderBy: { order: 'asc' }
                    }
                },
                orderBy: { name: 'asc' }
            }),
            prisma.lengthStandard.findMany({ orderBy: { order: 'asc' } }),
        ]);

        return NextResponse.json({
            fitCategories,
            lengths: lengthStandards,
        });
    } catch (error: any) {
        console.error("Failed to fetch sizing standards:", error);
        return NextResponse.json({
            error: "Failed to fetch sizing standards",
            details: error.message,
            prismaModels: Object.keys(prisma).filter(k => !k.startsWith('$')),
            fitCategoryKeys: Object.keys((prisma as any).fitCategory || {})
        }, { status: 500 });
    }
}

// POST: Bulk update sizing standards
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { fitCategories, lengths } = body;

        await prisma.$transaction(async (tx) => {
            // Update FitCategories and FitSizes
            if (fitCategories) {
                for (const cat of fitCategories) {
                    // Update the category itself
                    await tx.fitCategory.update({
                        where: { id: cat.id },
                        data: {
                            isStandard: cat.isStandard,
                            description: cat.description,
                            measurementLabels: cat.measurementLabels || []
                        }
                    });

                    // Update sizes for this category
                    if (cat.sizes) {
                        await tx.fitSize.deleteMany({
                            where: { fitCategoryId: cat.id }
                        });

                        await tx.fitSize.createMany({
                            data: cat.sizes.map((s: any, index: number) => ({
                                name: s.name,
                                fitCategoryId: cat.id,
                                standardMapping: s.standardMapping,
                                order: index,
                                measurements: s.measurements || {}
                            }))
                        });
                    }
                }
            }

            // Update LengthStandards
            if (lengths) {
                await tx.lengthStandard.deleteMany({});
                await tx.lengthStandard.createMany({
                    data: lengths.map((l: any, index: number) => ({
                        part: l.part,
                        petite: l.petite,
                        regular: l.regular,
                        tall: l.tall,
                        order: index
                    }))
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update sizing standards:", error);
        return NextResponse.json({ error: "Failed to update sizing standards" }, { status: 500 });
    }
}
