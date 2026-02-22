"use client";

import { useState, useMemo } from "react";
import {
    Search,
    MessageCircle,
    Phone,
    Mail,
    Download,
    ArrowUp,
    ArrowDown,
    Plus,
    Users,
    Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createCustomer } from "@/app/actions/customer-actions";

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    whatsappNumber: string;
    email: string | null;
    lastAddress: string | null;
    lastCity: string | null;
    lastRegion: string | null;
    orderCount: number;
    totalSpent: string;
    confirmedSpend: string;
    pendingSpend: string;
    createdAt: Date;
    orders?: any[];
}

interface CustomersTableProps {
    customers: Customer[];
}

const emptyForm = () => ({
    firstName: "",
    lastName: "",
    whatsapp: "",
    address: "",
    city: "",
    region: "",
});

export function CustomersTable({ customers: initialCustomers }: CustomersTableProps) {
    const [customers, setCustomers] = useState(initialCustomers);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<"name" | "orders" | "spend">("spend");
    const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [form, setForm] = useState(emptyForm());
    const [isSaving, setIsSaving] = useState(false);

    const filteredCustomers = useMemo(() => {
        return customers
            .filter((customer) => {
                const searchStr = `${customer.firstName} ${customer.lastName} ${customer.whatsappNumber} ${customer.email || ""}`.toLowerCase();
                return searchStr.includes(searchQuery.toLowerCase());
            })
            .sort((a, b) => {
                if (sortField === "name") {
                    const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
                    const bName = `${b.firstName} ${b.lastName}`.toLowerCase();
                    return sortDir === "asc" ? aName.localeCompare(bName) : bName.localeCompare(aName);
                }
                if (sortField === "orders") {
                    return sortDir === "desc" ? b.orderCount - a.orderCount : a.orderCount - b.orderCount;
                }
                // spend
                const aSpend = parseFloat(a.confirmedSpend);
                const bSpend = parseFloat(b.confirmedSpend);
                return sortDir === "desc" ? bSpend - aSpend : aSpend - bSpend;
            });
    }, [customers, searchQuery, sortField, sortDir]);

    const selectedCustomer = useMemo(() => {
        return customers.find((c) => c.id === selectedCustomerId);
    }, [customers, selectedCustomerId]);

    const handleWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, "");
        window.open(`https://wa.me/${cleanPhone}`, "_blank");
    };

    const toggleSort = (field: "name" | "orders" | "spend") => {
        if (sortField === field) {
            setSortDir((d) => (d === "desc" ? "asc" : "desc"));
        } else {
            setSortField(field);
            setSortDir("desc");
        }
    };

    const handleAddCustomer = async () => {
        if (!form.whatsapp) {
            toast.error("WhatsApp number is required.");
            return;
        }
        setIsSaving(true);
        const res = await createCustomer({
            firstName: form.firstName || "Customer",
            lastName: form.lastName,
            whatsapp: form.whatsapp,
            address: form.address || undefined,
            city: form.city || undefined,
            region: form.region || undefined,
        });
        setIsSaving(false);
        if (res.success && res.customer) {
            const newCustomer = {
                ...res.customer,
                confirmedSpend: "0",
                pendingSpend: "0",
                totalSpent: "0",
                orders: [],
            } as Customer;
            setCustomers((prev) => [newCustomer, ...prev]);
            toast.success("Customer added successfully.");
            setIsAddOpen(false);
            setForm(emptyForm());
        } else {
            toast.error(res.error || "Failed to add customer.");
        }
    };

    const SortIcon = ({ field }: { field: "name" | "orders" | "spend" }) => {
        if (sortField !== field) return null;
        return sortDir === "desc" ? <ArrowDown className="w-3 h-3 inline ml-1" /> : <ArrowUp className="w-3 h-3 inline ml-1" />;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-black dark:text-white leading-tight">
                        Customers
                    </h1>
                    <p className="text-neutral-500 mt-1 font-light">
                        Track customer history, lifetime value, and delivery logistics.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="h-10 px-6 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[11px] shadow-sm hover:scale-[1.02] transition-transform gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Customer
                    </Button>
                </div>
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        className={`h-10 px-4 text-[11px] font-bold uppercase tracking-widest bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 gap-1 ${sortField === "name" ? "border-black dark:border-white" : ""}`}
                        onClick={() => toggleSort("name")}
                    >
                        Name <SortIcon field="name" />
                    </Button>
                    <Button
                        variant="outline"
                        className={`h-10 px-4 text-[11px] font-bold uppercase tracking-widest bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 gap-1 ${sortField === "orders" ? "border-black dark:border-white" : ""}`}
                        onClick={() => toggleSort("orders")}
                    >
                        Orders <SortIcon field="orders" />
                    </Button>
                    <Button
                        variant="outline"
                        className={`h-10 px-4 text-[11px] font-bold uppercase tracking-widest bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 gap-1 ${sortField === "spend" ? "border-black dark:border-white" : ""}`}
                        onClick={() => toggleSort("spend")}
                    >
                        Spend <SortIcon field="spend" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-10 px-4 text-[11px] font-bold uppercase tracking-widest bg-white dark:bg-black border-neutral-200 dark:border-neutral-800"
                        onClick={() => { setSearchQuery(""); setSortField("spend"); setSortDir("desc"); }}
                    >
                        Reset
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                                <th
                                    className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400 cursor-pointer select-none"
                                    onClick={() => toggleSort("name")}
                                >
                                    Customer Details <SortIcon field="name" />
                                </th>
                                <th
                                    className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400 cursor-pointer select-none"
                                    onClick={() => toggleSort("orders")}
                                >
                                    Orders <SortIcon field="orders" />
                                </th>
                                <th
                                    className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400 text-right cursor-pointer select-none"
                                    onClick={() => toggleSort("spend")}
                                >
                                    Total Spend <SortIcon field="spend" />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-neutral-400">
                                            <Users className="w-10 h-10 opacity-20" />
                                            <p className="text-sm font-light">No customers found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer, index) => (
                                    <motion.tr
                                        key={customer.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        onClick={() => setSelectedCustomerId(customer.id)}
                                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[11px] font-black text-neutral-500 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all shadow-sm">
                                                    {(customer.firstName[0] || "?")}
                                                    {(customer.lastName[0] || "")}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-black dark:text-white leading-tight tracking-tight">
                                                        {customer.firstName} {customer.lastName}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1 leading-none">
                                                            <Phone className="w-2.5 h-2.5 opacity-50" />
                                                            {customer.whatsappNumber}
                                                        </span>
                                                        {customer.email && (
                                                            <span className="text-[10px] text-neutral-300 font-medium flex items-center gap-1 border-l border-neutral-100 dark:border-neutral-800 pl-2 leading-none">
                                                                <Mail className="w-2.5 h-2.5 opacity-50" />
                                                                {customer.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[10px] font-black border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 uppercase tracking-tighter">
                                                {customer.orderCount} Orders
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="inline-flex flex-col items-end">
                                                <span className="text-sm font-black tracking-tight text-black dark:text-white">
                                                    GHS {parseFloat(customer.confirmedSpend).toFixed(2)}
                                                </span>
                                                {parseFloat(customer.pendingSpend) > 0 && (
                                                    <div className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-widest mt-0.5">
                                                        GHS {parseFloat(customer.pendingSpend).toFixed(2)} pending
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50/30">
                    <p className="text-[10px] text-neutral-400 font-black tracking-[0.2em] uppercase">
                        {filteredCustomers.length} of {customers.length} customers
                    </p>
                </div>
            </div>

            {/* Customer Detail Sheet */}
            <Sheet open={!!selectedCustomerId} onOpenChange={(open) => !open && setSelectedCustomerId(null)}>
                <SheetContent className="w-full sm:max-w-xl bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 p-0 overflow-hidden flex flex-col shadow-2xl">
                    {selectedCustomer && (
                        <>
                            <div className="p-8 pb-0">
                                <SheetHeader className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="rounded-full border-neutral-200 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-neutral-50 mb-4">
                                            Customer Account
                                        </Badge>
                                        <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-base font-bold shadow-sm">
                                            {selectedCustomer.firstName[0]}
                                        </div>
                                    </div>
                                    <SheetTitle className="font-serif text-4xl font-bold tracking-tight leading-none">
                                        {selectedCustomer.firstName} <br />
                                        <span className="text-neutral-300 font-light">{selectedCustomer.lastName}</span>
                                    </SheetTitle>

                                    <div className="flex flex-wrap gap-3 pt-6">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full h-11 px-8 text-[11px] font-black uppercase tracking-widest gap-2 border-neutral-200 dark:border-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm"
                                            onClick={() => handleWhatsApp(selectedCustomer.whatsappNumber)}
                                        >
                                            <MessageCircle className="w-4 h-4 text-green-500" />
                                            WhatsApp
                                        </Button>
                                    </div>
                                </SheetHeader>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-10">
                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 shadow-sm">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">Confirmed Spend</p>
                                        <p className="text-3xl font-bold text-black dark:text-white">GHS {parseFloat(selectedCustomer.confirmedSpend).toFixed(2)}</p>
                                        <div className="flex items-center gap-1 text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-2">
                                            {selectedCustomer.orderCount} Orders
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 shadow-sm">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">Pending Capital</p>
                                        <p className="text-3xl font-bold text-black dark:text-white">GHS {parseFloat(selectedCustomer.pendingSpend).toFixed(2)}</p>
                                    </div>
                                </div>

                                {/* Order History */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                                        Order History
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                                            selectedCustomer.orders.slice(0, 5).map((order) => (
                                                <div key={order.id} className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">#{order.orderNumber}</p>
                                                        <p className="text-xs font-bold mt-1 uppercase tracking-tighter">{order.status.replace(/_/g, ' ')}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold">GHS {parseFloat(order.total.toString()).toFixed(2)}</p>
                                                        <p className="text-[9px] text-neutral-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[10px] text-neutral-400 font-light">No orders recorded yet.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                                        Delivery Address
                                    </h4>
                                    <div className="p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-1 bg-white dark:bg-black text-[11px]">
                                        <p className="font-bold text-neutral-800 dark:text-neutral-200">
                                            {selectedCustomer.lastAddress || "No address recorded"}
                                        </p>
                                        <p className="text-neutral-500">
                                            {[selectedCustomer.lastCity, selectedCustomer.lastRegion].filter(Boolean).join(", ") || "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 opacity-60">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">Awuraba Collective</p>
                                    <p className="text-[10px] text-neutral-400">ID: {selectedCustomer.id.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* Add Customer Dialog */}
            <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) setForm(emptyForm()); }}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl font-bold">Add Customer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-neutral-500">
                                    First Name <span className="text-neutral-300 normal-case">(optional)</span>
                                </Label>
                                <Input
                                    placeholder="Customer"
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-neutral-500">
                                    Last Name <span className="text-neutral-300 normal-case">(optional)</span>
                                </Label>
                                <Input
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                    className="h-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-neutral-500">
                                WhatsApp Number <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                placeholder="e.g. 23354XXXXXXX"
                                value={form.whatsapp}
                                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                                className="h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-neutral-500">Address <span className="text-neutral-300 normal-case">(optional)</span></Label>
                            <Input
                                placeholder="Street address"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="h-10"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-neutral-500">City</Label>
                                <Input
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-neutral-500">Region</Label>
                                <Input
                                    value={form.region}
                                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                                    className="h-10"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsAddOpen(false)}
                            className="font-bold uppercase tracking-widest text-[10px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddCustomer}
                            disabled={isSaving || !form.whatsapp}
                            className="bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[10px] h-10 px-6 gap-2"
                        >
                            {isSaving ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</> : "Add Customer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
