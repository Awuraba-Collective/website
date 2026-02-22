'use client'
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Search, Filter, Download, Eye, ChevronLeft, ChevronRight,
  ArrowUpDown, User, MapPin, Phone, CreditCard, Clock, Package,
  AlertCircle, CheckCircle2, MessageSquare, Plus, Trash2, ArrowUp,
  ArrowDown, X, Edit2, Check,
} from "lucide-react";
import type { Order, OrderItem, Payment, OrderEvent, Product } from "@/app/generated/prisma/client";
import { AdminCreateOrderDialog } from "./AdminCreateOrderDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateOrderStatus, deleteOrder, updateOrderItemPrice } from "@/app/actions/order-actions";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusStyles: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-600 border-orange-200",
  CONFIRMED: "bg-blue-100 text-blue-600 border-blue-200",
  PROCESSING: "bg-indigo-100 text-indigo-600 border-indigo-200",
  READY_FOR_DELIVERY: "bg-emerald-100 text-emerald-600 border-emerald-200",
  SHIPPED: "bg-purple-100 text-purple-600 border-purple-200",
  DELIVERED: "bg-green-100 text-green-600 border-green-200",
  CANCELLED: "bg-red-100 text-red-600 border-red-200",
  REFUNDED: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

type OrderWithDetails = Order & {
  items: (OrderItem & { product: Product })[];
  payments: Payment[];
  timeline: OrderEvent[];
  _count: { items: number };
};

interface OrdersTableProps {
  orders: OrderWithDetails[];
}

