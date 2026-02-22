'use client';

import { motion } from 'framer-motion';
import {
    TrendingUp,
    ShoppingBag,
    Users,
    DollarSign,
    Receipt,
    Plus,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
    confirmedRevenue: string;
    pendingRevenue: string;
    totalOrders: string;
    activeCustomers: string;
    totalIncome: string;
    totalExpenses: string;
    totalCustomers: string;
}

interface Transaction {
    id: string;
    customer: string;
    date: string;
    total: string;
    status: string;
    initial: string;
}

interface ChartData {
    label: string;
    value: number;
    actual: number;
}

interface BestSeller {
    name: string;
    sales: number;
    revenue: string;
}

interface DashboardOverviewProps {
    data: {
        stats: DashboardStats;
        recentTransactions: Transaction[];
        chartData: ChartData[];
        bestSellers: BestSeller[];
    };
}

function StatCard({ name, value, icon: Icon, index }: { name: string; value: string; icon: any; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="bg-white dark:bg-black p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-black dark:hover:border-white transition-colors group space-y-3"
        >
            <div className="flex items-center justify-between text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">{name}</p>
                <Icon className="w-4 h-4" />
            </div>
            <p className="text-3xl font-bold text-black dark:text-white tracking-tight">{value}</p>
        </motion.div>
    );
}

export function DashboardOverview({ data }: DashboardOverviewProps) {
    const stats = [
        {
            name: 'Total Income',
            value: `GH₵ ${parseFloat(data.stats.totalIncome || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
        },
        {
            name: 'Total Expenses',
            value: `GH₵ ${parseFloat(data.stats.totalExpenses || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            icon: Receipt,
        },
        {
            name: 'Total Orders',
            value: data.stats.totalOrders,
            icon: ShoppingBag,
        },
        {
            name: 'Total Customers',
            value: data.stats.totalCustomers || data.stats.activeCustomers,
            icon: Users,
        },
    ];

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-black dark:text-white">Overview</h1>
                    <p className="text-neutral-500 font-light mt-1">
                        A summary of your business performance and real-time activity.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/products/upload"
                        className="flex items-center gap-2 h-10 px-6 bg-black dark:bg-white text-white dark:text-black rounded-lg text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-4 h-4" />
                        New Product
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <StatCard key={stat.name} {...stat} index={index} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-black p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-sm font-black text-black dark:text-white uppercase tracking-widest">Revenue Growth</h2>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Last 7 Days</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-md text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                            Live
                        </div>
                    </div>

                    <div className="h-60 w-full flex items-end justify-between gap-3 pt-8 px-2">
                        {data.chartData.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                <div className="w-full flex items-end justify-center h-full relative">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${day.value}%` }}
                                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                                        className="w-full max-w-[24px] bg-neutral-100 dark:bg-neutral-900 group-hover:bg-black dark:group-hover:bg-white rounded-t-sm transition-colors relative"
                                    >
                                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 text-[9px] font-black tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            GH₵ {day.actual.toFixed(0)}
                                        </div>
                                    </motion.div>
                                </div>
                                <span className="text-[9px] font-black text-neutral-300 dark:text-neutral-700 uppercase tracking-tighter">
                                    {day.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Best Sellers */}
                <div className="bg-white dark:bg-black p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-sm font-black text-black dark:text-white uppercase tracking-widest">Best Sellers</h2>
                        <TrendingUp className="w-4 h-4 text-neutral-300" />
                    </div>

                    <div className="space-y-6">
                        {data.bestSellers.length > 0 ? (
                            data.bestSellers.map((item, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded flex items-center justify-center text-[10px] font-black group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors">
                                            0{i + 1}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-black dark:text-white uppercase tracking-tight">{item.name}</p>
                                            <p className="text-[9px] font-bold text-neutral-400 mt-0.5 tracking-widest uppercase">{item.sales} sold</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black text-black dark:text-white">
                                        GH₵ {parseFloat(item.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] text-neutral-400 font-light">No sales data available yet.</p>
                        )}

                        <Link href="/admin/products" className="block pt-4">
                            <button className="w-full h-10 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                                Manage Inventory
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-black p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-sm font-black text-black dark:text-white uppercase tracking-widest">Recent Activity</h2>
                        <div className="h-0.5 w-8 bg-black dark:bg-white mt-3" />
                    </div>
                    <Link href="/admin/orders" className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                        View All
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-100 dark:border-neutral-900">
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Reference</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Customer</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Date</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center">Status</th>
                                <th className="pb-4 text-right text-[10px] font-black uppercase tracking-widest text-neutral-400">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900">
                            {data.recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-sm text-neutral-400 font-light">
                                        No recent orders.
                                    </td>
                                </tr>
                            ) : (
                                data.recentTransactions.map((order) => (
                                    <tr key={order.id} className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors">
                                        <td className="py-4 font-bold text-[11px] tracking-tight">{order.id}</td>
                                        <td className="py-4">
                                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-tighter">{order.customer}</span>
                                        </td>
                                        <td className="py-4 text-[11px] text-neutral-400 font-medium">{order.date}</td>
                                        <td className="py-4 text-center">
                                            <span className="text-[9px] font-black uppercase tracking-widest border border-neutral-200 dark:border-neutral-800 px-3 py-1 rounded-sm">
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right font-bold text-xs">
                                            GH₵ {parseFloat(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
