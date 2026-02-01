'use client';

import { motion } from 'framer-motion';
import {
    TrendingUp,
    ShoppingBag,
    Users,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Plus,
    FileDown,
    Package,
    AlertCircle,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
    confirmedRevenue: string;
    pendingRevenue: string;
    totalOrders: string;
    activeCustomers: string;
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

export function DashboardOverview({ data }: DashboardOverviewProps) {
    const stats = [
        {
            name: 'Confirmed Settlement',
            value: `GH₵ ${parseFloat(data.stats.confirmedRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            change: '',
            trending: 'up',
            icon: DollarSign
        },
        {
            name: 'Pending Revenue',
            value: `GH₵ ${parseFloat(data.stats.pendingRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            change: '',
            trending: 'up',
            icon: TrendingUp
        },
        {
            name: 'Total Orders',
            value: data.stats.totalOrders,
            change: '',
            trending: 'up',
            icon: ShoppingBag
        },
        {
            name: 'Active Customers',
            value: data.stats.activeCustomers,
            change: '',
            trending: 'up',
            icon: Users
        },
    ];

    return (
        <div className="space-y-10 pb-10 max-w-[1600px] mx-auto">
            {/* Header with Quick Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-100 dark:border-neutral-900 pb-8">
                <div>
                    <h1 className="font-serif text-4xl font-bold text-black dark:text-white mb-2">Overview</h1>
                    <p className="text-neutral-500 font-light max-w-md">
                        A summary of your business performance and real-time activity.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-2 border border-neutral-200 dark:border-neutral-800 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                        <FileDown className="w-3.5 h-3.5" />
                        Export
                    </button>
                    <Link
                        href="/admin/products/upload"
                        className="flex items-center gap-2 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New Product
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-black p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs hover:border-black dark:hover:border-white transition-colors group"
                    >
                        <div className="flex items-center justify-between mb-8 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em]">{stat.name}</p>
                        <p className="text-2xl font-bold text-black dark:text-white mt-2 font-serif tracking-tight">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Overview Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-black p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-lg font-bold text-black dark:text-white font-serif uppercase tracking-wider">Revenue Growth</h2>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Last 7 Days</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 px-3 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-md text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                Live
                            </div>
                        </div>
                    </div>

                    <div className="h-72 w-full flex items-end justify-between gap-3 pt-12 px-2">
                        {data.chartData.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                <div className="w-full flex items-end justify-center h-full relative">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${day.value}%` }}
                                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                                        className="w-full max-w-[24px] bg-neutral-100 dark:bg-neutral-900 group-hover:bg-black dark:group-hover:bg-white rounded-t-sm transition-colors relative"
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[9px] font-black tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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

                {/* Best Sellers Snapshot */}
                <div className="bg-white dark:bg-black p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-black dark:text-white font-serif uppercase tracking-wider">Best Sellers</h2>
                        <TrendingUp className="w-4 h-4 text-neutral-300" />
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-6 pt-2">
                            {data.bestSellers.length > 0 ? (
                                data.bestSellers.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-default">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded flex items-center justify-center text-[10px] font-black group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors">
                                                0{i + 1}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-black dark:text-white uppercase tracking-tight">{item.name}</p>
                                                <p className="text-[9px] font-bold text-neutral-400 mt-0.5 tracking-widest uppercase">{item.sales} sold</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-black dark:text-white">GH₵ {parseFloat(item.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] text-neutral-400 italic">No sales data available yet.</p>
                            )}
                        </div>

                        <Link href="/admin/products" className="block">
                            <button className="w-full py-3 border border-neutral-200 dark:border-neutral-800 rounded-md text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                                Manage Inventory
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white dark:bg-black p-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-2xl font-bold text-black dark:text-white font-serif uppercase tracking-widest">Recent Activity</h2>
                        <div className="h-1 w-12 bg-black dark:bg-white mt-4"></div>
                    </div>
                    <Link href="/admin/orders" className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                        Explore All
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-neutral-100 dark:border-neutral-900">
                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Reference</th>
                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Client</th>
                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Date</th>
                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center">Status</th>
                                <th className="pb-6 text-right text-[10px] font-black uppercase tracking-widest text-neutral-400">Settlement</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900 border-b border-neutral-50 dark:border-neutral-900">
                            {data.recentTransactions.map((order, i) => (
                                <tr key={order.id} className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors">
                                    <td className="py-6 font-bold text-[11px] tracking-tight">{order.id}</td>
                                    <td className="py-6">
                                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-tighter">{order.customer}</span>
                                    </td>
                                    <td className="py-6 text-[11px] text-neutral-400 font-medium">{order.date}</td>
                                    <td className="py-6 text-center">
                                        <span className="text-[9px] font-black uppercase tracking-widest border border-neutral-200 dark:border-neutral-800 px-3 py-1 rounded-sm">
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="py-6 text-right font-bold text-xs">GH₵ {parseFloat(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
