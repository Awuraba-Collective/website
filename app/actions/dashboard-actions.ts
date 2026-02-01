"use server";

import { prisma } from "@/lib/database";
import { requireAdmin } from "@/lib/auth";

export async function getDashboardStats() {
    await requireAdmin();

    try {
        const confirmedStatuses = ['CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'SHIPPED', 'DELIVERED'];

        // 1. Total Revenue (Confirmed)
        const confirmedOrders = await prisma.order.findMany({
            where: {
                status: { in: confirmedStatuses as any },
            },
            select: {
                total: true,
                createdAt: true,
            },
        });

        const totalRevenue = confirmedOrders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

        // 2. Pending Revenue
        const pendingOrders = await prisma.order.findMany({
            where: {
                status: 'PENDING',
            },
            select: {
                total: true,
            },
        });

        const pendingRevenue = pendingOrders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

        // 3. Total Orders (Confirmed)
        const totalOrdersCount = confirmedOrders.length;

        // 4. Active Customers (at least one confirmed order)
        const activeCustomersCount = await prisma.customer.count({
            where: {
                orders: {
                    some: {
                        status: { in: confirmedStatuses as any },
                    },
                },
            },
        });

        // 5. Recent Transactions
        const recentTransactions = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        // 6. Revenue Growth (Last 7 Days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            return d;
        }).reverse();

        const revenueByDay = last7Days.map(date => {
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            const dayRevenue = confirmedOrders
                .filter(order => order.createdAt >= date && order.createdAt <= dayEnd)
                .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

            return {
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                revenue: dayRevenue,
            };
        });

        // Normalize revenue for chart (percentage relative to max or just the value)
        const maxRevenue = Math.max(...revenueByDay.map(d => d.revenue), 1);
        const chartData = revenueByDay.map(d => ({
            label: d.date,
            value: (d.revenue / maxRevenue) * 100,
            actual: d.revenue,
        }));

        // 7. Best Sellers (Top 4)
        const bestSellersData = await prisma.orderItem.groupBy({
            by: ['productId', 'productName'],
            where: {
                order: {
                    status: { in: confirmedStatuses as any },
                },
            },
            _sum: {
                quantity: true,
                totalPrice: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: 4,
        });

        const bestSellers = bestSellersData.map(item => ({
            name: item.productName,
            sales: item._sum.quantity || 0,
            revenue: (item._sum.totalPrice || 0).toString(),
        }));

        return {
            stats: {
                confirmedRevenue: totalRevenue.toString(),
                pendingRevenue: pendingRevenue.toString(),
                totalOrders: totalOrdersCount.toString(),
                activeCustomers: activeCustomersCount.toString(),
            },
            recentTransactions: recentTransactions.map(order => ({
                id: order.orderNumber,
                customer: order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Guest',
                date: order.createdAt.toISOString().split('T')[0],
                total: order.total.toString(),
                status: order.status,
                initial: order.customer ? `${order.customer.firstName[0]}${order.customer.lastName[0]}` : 'G',
            })),
            chartData,
            bestSellers,
        };
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        throw new Error("Failed to fetch dashboard stats");
    }
}
