"use server";

import { prisma } from "@/lib/database";
import { requireAdmin } from "@/lib/auth";

export async function getFinancials() {
    await requireAdmin();

    const confirmedStatuses = ["CONFIRMED", "PROCESSING", "READY_FOR_DELIVERY", "SHIPPED", "DELIVERED"];

    // Income: sum of amountPaid per item for confirmed orders
    const orderItems = await prisma.orderItem.findMany({
        where: { order: { status: { in: confirmedStatuses as any } } },
        include: {
            product: { select: { costPrice: true } },
            order: { select: { orderDate: true, createdAt: true } },
        },
    });

    let income = 0;
    let totalCostPrice = 0;

    for (const item of orderItems) {
        const paid = item.amountPaid != null
            ? parseFloat(item.amountPaid.toString()) * item.quantity
            : parseFloat(item.unitPrice.toString()) * item.quantity;
        income += paid;

        const cost = item.product?.costPrice != null
            ? parseFloat(item.product.costPrice.toString()) * item.quantity
            : 0;
        totalCostPrice += cost;
    }

    // Manual settlements issued so far
    const settlements = await prisma.settlement.findMany({ orderBy: { date: "desc" } });
    const totalSettled = settlements.reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0);

    // Pending = what still needs to be paid to vendors
    const pendingSettlement = Math.max(totalCostPrice - totalSettled, 0);

    // Total Profit = Income − total cost price (gross margin)
    const totalProfit = income - totalCostPrice;

    // Expenses
    const expenses = await prisma.expense.findMany();
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);

    // Monthly breakdown (last 6 months)
    const monthlyData: Record<string, { income: number; costPrice: number; settled: number; expenses: number }> = {};

    for (const item of orderItems) {
        const date = item.order.orderDate || item.order.createdAt;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!monthlyData[key]) monthlyData[key] = { income: 0, costPrice: 0, settled: 0, expenses: 0 };

        const paid = item.amountPaid != null
            ? parseFloat(item.amountPaid.toString()) * item.quantity
            : parseFloat(item.unitPrice.toString()) * item.quantity;
        monthlyData[key].income += paid;

        const cost = item.product?.costPrice != null
            ? parseFloat(item.product.costPrice.toString()) * item.quantity
            : 0;
        monthlyData[key].costPrice += cost;
    }

    for (const s of settlements) {
        const key = `${s.date.getFullYear()}-${String(s.date.getMonth() + 1).padStart(2, "0")}`;
        if (!monthlyData[key]) monthlyData[key] = { income: 0, costPrice: 0, settled: 0, expenses: 0 };
        monthlyData[key].settled += parseFloat(s.amount.toString());
    }

    for (const e of expenses) {
        const key = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}`;
        if (!monthlyData[key]) monthlyData[key] = { income: 0, costPrice: 0, settled: 0, expenses: 0 };
        monthlyData[key].expenses += parseFloat(e.amount.toString());
    }

    const monthly = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, data]) => ({ month, ...data }));

    return {
        income,
        totalCostPrice,
        totalSettled,
        pendingSettlement,
        totalProfit,
        totalExpenses,
        monthly,
        settlements: settlements.map((s) => ({ ...s, amount: s.amount.toString() })),
        orderItemCount: orderItems.length,
    };
}
