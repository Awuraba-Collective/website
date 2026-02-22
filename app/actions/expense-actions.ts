"use server";

import { prisma } from "@/lib/database";
import { requireAdmin } from "@/lib/auth";
import { Prisma } from "@/app/generated/prisma";

export async function getExpenses() {
    await requireAdmin();
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: "desc" },
        });
        return expenses.map((e) => ({
            ...e,
            amount: e.amount.toString(),
        }));
    } catch (error) {
        console.error("Failed to fetch expenses:", error);
        return [];
    }
}

export async function createExpense(data: {
    title: string;
    amount: number;
    category: string;
    date: string;
    note?: string;
}) {
    await requireAdmin();
    try {
        const expense = await prisma.expense.create({
            data: {
                title: data.title,
                amount: new Prisma.Decimal(data.amount),
                category: data.category,
                date: new Date(data.date),
                note: data.note || undefined,
            },
        });
        return { success: true, expense: { ...expense, amount: expense.amount.toString() } };
    } catch (error) {
        console.error("Failed to create expense:", error);
        return { success: false, error: "Failed to create expense." };
    }
}

export async function updateExpense(
    id: string,
    data: {
        title?: string;
        amount?: number;
        category?: string;
        date?: string;
        note?: string;
    }
) {
    await requireAdmin();
    try {
        const expense = await prisma.expense.update({
            where: { id },
            data: {
                title: data.title,
                amount: data.amount != null ? new Prisma.Decimal(data.amount) : undefined,
                category: data.category,
                date: data.date ? new Date(data.date) : undefined,
                note: data.note,
            },
        });
        return { success: true, expense: { ...expense, amount: expense.amount.toString() } };
    } catch (error) {
        console.error("Failed to update expense:", error);
        return { success: false, error: "Failed to update expense." };
    }
}

export async function deleteExpense(id: string) {
    await requireAdmin();
    try {
        await prisma.expense.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        console.error("Failed to delete expense:", error);
        return { success: false, error: "Failed to delete expense." };
    }
}
