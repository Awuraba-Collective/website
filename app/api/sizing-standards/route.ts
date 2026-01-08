import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

// GET: Fetch all sizing standards
export async function GET() {
    try {
        const [bodyMeasurements, lengthStandards, looseFitMaps] = await Promise.all([
            prisma.bodyMeasurement.findMany({ orderBy: { order: 'asc' } }),
            prisma.lengthStandard.findMany({ orderBy: { order: 'asc' } }),
            prisma.looseFitMap.findMany({ orderBy: { order: 'asc' } }),
        ]);

        return NextResponse.json({
            sizes: bodyMeasurements,
            lengths: lengthStandards,
            looseFits: looseFitMaps
        });
    } catch (error) {
        console.error("Failed to fetch sizing standards:", error);
        return NextResponse.json({ error: "Failed to fetch sizing standards" }, { status: 500 });
    }
}

// POST: Bulk update sizing standards in a transaction
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sizes, lengths, looseFits } = body;

        await prisma.$transaction(async (tx) => {
            // Update BodyMeasurements
            if (sizes) {
                await tx.bodyMeasurement.deleteMany({});
                await tx.bodyMeasurement.createMany({
                    data: sizes.map((s: any, index: number) => ({
                        size: s.size,
                        bust: s.bust,
                        waist: s.waist,
                        hips: s.hips,
                        thigh: s.thigh,
                        back: s.back,
                        underBust: s.underBust,
                        order: index
                    }))
                });
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

            // Update LooseFitMaps
            if (looseFits) {
                await tx.looseFitMap.deleteMany({});
                await tx.looseFitMap.createMany({
                    data: looseFits.map((lf: any, index: number) => ({
                        looseSize: lf.looseSize,
                        fitsStandard: lf.fitsStandard,
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
