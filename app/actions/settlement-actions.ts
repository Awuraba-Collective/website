"use server";

import { prisma } from "@/lib/database";
import { requireAdmin } from "@/lib/auth";
import { Prisma } from "@/app/generated/prisma";

export async function getSettlements() {
    await requireAdmin();
    const settlements = await prisma.settlement.findMany({
        orderBy: { date: "desc" },
    });
    return settlements.map((s) => ({
        ...s,
        amount: s.amount.toString(),
    }));
}

export async function createSettlement(data: {
    vendor: string;
    amount: number;
    date: string;
    note?: string;
}) {
    await requireAdmin();
    try {
        const s = await prisma.settlement.create({
            data: {
                vendor: data.vendor,
                amount: new Prisma.Decimal(data.amount),
                date: new Date(data.date),
                note: data.note || undefined,
            },
        });
        return { success: true, settlement: { ...s, amount: s.amount.toString() } };
    } catch (error) {
        console.error("Failed to create settlement:", error);
        return { success: false, error: "Failed to create settlement." };
    }
}

export async function updateSettlement(
    id: string,
    data: { vendor?: string; amount?: number; date?: string; note?: string }
) {
    await requireAdmin();
    try {
        const s = await prisma.settlement.update({
            where: { id },
            data: {
                vendor: data.vendor,
                amount: data.amount != null ? new Prisma.Decimal(data.amount) : undefined,
                date: data.date ? new Date(data.date) : undefined,
                note: data.note,
            },
        });
        return { success: true, settlement: { ...s, amount: s.amount.toString() } };
    } catch (error) {
        console.error("Failed to update settlement:", error);
        return { success: false, error: "Failed to update settlement." };
    }
}

export async function deleteSettlement(id: string) {
    await requireAdmin();
    try {
        await prisma.settlement.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        console.error("Failed to delete settlement:", error);
        return { success: false, error: "Failed to delete settlement." };
    }
}
