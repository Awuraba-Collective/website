"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createSettlement, updateSettlement, deleteSettlement } from "@/app/actions/settlement-actions";

interface Settlement { id: string; vendor: string; amount: string; date: Date; note: string | null; createdAt: Date; }
interface MonthlyData { month: string; income: number; costPrice: number; settled: number; expenses: number; }
interface FinancialsData {
    income: number;
    totalCostPrice: number;
    totalSettled: number;
    pendingSettlement: number;
    totalProfit: number;
    totalExpenses: number;
    monthly: MonthlyData[];
    settlements: Settlement[];
    orderItemCount: number;
}

function StatCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
    return (
        <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-3 hover:border-black dark:hover:border-white transition-colors group shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">{label}</p>
            <p className={`text-3xl font-serif font-bold tracking-tight ${positive === false ? "text-black dark:text-white" : "text-black dark:text-white"}`}>
                GHS {value}
            </p>
            {sub && <p className="text-xs text-neutral-400">{sub}</p>}
        </div>
    );
}

const emptyForm = () => ({ vendor: "", amount: "", date: new Date().toISOString().split("T")[0], note: "" });

export function FinancialsOverview({ data: initial }: { data: FinancialsData }) {
    const [data, setData] = useState(initial);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm());
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isGrossPositive = data.totalProfit >= 0;

    const openCreate = () => { setEditingId(null); setForm(emptyForm()); setIsDialogOpen(true); };
    const openEdit = (s: Settlement) => {
        setEditingId(s.id);
        setForm({ vendor: s.vendor, amount: s.amount, date: new Date(s.date).toISOString().split("T")[0], note: s.note || "" });
        setIsDialogOpen(true);
    };

    const recalculate = (settlements: Settlement[]) => {
        const totalSettled = settlements.reduce((sum, s) => sum + parseFloat(s.amount), 0);
        const pendingSettlement = Math.max(data.totalCostPrice - totalSettled, 0);
        setData((prev) => ({ ...prev, totalSettled, pendingSettlement, settlements }));
    };

    const handleSave = async () => {
        if (!form.vendor || !form.amount || !form.date) { toast.error("Vendor, amount, and date are required."); return; }
        setIsSaving(true);
        try {
            if (editingId) {
                const res = await updateSettlement(editingId, { vendor: form.vendor, amount: parseFloat(form.amount), date: form.date, note: form.note || undefined });
                if (res.success && res.settlement) {
                    const updated = data.settlements.map((s) => s.id === editingId ? { ...s, ...res.settlement!, date: new Date(form.date), note: form.note || null } : s);
                    recalculate(updated);
                    toast.success("Settlement updated");
                } else { toast.error(res.error || "Failed"); }
            } else {
                const res = await createSettlement({ vendor: form.vendor, amount: parseFloat(form.amount), date: form.date, note: form.note || undefined });
                if (res.success && res.settlement) {
                    const added = [{ ...res.settlement!, date: new Date(form.date), createdAt: new Date(), note: form.note || null } as Settlement, ...data.settlements];
                    recalculate(added);
                    toast.success("Settlement issued");
                } else { toast.error(res.error || "Failed"); }
            }
            setIsDialogOpen(false);
        } finally { setIsSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        const res = await deleteSettlement(deleteId);
        if (res.success) {
            const updated = data.settlements.filter((s) => s.id !== deleteId);
            recalculate(updated);
            toast.success("Settlement deleted");
        } else { toast.error(res.error || "Failed"); }
        setIsDeleting(false);
        setDeleteId(null);
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-black dark:text-white">Financials</h1>
                    <p className="text-neutral-500 mt-1 font-light">Income, settlements, expenses and profit tracking.</p>
                </div>
                <Button onClick={openCreate} className="bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-wider h-10 px-6 gap-2 text-[11px]">
                    <Plus className="w-4 h-4" /> Issue Settlement
                </Button>
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

            {/* Settlement Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Settlement Records</h2>
                    <p className="text-[10px] text-neutral-400 font-medium">
                        Total Settled: <span className="font-black text-black dark:text-white">GHS {data.totalSettled.toFixed(2)}</span>
                    </p>
                </div>
                <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-neutral-400">Vendor</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-neutral-400">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-neutral-400">Note</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-neutral-400 text-right">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-neutral-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                                {data.settlements.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 text-sm italic font-light">
                                            No settlements issued yet. Click "Issue Settlement" to record one.
                                        </td>
                                    </tr>
                                ) : (
                                    data.settlements.map((s, i) => (
                                        <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                            className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-black dark:text-white">{s.vendor}</td>
                                            <td className="px-6 py-4 text-sm text-neutral-500">{new Date(s.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-xs text-neutral-400 italic">{s.note || "—"}</td>
                                            <td className="px-6 py-4 text-right font-black text-sm text-black dark:text-white">
                                                GHS {parseFloat(s.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-black dark:hover:text-white" onClick={() => openEdit(s)}>
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-red-500" onClick={() => setDeleteId(s.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                            {data.settlements.length > 0 && (
                                <tfoot>
                                    <tr className="border-t-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
                                        <td colSpan={3} className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-neutral-400 text-right">Total Settled</td>
                                        <td className="px-6 py-4 text-right font-black text-base text-black dark:text-white">
                                            GHS {data.totalSettled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td />
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>

            {/* Monthly Breakdown */}
            {data.monthly.length > 0 && (
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
                                {data.monthly.map((m) => {
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
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl font-bold">{editingId ? "Edit Settlement" : "Issue Settlement"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-neutral-500">Vendor <span className="text-red-400">*</span></Label>
                            <Input placeholder="e.g. Fabric Supplier Ltd" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} className="h-10" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-neutral-500">Amount (GHS) <span className="text-red-400">*</span></Label>
                                <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-neutral-500">Date <span className="text-red-400">*</span></Label>
                                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-neutral-500">Note (optional)</Label>
                            <Input placeholder="e.g. Invoice #1234" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-10" />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving || !form.vendor || !form.amount} className="bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[10px] h-10 px-6 gap-2">
                            {isSaving ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</> : editingId ? "Save Changes" : "Issue Settlement"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
                <AlertDialogContent className="rounded-2xl border-neutral-200 dark:border-neutral-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-serif text-xl font-bold">Delete Settlement?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-light pt-2">This will remove the settlement record and recalculate pending settlement. This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 pt-4">
                        <AlertDialogCancel className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-8">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-8 bg-black text-white dark:bg-white dark:text-black hover:opacity-90" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
