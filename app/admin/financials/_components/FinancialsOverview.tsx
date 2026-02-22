"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MonthlyData { month: string; income: number; costPrice: number; settled: number; expenses: number; }
interface FinancialsData {
    income: number;
    totalCostPrice: number;
    totalSettled: number;
    pendingSettlement: number;
    totalProfit: number;
    totalExpenses: number;
    monthly: MonthlyData[];
    orderItemCount: number;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-3 hover:border-black dark:hover:border-white transition-colors shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">{label}</p>
            <p className="text-3xl font-serif font-bold tracking-tight text-black dark:text-white">GHS {value}</p>
            {sub && <p className="text-xs text-neutral-400">{sub}</p>}
        </div>
    );
}

export function FinancialsOverview({ data: initial }: { data: FinancialsData }) {
    const [data] = useState(initial);
    const isGrossPositive = data.totalProfit >= 0;

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="font-serif text-3xl font-bold text-black dark:text-white">Financials</h1>
                <p className="text-neutral-500 mt-1 font-light">Income, expenses and profit tracking.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Income"
                    value={data.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    sub={`From ${data.orderItemCount} item(s) sold`}
                />
                <StatCard
                    label="Pending Settlement"
                    value={data.pendingSettlement.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    sub={`GHS ${data.totalSettled.toFixed(2)} of GHS ${data.totalCostPrice.toFixed(2)} cost settled`}
                />
                <StatCard
                    label="Total Expenses"
                    value={data.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    sub="All recorded expenditure"
                />
                {/* Total Profit */}
                <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-3 hover:border-black dark:hover:border-white transition-colors shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Total Profit</p>
                        {isGrossPositive
                            ? <ArrowUpRight className="w-4 h-4 text-neutral-400" />
                            : <ArrowDownRight className="w-4 h-4 text-neutral-400" />}
                    </div>
                    <p className="text-3xl font-serif font-bold tracking-tight text-black dark:text-white">
                        {isGrossPositive ? "" : "-"}GHS {Math.abs(data.totalProfit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-neutral-400">Income − Cost Price</p>
                </div>
            </div>

            {/* Monthly Breakdown */}

            <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Monthly Breakdown</h2>
                <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400">Month</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400 text-right">Income</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400 text-right">Cost Price</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400 text-right">Settled</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400 text-right">Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                            {data.monthly.length > 0 ? data.monthly.map((m) => {
                                const [year, month] = m.month.split("-");
                                const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleString("default", { month: "long", year: "numeric" });
                                const profit = m.income - m.costPrice;
                                return (
                                    <tr key={m.month} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-black dark:text-white">{label}</td>
                                        <td className="px-6 py-4 text-right text-sm text-black dark:text-white font-medium">{m.income.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-sm text-neutral-500 font-medium">{m.costPrice.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-sm text-neutral-500 font-medium">{m.settled.toFixed(2)}</td>
                                        <td className={`px-6 py-4 text-right text-sm font-black ${profit >= 0 ? "text-black dark:text-white" : "text-neutral-400"}`}>
                                            {profit >= 0 ? "" : "-"}{Math.abs(profit).toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            }) : <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-neutral-500">No data available</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
