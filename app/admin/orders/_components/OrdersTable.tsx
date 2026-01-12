'use client'
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Clock,
  Package,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  ExternalLink,
  Plus,
} from "lucide-react";
import type { Order, OrderItem, Payment, OrderEvent, Product } from "@/app/generated/prisma/client";
import { AdminCreateOrderDialog } from "./AdminCreateOrderDialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateOrderStatus } from "@/app/actions/order-actions";
import { toast } from "sonner";
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

export function OrdersTable({ orders: initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<{ id: string; status: any } | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingName.toLowerCase().includes(searchTerm.toLowerCase());

    const orderDate = new Date(order.createdAt);
    const matchesStartDate = startDate ? orderDate >= new Date(startDate) : true;
    const matchesEndDate = endDate ? orderDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999)) : true;

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: any) => {
    setStatusToUpdate({ id: orderId, status: newStatus });
  };

  const confirmStatusUpdate = async () => {
    if (!statusToUpdate) return;

    startTransition(async () => {
      const result = await updateOrderStatus(statusToUpdate.id, statusToUpdate.status);
      if (result.success && result.order) {
        toast.success(`Order status updated to ${statusToUpdate.status}`);

        // Timeline info is updated in the database but we locally update current view
        const updatedOrder = result.order as any;

        // Update local state
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

  const openOrderDetails = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  const handleExport = (ordersToExport: OrderWithDetails[]) => {
    const headers = [
      "Order Number",
      "Date",
      "Customer Name",
      "Product",
      "Variant",
      "Size",
      "Length",
      "Qty",
      "Item Note",
      "Cost Price (GHS)"
    ];

    const confirmedOrders = ordersToExport.filter(o => o.status === "CONFIRMED");

    if (confirmedOrders.length === 0) {
      toast.error("No confirmed orders found in the selected range to export.");
      return;
    }

    const rows: string[][] = [];

    confirmedOrders.forEach(order => {
      order.items.forEach(item => {
        rows.push([
          order.orderNumber,
          new Date(order.createdAt).toLocaleDateString(),
          order.shippingName,
          item.productName,
          item.variantName,
          item.selectedSize,
          item.selectedLength,
          item.quantity.toString(),
          (item.note || "").replace(/"/g, '""'),
          (item.product.costPrice || "0").toString()
        ]);
      });
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `awuraba_vendors_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Vendor export file downloaded");
  };

  const handleShareWhatsApp = (order: OrderWithDetails) => {
    const trackingUrl = `${window.location.origin}/orders/track/${order.orderNumber}`;

    let message = `Hello ${order.shippingName}, your order #${order.orderNumber} from Awuraba has been confirmed! 

You can track your order's journey here: ${trackingUrl}

Thank you for choosing Awuraba Collective.`;

    if (order.status === 'READY_FOR_DELIVERY') {
      message = `Hello ${order.shippingName}, your order #${order.orderNumber} from Awuraba is ready for delivery! 🥳

We're all set to ship your pieces. Please confirm your delivery/shipping details (address and contact number) so we can dispatch it to you as soon as possible.

Track your journey here: ${trackingUrl}`;
    } else if (order.status === 'SHIPPED') {
      message = `Hello ${order.shippingName}, great news! Your Awuraba order #${order.orderNumber} has been sent out! 🚚

Please let us know once you receive the package. We'd love to hear your feedback, and feel free to tag us in your beautiful pieces on social media! ✨

Follow the delivery here: ${trackingUrl}`;
    }

    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = order.shippingPhone.replace(/[\s\-\(\)]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    toast.success("Opening WhatsApp...");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-black dark:text-white">
            Order Management
          </h1>
          <p className="text-neutral-500 mt-1 font-light">
            Track and manage all customer orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleExport(filteredOrders)}
            disabled={filteredOrders.length === 0}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            className="bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-wider h-10 px-6 gap-2"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Create Order
          </Button>
        </div>
      </div>

      <AdminCreateOrderDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onOrderCreated={() => {
          // Optional: Refresh data if needed, but since it's a server action, 
          // the page might need a refresh or the state needs to be updated.
          window.location.reload();
        }}
      />

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search orders, customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-1">
            <Clock className="w-3 h-3 text-neutral-400" />
            <input
              type="date"
              className="bg-transparent text-xs focus:outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-neutral-300">-</span>
            <input
              type="date"
              className="bg-transparent text-xs focus:outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={() => { setStartDate(""); setEndDate(""); setSearchTerm(""); }}>
            Reset
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button variant="outline" className="gap-2 text-nowrap">
            <ArrowUpDown className="w-4 h-4" />
            Sort by: Date
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Order ID
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">
                  Total
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-neutral-500"
                  >
                    {orders.length === 0
                      ? "No orders yet"
                      : "No orders match your search"}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group cursor-pointer"
                    onClick={() => openOrderDetails(order)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-black dark:text-white uppercase tracking-tight">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-black dark:text-white">
                          {order.shippingName}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {order._count.items} Items
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${statusStyles[order.status]}`}
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-sm text-black dark:text-white">
                      {order.currency} {Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 outline-none" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                          onClick={() => openOrderDetails(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Select
                          onValueChange={(val) => handleUpdateStatus(order.id, val)}
                          defaultValue={order.status}
                        >
                          <SelectTrigger className="h-8 w-[130px] text-[10px] font-bold uppercase tracking-wider">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(statusStyles).map((status) => (
                              <SelectItem key={status} value={status} className="text-[10px] font-bold uppercase">
                                {status}
                              </SelectItem>
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

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900">
          <p className="text-xs text-neutral-500 tracking-wide font-medium">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Order Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 p-0">
          <SheetHeader className="p-6 border-b border-neutral-100 dark:border-neutral-900">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <SheetTitle className="text-2xl font-serif font-bold uppercase tracking-tight">
                  Order {selectedOrder?.orderNumber}
                </SheetTitle>
                <SheetDescription className="text-sm font-light">
                  Placed on {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString()}
                </SheetDescription>
              </div>
              <Badge className={`px-3 py-1 text-[11px] font-black uppercase tracking-widest border shadow-none ${selectedOrder ? statusStyles[selectedOrder.status] : ''}`}>
                {selectedOrder?.status}
              </Badge>
            </div>
          </SheetHeader>

          <div className="p-8 space-y-10 pb-20">
            {/* Customer & Shipping Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-neutral-400 group">
                <User className="w-4 h-4 transition-colors group-hover:text-black dark:group-hover:text-white" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors">Customer & Shipping</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-neutral-50 dark:bg-neutral-900/30 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-900">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Full Name</p>
                    <p className="text-sm font-semibold">{selectedOrder?.shippingName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Contact</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3 h-3 text-neutral-400" />
                        <span>{selectedOrder?.shippingPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 border-l border-white dark:border-neutral-800 pl-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Address</p>
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      <div className="text-sm leading-relaxed font-medium">
                        <p>{selectedOrder?.shippingAddress}</p>
                        <p className="text-neutral-500">{selectedOrder?.shippingCity}, {selectedOrder?.shippingCountry}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Order Items Table */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-neutral-400 group">
                <Package className="w-4 h-4 transition-colors group-hover:text-black dark:group-hover:text-white" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors">Order Items</h3>
              </div>
              <div className="border border-neutral-100 dark:border-neutral-900 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-900">
                      <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-400">PRODUCT</th>
                      <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center">QTY</th>
                      <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-right">PRICE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900">
                    {selectedOrder?.items.map((item) => (
                      <tr key={item.id} className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="space-y-1.5">
                            <p className="text-sm font-bold text-black dark:text-white uppercase tracking-tight line-clamp-1">{item.productName}</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="bg-neutral-100 dark:bg-neutral-800 text-[9px] font-bold uppercase px-2 shadow-none border-none">{item.variantName}</Badge>
                              <Badge variant="secondary" className="bg-neutral-100 dark:bg-neutral-800 text-[9px] font-bold uppercase px-2 shadow-none border-none">{item.selectedSize}</Badge>
                              <Badge variant="secondary" className="bg-neutral-100 dark:bg-neutral-800 text-[9px] font-bold uppercase px-2 shadow-none border-none">{item.selectedLength}</Badge>
                            </div>
                            {item.note && (
                              <div className="mt-2 text-[10px] bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg text-neutral-500">
                                <span className="font-bold uppercase tracking-wider block mb-1">Customer Note</span>
                                {item.note}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">x{item.quantity}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="text-sm font-black">{selectedOrder.currency} {Number(item.totalPrice).toFixed(2)}</p>
                          <p className="text-[10px] text-neutral-400 font-medium">@{Number(item.unitPrice).toFixed(2)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-neutral-50/50 dark:bg-neutral-900/50">
                      <td colSpan={2} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-right">SUBTOTAL</td>
                      <td className="px-5 py-3 text-right font-bold text-sm tracking-tight italic">{selectedOrder?.currency} {Number(selectedOrder?.subtotal).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-right">SHIPPING</td>
                      <td className="px-5 py-3 text-right font-bold text-sm tracking-tight italic">{selectedOrder?.currency} {Number(selectedOrder?.shippingCost).toFixed(2)}</td>
                    </tr>
                    <tr className="border-t-2 border-black dark:border-white">
                      <td colSpan={2} className="px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-black dark:text-white text-right">TOTAL</td>
                      <td className="px-5 py-4 text-right font-black text-lg shadow-sm">{selectedOrder?.currency} {Number(selectedOrder?.total).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* Payment Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-neutral-400 group">
                <CreditCard className="w-4 h-4 transition-colors group-hover:text-black dark:group-hover:text-white" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors">Payment Information</h3>
              </div>
              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-2xl shadow-sm grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</p>
                  <div className="flex items-center gap-2">
                    {selectedOrder?.payments[0]?.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                    <p className="text-sm font-bold uppercase tracking-tight">{selectedOrder?.payments[0]?.status || 'NO PAYMENT RECORD'}</p>
                  </div>
                </div>
                <div className="space-y-1 border-l border-neutral-100 dark:border-neutral-800 pl-8">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Provider & Ref</p>
                  <p className="text-sm font-semibold uppercase">{selectedOrder?.payments[0]?.provider || 'N/A'}</p>
                  <p className="text-[10px] font-mono text-neutral-500 truncate">{selectedOrder?.payments[0]?.providerRef || 'NO REFERENCE'}</p>
                </div>
              </div>
            </section>

            {/* Timeline Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-neutral-400 group">
                <Clock className="w-4 h-4 transition-colors group-hover:text-black dark:group-hover:text-white" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors">Order History</h3>
              </div>
              <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-neutral-100 dark:before:bg-neutral-800">
                {selectedOrder?.timeline.map((event, idx) => (
                  <div key={event.id} className="relative">
                    <div className={`absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-neutral-950 shadow-sm ${idx === 0 ? 'bg-black dark:bg-white scale-125' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-black dark:text-white' : 'text-neutral-400'}`}>
                          {event.status}
                        </p>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 font-light leading-relaxed">
                        {event.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="sticky bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between gap-4 z-50 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex-grow">
              <Select
                value={selectedOrder?.status}
                onValueChange={(val) => handleUpdateStatus(selectedOrder!.id, val)}
              >
                <SelectTrigger className="w-full h-12 text-xs font-bold uppercase tracking-widest bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl shadow-none focus:ring-0">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-neutral-200 dark:border-neutral-800">
                  {Object.keys(statusStyles).map((status) => (
                    <SelectItem key={status} value={status} className="text-xs font-bold uppercase tracking-widest py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-12 px-6 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800 gap-2 border-green-50 text-green-600 hover:text-green-700 hover:border-green-100"
                onClick={() => selectedOrder && handleShareWhatsApp(selectedOrder)}
              >
                <MessageSquare className="w-4 h-4" />
                Share Tracking
              </Button>
              <Button
                variant="outline"
                className="h-12 px-6 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800 gap-2"
                onClick={() => selectedOrder && handleExport([selectedOrder])}
              >
                <Download className="w-4 h-4" />
                Export Manifest
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Status Update Confirmation */}
      <AlertDialog
        open={!!statusToUpdate}
        onOpenChange={(open) => !open && setStatusToUpdate(null)}
      >
        <AlertDialogContent className="rounded-2xl border-neutral-200 dark:border-neutral-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl font-bold ">Update Order Status?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-light leading-relaxed pt-2">
              Are you sure you want to change the status of order <span className="font-bold text-black dark:text-white uppercase tracking-tight">#{orders.find(o => o.id === statusToUpdate?.id)?.orderNumber}</span> to <span className="font-black text-black dark:text-white uppercase tracking-widest">{statusToUpdate?.status}</span>?
              <br /><br />
              This will be recorded in the order timeline and may notify the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-4">
            <AlertDialogCancel className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-8 border-neutral-200">Wait, Go Back</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-8 bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
              onClick={confirmStatusUpdate}
              disabled={isPending}
            >
              {isPending ? "Updating..." : "Yes, Update Status"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
