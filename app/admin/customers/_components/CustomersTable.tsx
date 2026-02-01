"use client";

import { useState, useMemo } from "react";
import {
    Search,
    MessageCircle,
    ShoppingBag,
    ChevronRight,
    TrendingUp,
    Phone,
    Mail,
    Download,
    Filter,
    ArrowUpDown,
    Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminCreateOrderDialog } from "../../orders/_components/AdminCreateOrderDialog";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

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
    orders?: any[]; // For the detail view
}

interface CustomersTableProps {
    customers: Customer[];
}

export function CustomersTable({ customers }: CustomersTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const filteredCustomers = useMemo(() => {
        return customers.filter((customer) => {
            const searchStr = `${customer.firstName} ${customer.lastName} ${customer.whatsappNumber} ${customer.email || ""}`.toLowerCase();
            return searchStr.includes(searchQuery.toLowerCase());
        });
    }, [customers, searchQuery]);

    const selectedCustomer = useMemo(() => {
        return customers.find((c) => c.id === selectedCustomerId);
    }, [customers, selectedCustomerId]);

    const handleWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, "");
        window.open(`https://wa.me/${cleanPhone}`, "_blank");
    };

    const totalRevenue = useMemo(() => {
        return customers.reduce((sum, c) => sum + parseFloat(c.confirmedSpend), 0);
    }, [customers]);

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-black dark:text-white leading-tight">
                        Customers
                    </h1>
                    <p className="text-neutral-500 mt-1 font-light">
                        Track client history, lifetime value, and preferred delivery logistics.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-6 px-4 mr-4 border-r border-neutral-100 dark:border-neutral-800">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">AUDIENCE</p>
                            <p className="text-xl font-serif font-bold italic leading-none">{customers.length}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">REVENUE</p>
                            <p className="text-xl font-serif font-bold italic leading-none text-green-600">
                                GHS {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" className="gap-2 h-10 px-4 text-[11px] font-bold uppercase tracking-widest bg-white dark:bg-black border-neutral-200 dark:border-neutral-800">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="h-10 px-6 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[11px] shadow-sm hover:scale-[1.02] transition-transform"
                    >
                        Quick Add
                    </Button>
                </div>
            </div>

            {/* Filters & Search - Matching Orders Page Structure */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" className="h-10 px-6 text-[11px] font-bold uppercase tracking-widest bg-white dark:bg-black border-neutral-200 dark:border-neutral-800" onClick={() => setSearchQuery("")}>
                        Reset
                    </Button>
                    <Button variant="outline" className="h-10 px-6 gap-2 text-[11px] font-bold uppercase tracking-widest bg-white dark:bg-black border-neutral-200 dark:border-neutral-800">
                        <Filter className="w-4 h-4" />
                        Filters
                    </Button>
                    <Button variant="outline" className="h-10 px-6 gap-2 text-[11px] font-bold uppercase tracking-widest bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 text-nowrap">
                        <ArrowUpDown className="w-4 h-4" />
                        Sort by: Revenue
                    </Button>
                </div>
            </div>

            {/* Premium Table */}
            <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">
                                    Customer Details
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">
                                    Orders
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400 text-right">
                                    Total Spend
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-neutral-500 italic font-light">
                                        No customers found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer, index) => (
                                    <motion.tr
                                        key={customer.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => setSelectedCustomerId(customer.id)}
                                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[11px] font-black text-neutral-500 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all shadow-sm">
                                                    {customer.firstName[0]}{customer.lastName[0]}
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
                                                <span className="text-sm font-black tracking-tight italic font-serif text-black dark:text-white">
                                                    GHS {parseFloat(customer.confirmedSpend).toFixed(2)}
                                                </span>
                                                {parseFloat(customer.pendingSpend) > 0 && (
                                                    <div className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-widest mt-0.5">
                                                        GHS {parseFloat(customer.pendingSpend).toFixed(2)} PENDING
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

                {/* Info Footer */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50/30">
                    <p className="text-[10px] text-neutral-400 font-black tracking-[0.2em] uppercase">
                        Audience: {filteredCustomers.length} / {customers.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 px-4 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-black border-neutral-200 dark:border-neutral-800" disabled>
                            Prev
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-4 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-black border-neutral-200 dark:border-neutral-800">
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Detail Sheet */}
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
                                        <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xl font-serif italic shadow-lg transform -rotate-6">
                                            {selectedCustomer.firstName[0]}
                                        </div>
                                    </div>
                                    <SheetTitle className="font-serif text-5xl italic font-bold tracking-tight leading-none">
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
                                        <Button
                                            className="rounded-full h-11 px-8 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-transform shadow-lg gap-2"
                                            onClick={() => setIsCreateOpen(true)}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Create Order
                                        </Button>
                                    </div>
                                </SheetHeader>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 shadow-sm transition-all hover:shadow-md group">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">Confirmed Spend</p>
                                        <p className="text-3xl font-serif font-bold italic text-green-600">GHS {parseFloat(selectedCustomer.confirmedSpend).toFixed(2)}</p>
                                        <div className="flex items-center gap-1 text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-2">
                                            {selectedCustomer.orderCount} Orders
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 shadow-sm transition-all hover:shadow-md group">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">Pending Capital</p>
                                        <p className="text-3xl font-serif font-bold italic text-amber-600">GHS {parseFloat(selectedCustomer.pendingSpend).toFixed(2)}</p>
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
                                                        <p className="text-sm font-bold font-serif italic">GHS {parseFloat(order.total.toString()).toFixed(2)}</p>
                                                        <p className="text-[9px] text-neutral-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[10px] text-neutral-400 italic">No orders recorded yet.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Logistic Intel */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                                        Delivery Coordinates
                                    </h4>
                                    <div className="p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-4 shadow-sm bg-white dark:bg-black relative overflow-hidden text-[11px]">
                                        <div className="flex flex-col gap-1">
                                            <p className="font-serif italic font-bold text-neutral-800 dark:text-neutral-200">
                                                {selectedCustomer.lastAddress || "No coordinates recorded"}
                                            </p>
                                            <p className="text-neutral-500">
                                                {[selectedCustomer.lastCity, selectedCustomer.lastRegion].filter(Boolean).join(', ') || "—"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* History Footer */}
                                <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center opacity-60">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">Awuraba Collective</p>
                                        <p className="text-[10px] text-neutral-400 italic">ID: {selectedCustomer.id.slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            <AdminCreateOrderDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onOrderCreated={() => {
                    window.location.reload();
                }}
            // We'll need to pass the selected customer to the dialog, but let's first get the basics working
            />
        </div>
    );
}