function PriceEditor({
  itemId, currentPrice, currency,
  onSaved,
}: {
  itemId: string;
  currentPrice: number;
  currency: string;
  onSaved: (newPrice: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(currentPrice.toFixed(2));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed < 0) { toast.error("Invalid price"); return; }
    setSaving(true);
    const res = await updateOrderItemPrice(itemId, parsed);
    setSaving(false);
    if (res.success) {
      onSaved(parsed);
      setEditing(false);
      toast.success("Price updated");
    } else {
      toast.error(res.error || "Failed");
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 justify-end">
        <input
          type="number"
          min="0"
          step="0.01"
          value={val}
          onChange={e => setVal(e.target.value)}
          className="w-20 h-7 px-2 text-xs font-bold border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-right"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        />
        <button onClick={save} disabled={saving} className="h-7 w-7 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded hover:opacity-80 transition-opacity">
          <Check className="w-3 h-3" />
        </button>
        <button onClick={() => setEditing(false)} className="h-7 w-7 flex items-center justify-center border border-neutral-200 dark:border-neutral-800 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 justify-end group/price">
      <span className="text-sm font-black text-black dark:text-white">
        {currency} {(currentPrice).toFixed(2)}
      </span>
      <button
        onClick={() => { setVal(currentPrice.toFixed(2)); setEditing(true); }}
        className="opacity-0 group-hover/price:opacity-100 transition-opacity p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded"
        title="Edit price"
      >
        <Edit2 className="w-3 h-3 text-neutral-400" />
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function OrdersTable({ orders: initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"date" | "total">("date");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<{ id: string; status: any } | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrderWithDetails | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingName.toLowerCase().includes(searchTerm.toLowerCase());
      const orderDate = new Date((order as any).orderDate || order.createdAt);
      const matchesStartDate = startDate ? orderDate >= new Date(startDate) : true;
      const matchesEndDate = endDate ? orderDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999)) : true;
      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
      return matchesSearch && matchesStartDate && matchesEndDate && matchesStatus;
    })
    .sort((a, b) => {
      if (sortField === "date") {
        const aDate = new Date((a as any).orderDate || a.createdAt).getTime();
        const bDate = new Date((b as any).orderDate || b.createdAt).getTime();
        return sortDir === "desc" ? bDate - aDate : aDate - bDate;
      } else {
        return sortDir === "desc" ? Number(b.total) - Number(a.total) : Number(a.total) - Number(b.total);
      }
    });

  const handleUpdateStatus = async (orderId: string, newStatus: any) => {
    setStatusToUpdate({ id: orderId, status: newStatus });
  };

  const confirmStatusUpdate = async () => {
    if (!statusToUpdate) return;
    startTransition(async () => {
      const result = await updateOrderStatus(statusToUpdate.id, statusToUpdate.status);
      if (result.success && result.order) {
        toast.success(`Status updated to ${statusToUpdate.status}`);
        const updatedOrder = result.order as any;
        setOrders(prev => prev.map(o =>
          o.id === statusToUpdate.id
            ? { ...o, status: statusToUpdate.status, timeline: updatedOrder.timeline || o.timeline }
            : o
        ));
        if (selectedOrder?.id === statusToUpdate.id) {
          setSelectedOrder(prev => prev ? { ...prev, status: statusToUpdate.status } : null);
        }
      } else {
        toast.error(result.error || "Failed to update status");
      }
      setStatusToUpdate(null);
    });
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    const result = await deleteOrder(orderToDelete.id);
    if (result.success) {
      toast.success(`Order ${orderToDelete.orderNumber} deleted`);
      setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
      if (selectedOrder?.id === orderToDelete.id) { setIsSheetOpen(false); setSelectedOrder(null); }
    } else {
      toast.error(result.error || "Failed to delete order");
    }
    setIsDeleting(false);
    setOrderToDelete(null);
  };

  const openOrderDetails = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  const toggleSort = () => setSortDir(d => d === "desc" ? "asc" : "desc");

  const handleExport = (ordersToExport: OrderWithDetails[]) => {
    const headers = ["Order Number", "Date", "Customer Name", "Product", "Variant", "Size", "Length", "Qty", "Item Note", "Cost Price (GHS)"];
    const confirmedOrders = ordersToExport.filter(o => o.status === "CONFIRMED");
    if (confirmedOrders.length === 0) { toast.error("No confirmed orders found to export."); return; }
    const rows: string[][] = [];
    confirmedOrders.forEach(order => {
      order.items.forEach(item => {
        rows.push([
          order.orderNumber,
          new Date((order as any).orderDate || order.createdAt).toLocaleDateString(),
          order.shippingName, item.productName, item.variantName,
          item.selectedSize, item.selectedLength, item.quantity.toString(),
          (item.note || "").replace(/"/g, '""'),
          (item.product.costPrice || "0").toString()
        ]);
      });
    });
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `awuraba_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export downloaded");
  };

  const handleShareWhatsApp = (order: OrderWithDetails) => {
    const trackingUrl = `${window.location.origin}/orders/track/${order.orderNumber}`;
    let message = `Hello ${order.shippingName}, your order #${order.orderNumber} from Awuraba has been confirmed!\n\nTrack your order here: ${trackingUrl}\n\nThank you for choosing Awuraba Collective.`;
    if (order.status === 'READY_FOR_DELIVERY') {
      message = `Hello ${order.shippingName}, your order #${order.orderNumber} from Awuraba is ready for delivery! 🥳\n\nPlease confirm your delivery details.\n\nTrack here: ${trackingUrl}`;
    } else if (order.status === 'SHIPPED') {
      message = `Hello ${order.shippingName}, your Awuraba order #${order.orderNumber} has been shipped! 🚚\n\nFollow the delivery: ${trackingUrl}`;
    }
    const cleanPhone = order.shippingPhone.replace(/[\s\-\(\)]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    toast.success("Opening WhatsApp...");
  };

  // Price update handler (optimistic)
  const handleItemPriceUpdate = (itemId: string, newPrice: number) => {
    setSelectedOrder(prev => {
      if (!prev) return prev;
      const updatedItems = prev.items.map(i =>
        i.id === itemId ? { ...i, amountPaid: newPrice as any } : i
      );
      const newSubtotal = updatedItems.reduce((sum, i) => {
        const p = (i as any).amountPaid != null ? Number((i as any).amountPaid) : Number(i.unitPrice);
        return sum + p * i.quantity;
      }, 0);
      const newTotal = newSubtotal + Number(prev.shippingCost) - Number(prev.discount);
      // Also update in the orders list
      setOrders(all => all.map(o => o.id === prev.id ? { ...o, total: newTotal as any } : o));
      return { ...prev, items: updatedItems, subtotal: newSubtotal as any, total: newTotal as any };
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black dark:text-white">Order Management</h1>
          <p className="text-neutral-500 mt-1 font-light">Track and manage all customer orders.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 px-5 gap-2 text-[11px] font-bold uppercase tracking-wider" onClick={() => handleExport(filteredOrders)} disabled={filteredOrders.length === 0}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button className="bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-wider h-10 px-6 gap-2 text-[11px]" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4" /> Create Order
          </Button>
        </div>
      </div>

      <AdminCreateOrderDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onOrderCreated={() => window.location.reload()} />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input type="text" placeholder="Search orders, customers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-1">
            <Clock className="w-3 h-3 text-neutral-400" />
            <input type="date" className="bg-transparent text-xs focus:outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span className="text-neutral-300">-</span>
            <input type="date" className="bg-transparent text-xs focus:outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[140px] text-[11px] font-bold uppercase tracking-wider bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 gap-2">
              <Filter className="w-3 h-3" /><SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-[11px] font-bold uppercase">All Statuses</SelectItem>
              {Object.keys(statusStyles).map(s => (
                <SelectItem key={s} value={s} className="text-[11px] font-bold uppercase">{s.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 text-nowrap h-9 text-[11px] font-bold uppercase tracking-widest" onClick={toggleSort}>
            {sortDir === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
            {sortField === "date" ? "Date" : "Total"}
          </Button>
          <Button variant="outline" className="gap-2 h-9 text-[11px] font-bold uppercase tracking-widest" onClick={() => { setStartDate(""); setEndDate(""); setSearchTerm(""); setStatusFilter("ALL"); setSortDir("desc"); }}>
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
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 cursor-pointer select-none" onClick={() => { setSortField("date"); toggleSort(); }}>
                  <div className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3 opacity-40" /></div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-right cursor-pointer select-none" onClick={() => { setSortField("total"); setSortDir(d => d === "desc" ? "asc" : "desc"); }}>
                  <div className="flex items-center justify-end gap-1">Total <ArrowUpDown className="w-3 h-3 opacity-40" /></div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400 text-sm font-light">
                    {orders.length === 0 ? "No orders yet" : "No orders match your filters"}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group cursor-pointer"
                    onClick={() => openOrderDetails(order)}>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-black dark:text-white uppercase tracking-tight">{order.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-black dark:text-white block">{order.shippingName}</span>
                      <span className="text-xs text-neutral-500">{order._count.items} items</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {new Date((order as any).orderDate || order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${statusStyles[order.status]}`}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-sm text-black dark:text-white">
                      {order.currency} {Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-black dark:hover:text-white" onClick={() => openOrderDetails(order)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-red-500 transition-colors" onClick={() => setOrderToDelete(order)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Select onValueChange={val => handleUpdateStatus(order.id, val)} defaultValue={order.status}>
                          <SelectTrigger className="h-8 w-[130px] text-[10px] font-bold uppercase tracking-wider">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(statusStyles).map(status => (
                              <SelectItem key={status} value={status} className="text-[10px] font-bold uppercase">{status.replace(/_/g, " ")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">
            {filteredOrders.length} of {orders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      {/* ── Order Details Sheet ───────────────────────────────────────── */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full overflow-y-auto bg-white dark:bg-black border-l border-neutral-200 dark:border-neutral-800 p-0">
          {selectedOrder && (
            <>
              {/* Header */}
              <SheetHeader className="p-6 pb-5 border-b border-neutral-100 dark:border-neutral-900">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <SheetTitle className="text-xl font-bold uppercase tracking-tight text-black dark:text-white">
                      {selectedOrder.orderNumber}
                    </SheetTitle>
                    <SheetDescription className="text-[11px] text-neutral-400 font-medium">
                      {new Date((selectedOrder as any).orderDate || selectedOrder.createdAt).toLocaleString()}
                    </SheetDescription>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => { setOrderToDelete(selectedOrder); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${statusStyles[selectedOrder.status]}`}>
                      {selectedOrder.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </SheetHeader>

              <div className="p-6 space-y-8 pb-28">

                {/* Customer */}
                <section className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Customer
                  </h3>
                  <div className="grid grid-cols-2 gap-4 p-5 border border-neutral-100 dark:border-neutral-800 rounded-xl">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">Name</p>
                      <p className="text-sm font-bold">{selectedOrder.shippingName}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">Phone</p>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-neutral-400" />
                        <p className="text-sm font-medium">{selectedOrder.shippingPhone}</p>
                      </div>
                    </div>
                    <div className="col-span-2 space-y-0.5 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                      <p className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">Address</p>
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3 h-3 text-neutral-400 mt-0.5 shrink-0" />
                        <div className="text-sm font-medium leading-snug">
                          <p>{selectedOrder.shippingAddress}</p>
                          <p className="text-neutral-500 text-xs">{selectedOrder.shippingCity}, {selectedOrder.shippingCountry}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Items */}
                <section className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" /> Items
                  </h3>
                  <div className="border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-900">
                          <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-neutral-400">Product</th>
                          <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-neutral-400 text-center">Qty</th>
                          <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-neutral-400 text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900">
                        {selectedOrder.items.map(item => {
                          const paid = (item as any).amountPaid;
                          const unitP = Number(item.unitPrice);
                          const displayPrice = paid != null ? Number(paid) : unitP;
                          const hasDiff = paid != null && Math.abs(Number(paid) - unitP) > 0.01;
                          return (
                            <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                              <td className="px-4 py-3.5">
                                <p className="text-xs font-bold uppercase tracking-tight line-clamp-1 text-black dark:text-white">{item.productName}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.variantName && <span className="text-[9px] font-bold uppercase bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded">{item.variantName}</span>}
                                  {item.selectedSize && <span className="text-[9px] font-bold uppercase bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded">{item.selectedSize}</span>}
                                  {item.selectedLength && <span className="text-[9px] font-bold uppercase bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded">{item.selectedLength}</span>}
                                </div>
                                {item.note && <p className="text-[9px] text-neutral-400 font-light mt-1">{item.note}</p>}
                              </td>
                              <td className="px-4 py-3.5 text-center text-sm font-bold">×{item.quantity}</td>
                              <td className="px-4 py-3.5 text-right">
                                {hasDiff && <p className="text-[9px] text-neutral-400 line-through mb-0.5">list @{unitP.toFixed(2)}</p>}
                                <PriceEditor
                                  itemId={item.id}
                                  currentPrice={displayPrice}
                                  currency={selectedOrder.currency}
                                  onSaved={(newPrice) => handleItemPriceUpdate(item.id, newPrice)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="border-t border-neutral-100 dark:border-neutral-900">
                        <tr>
                          <td colSpan={2} className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-neutral-400 text-right">Subtotal</td>
                          <td className="px-4 py-2.5 text-right text-sm font-bold">{selectedOrder.currency} {Number(selectedOrder.subtotal).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan={2} className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-neutral-400 text-right">Shipping</td>
                          <td className="px-4 py-2.5 text-right text-sm font-bold">{selectedOrder.currency} {Number(selectedOrder.shippingCost).toFixed(2)}</td>
                        </tr>
                        <tr className="border-t-2 border-black dark:border-white">
                          <td colSpan={2} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-right">Total</td>
                          <td className="px-4 py-3 text-right font-black text-base text-black dark:text-white">
                            {selectedOrder.currency} {Number(selectedOrder.total).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </section>

                {/* Payment */}
                <section className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" /> Payment
                  </h3>
                  <div className="grid grid-cols-2 gap-4 p-5 border border-neutral-100 dark:border-neutral-800 rounded-xl">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">Status</p>
                      <div className="flex items-center gap-1.5">
                        {selectedOrder.payments[0]?.status === 'COMPLETED'
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white" />
                          : <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />}
                        <p className="text-xs font-bold uppercase">{selectedOrder.payments[0]?.status || 'NONE'}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">Provider</p>
                      <p className="text-xs font-bold uppercase">{selectedOrder.payments[0]?.provider || 'N/A'}</p>
                      {selectedOrder.payments[0]?.providerRef && (
                        <p className="text-[9px] font-mono text-neutral-400 truncate">{selectedOrder.payments[0].providerRef}</p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Timeline */}
                {selectedOrder.timeline.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> History
                    </h3>
                    <div className="relative pl-5 space-y-5 before:absolute before:left-1.5 before:top-1 before:bottom-1 before:w-px before:bg-neutral-100 dark:before:bg-neutral-800">
                      {selectedOrder.timeline.map((event, idx) => (
                        <div key={event.id} className="relative">
                          <div className={`absolute -left-[18px] top-1 w-2 h-2 rounded-full ${idx === 0 ? 'bg-black dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
                          <div className="flex items-center gap-2">
                            <p className={`text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-black dark:text-white' : 'text-neutral-400'}`}>
                              {event.status.replace(/_/g, ' ')}
                            </p>
                            <span className="text-[9px] text-neutral-400">{new Date(event.createdAt).toLocaleString()}</span>
                          </div>
                          {event.note && <p className="text-xs text-neutral-400 font-light mt-0.5">{event.note}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-900 grid grid-cols-2 items-center gap-3 z-50">
                <Select value={selectedOrder.status} onValueChange={val => handleUpdateStatus(selectedOrder.id, val)}>
                  <SelectTrigger className="flex-1 h-10 text-[10px] font-black uppercase tracking-widest border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-0 w-full">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(statusStyles).map(status => (
                      <SelectItem key={status} value={status} className="text-[10px] font-bold uppercase tracking-widest py-2">{status.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="h-10 px-5 text-[10px] font-black uppercase tracking-widest gap-2 border-neutral-200 dark:border-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                  onClick={() => handleShareWhatsApp(selectedOrder)}>
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Status Update Confirmation */}
      <AlertDialog open={!!statusToUpdate} onOpenChange={open => !open && setStatusToUpdate(null)}>
        <AlertDialogContent className="rounded-2xl border-neutral-200 dark:border-neutral-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl font-bold">Update Order Status?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-light leading-relaxed pt-2">
              Change order <span className="font-bold text-black dark:text-white">#{orders.find(o => o.id === statusToUpdate?.id)?.orderNumber}</span> to <span className="font-black text-black dark:text-white uppercase tracking-widest">{statusToUpdate?.status?.replace(/_/g, " ")}</span>?
              <br /><br />This will be recorded in the order timeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-4">
            <AlertDialogCancel className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-8 border-neutral-200">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-8 bg-black text-white dark:bg-white dark:text-black hover:opacity-90" onClick={confirmStatusUpdate} disabled={isPending}>
              {isPending ? "Updating..." : "Yes, Update"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!orderToDelete} onOpenChange={open => !open && setOrderToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-neutral-200 dark:border-neutral-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl font-bold text-black dark:text-white">Delete Order?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-light leading-relaxed pt-2">
              Permanently delete order <span className="font-bold text-black dark:text-white">#{orderToDelete?.orderNumber}</span>?
              <br /><br /><span className="font-semibold">This cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-4">
            <AlertDialogCancel className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-8 border-neutral-200">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-8 bg-black text-white dark:bg-white dark:text-black hover:opacity-90" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
