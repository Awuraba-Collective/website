"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    Trash2,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    X,
    Edit2,
    Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createExpense, updateExpense, deleteExpense } from "@/app/actions/expense-actions";

interface Expense {
    id: string;
    title: string;
    amount: string;
    category: string;
    date: Date;
    note: string | null;
    createdAt: Date;
}

const CATEGORIES = [
    "General",
    "Shipping & Logistics",
    "Materials & Fabric",
    "Marketing",
    "Packaging",
    "Utilities",
    "Salaries",
    "Equipment",
    "Software",
    "Other",
];

const categoryColors: Record<string, string> = {
    "General": "bg-neutral-100 text-neutral-600",
    "Shipping & Logistics": "bg-blue-100 text-blue-600",
    "Materials & Fabric": "bg-amber-100 text-amber-700",
    "Marketing": "bg-purple-100 text-purple-600",
    "Packaging": "bg-emerald-100 text-emerald-600",
    "Utilities": "bg-orange-100 text-orange-600",
    "Salaries": "bg-rose-100 text-rose-600",
    "Equipment": "bg-indigo-100 text-indigo-600",
    "Software": "bg-cyan-100 text-cyan-600",
    "Other": "bg-neutral-100 text-neutral-500",
};

const emptyForm = () => ({
    title: "",
    amount: "",
    category: "General",
    date: new Date().toISOString().split("T")[0],
    note: "",
});

export function ExpensesTable({ expenses: initialExpenses }: { expenses: Expense[] }) {
    const [expenses, setExpenses] = useState(initialExpenses);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
    const [form, setForm] = useState(emptyForm());
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredExpenses = useMemo(() => {
        return expenses
            .filter((e) => {
                const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.category.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = categoryFilter === "ALL" || e.category === categoryFilter;
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => {
                const aDate = new Date(a.date).getTime();
                const bDate = new Date(b.date).getTime();
                return sortDir === "desc" ? bDate - aDate : aDate - bDate;
            });
    }, [expenses, searchTerm, categoryFilter, sortDir]);

    const totalFiltered = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const openCreate = () => {
        setEditingExpense(null);
        setForm(emptyForm());
        setIsDialogOpen(true);
    };

    const openEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setForm({
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            date: new Date(expense.date).toISOString().split("T")[0],
            note: expense.note || "",
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.amount || !form.date) {
            toast.error("Title, amount, and date are required.");
            return;
        }
        setIsSaving(true);
        try {
            if (editingExpense) {
                const res = await updateExpense(editingExpense.id, {
                    title: form.title,
                    amount: parseFloat(form.amount),
                    category: form.category,
                    date: form.date,
                    note: form.note || undefined,
                });
                if (res.success && res.expense) {
                    setExpenses((prev) =>
                        prev.map((e) => e.id === editingExpense.id ? { ...e, ...res.expense!, date: new Date(form.date), note: form.note || null } : e)
                    );
                    toast.success("Expense updated");
                } else {
                    toast.error(res.error || "Failed to update expense");
                }
            } else {
                const res = await createExpense({
                    title: form.title,
                    amount: parseFloat(form.amount),
                    category: form.category,
                    date: form.date,
                    note: form.note || undefined,
                });
                if (res.success && res.expense) {
                    setExpenses((prev) => [{ ...res.expense!, date: new Date(form.date), createdAt: new Date() } as any, ...prev]);
                    toast.success("Expense added");
                } else {
                    toast.error(res.error || "Failed to create expense");
                }
            }
            setIsDialogOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!expenseToDelete) return;
        setIsDeleting(true);
        const res = await deleteExpense(expenseToDelete.id);
        if (res.success) {
            setExpenses((prev) => prev.filter((e) => e.id !== expenseToDelete.id));
            toast.success("Expense deleted");
        } else {
            toast.error(res.error || "Failed to delete expense");
        }
        setIsDeleting(false);
        setExpenseToDelete(null);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-black dark:text-white">Expenses</h1>
                    <p className="text-neutral-500 mt-1 font-light">Track all business expenditure.</p>
                </div>
                <Button
                    onClick={openCreate}
                    className="bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-wider h-10 px-6 gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Expense
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-9 w-[160px] text-[11px] font-bold uppercase bg-white dark:bg-black border-neutral-200 dark:border-neutral-800">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL" className="text-[11px] font-bold uppercase">All Categories</SelectItem>
                            {CATEGORIES.map((c) => (
                                <SelectItem key={c} value={c} className="text-[11px] font-bold">{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        className="gap-2 h-9 text-[11px] font-bold uppercase tracking-widest"
                        onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                    >
                        {sortDir === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                        Date
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2 h-9 text-[11px] font-bold uppercase tracking-widest"
                        onClick={() => { setSearchTerm(""); setCategoryFilter("ALL"); setSortDir("desc"); }}
                    >
                        <X className="w-3 h-3" /> Reset
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Title</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Category</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Date</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Note</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-neutral-400">
                                            <Receipt className="w-10 h-10 opacity-20" />
                                            <p className="text-sm font-light italic">
                                                {expenses.length === 0 ? "No expenses recorded yet." : "No expenses match your search."}
                                            </p>
                                            {expenses.length === 0 && (
                                                <Button onClick={openCreate} variant="outline" className="mt-2 text-[11px] font-bold uppercase tracking-widest gap-2">
                                                    <Plus className="w-3 h-3" /> Add First Expense
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((expense, index) => (
                                    <motion.tr
                                        key={expense.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-black dark:text-white">{expense.title}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={`text-[10px] font-bold uppercase px-2.5 py-0.5 border-0 shadow-none ${categoryColors[expense.category] || "bg-neutral-100 text-neutral-600"}`}>
                                                {expense.category}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-neutral-500">{new Date(expense.date).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-neutral-400 italic">{expense.note || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-black text-black dark:text-white">
                                                GHS {parseFloat(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-neutral-400 hover:text-black dark:hover:text-white"
                                                    onClick={() => openEdit(expense)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-neutral-400 hover:text-red-500"
                                                    onClick={() => setExpenseToDelete(expense)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                        {filteredExpenses.length > 0 && (
                            <tfoot>
                                <tr className="border-t-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
                                    <td colSpan={4} className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400 text-right">
                                        Total ({filteredExpenses.length} items)
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-base text-black dark:text-white">
                                        GHS {totalFiltered.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl font-bold italic">
                            {editingExpense ? "Edit Expense" : "Add Expense"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-neutral-500">Title <span className="text-red-400">*</span></Label>
                            <Input
                                placeholder="e.g. DHL Shipping Invoice"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="h-10"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-neutral-500">Amount (GHS) <span className="text-red-400">*</span></Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-neutral-500">Date <span className="text-red-400">*</span></Label>
                                <Input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    className="h-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-neutral-500">Category</Label>
                            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                                <SelectTrigger className="h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-neutral-500">Note (optional)</Label>
                            <Input
                                placeholder="Additional details..."
                                value={form.note}
                                onChange={(e) => setForm({ ...form, note: e.target.value })}
                                className="h-10"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[10px] h-10 px-6"
                        >
                            {isSaving ? "Saving..." : editingExpense ? "Save Changes" : "Add Expense"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <AlertDialog open={!!expenseToDelete} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
                <AlertDialogContent className="rounded-2xl border-neutral-200 dark:border-neutral-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-serif text-xl font-bold text-red-600">Delete Expense?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-light pt-2">
                            Are you sure you want to delete <span className="font-bold text-black dark:text-white">"{expenseToDelete?.title}"</span>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 pt-4">
                        <AlertDialogCancel className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-8">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-8 bg-red-600 text-white hover:bg-red-700"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
