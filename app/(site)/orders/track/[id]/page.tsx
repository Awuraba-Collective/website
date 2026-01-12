import { prisma } from "@/lib/database";
import { notFound } from "next/navigation";
import {
    Package,
    Clock,
    MapPin,
    CheckCircle2,
    ChevronRight,
    ShieldCheck,
    Truck,
    Box,
    Home,
    XCircle,
    RotateCcw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const baseSteps = [
    { status: "PENDING", label: "Order Received", icon: Package, description: "We've got your order and are preparing to confirm payment." },
    { status: "CONFIRMED", label: "Confirmed", icon: ShieldCheck, description: "Payment verified. Your pieces are entering production." },
    { status: "PROCESSING", label: "In Production", icon: Box, description: "Our artisans are crafting your order with care." },
    { status: "READY_FOR_DELIVERY", label: "Ready for Delivery", icon: CheckCircle2, description: "Your pieces are crafted and ready to be dispatched!" },
    { status: "SHIPPED", label: "On The Way", icon: Truck, description: "Your order has been dispatched and is currently in transit." },
    { status: "DELIVERED", label: "Delivered", icon: Home, description: "Package successfully delivered. Enjoy your Awuraba pieces!" },
];

const cancelledNoPaymentSteps = [
    { status: "PENDING", label: "Order Received", icon: Package, description: "Order was received." },
    { status: "CANCELLED", label: "Cancelled", icon: XCircle, description: "This order has been cancelled." },
];

const cancelledWithPaymentSteps = [
    { status: "PENDING", label: "Order Received", icon: Package, description: "Order was received." },
    { status: "CONFIRMED", label: "Confirmed", icon: ShieldCheck, description: "Payment was confirmed." },
    { status: "CANCELLED", label: "Cancelled", icon: XCircle, description: "The order was cancelled after payment." },
    { status: "REFUNDED", label: "Refunded", icon: RotateCcw, description: "A refund has been processed for this order." },
];

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const order = await prisma.order.findFirst({
        where: {
            OR: [
                { id: id },
                { orderNumber: id }
            ]
        },
        include: {
            items: true,
            payments: true,
            timeline: {
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!order) {
        notFound();
    }

    // Determine which journey to show
    let journeySteps = baseSteps;
    const hasPayment = order.payments.some(p => p.status === 'COMPLETED');

    if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
        journeySteps = hasPayment ? cancelledWithPaymentSteps : cancelledNoPaymentSteps;
    }

    const currentStatusIndex = journeySteps.findIndex(step => step.status === order.status);
    // If status is REFUNDED but we are using cancelledWithPaymentSteps, it will be the last step.
    // We handle specific status mapping if needed.
    const displayStatusIndex = currentStatusIndex === -1 ? (order.status === 'REFUNDED' ? journeySteps.length - 1 : 0) : currentStatusIndex;

    return (
        <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 pt-32 pb-20 px-4 transition-colors duration-500">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header section */}
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-100 dark:border-neutral-800 shadow-sm transition-all overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05]">
                        <Package className="w-32 h-32" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Track Order</p>
                                <h1 className="text-3xl font-serif font-black uppercase tracking-tight text-black dark:text-white">
                                    #{order.orderNumber}
                                </h1>
                            </div>
                            {/* Status Badge Removed as requested */}
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Order Date</p>
                                <p className="text-sm font-bold">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Items Count</p>
                                <p className="text-sm font-bold">{order.items.length} Products</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Journey Status */}
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-100 dark:border-neutral-800 shadow-sm">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-10">Journey Status</h2>

                    <div className="relative space-y-8">
                        {journeySteps.map((step, idx) => {
                            const isCompleted = idx <= displayStatusIndex;
                            const isCurrent = idx === displayStatusIndex;
                            const StatusIcon = step.icon;

                            return (
                                <div key={step.status} className="flex gap-6 relative group transition-all">
                                    {/* Line connector */}
                                    {idx !== journeySteps.length - 1 && (
                                        <div className={`absolute left-3.5 top-8 w-[1px] h-12 transition-colors duration-500 ${isCompleted && !isCurrent ? 'bg-black dark:bg-white' : 'bg-neutral-100 dark:bg-neutral-800'}`} />
                                    )}

                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 z-10 ${isCompleted
                                        ? 'bg-black dark:bg-white border-black dark:border-white shadow-lg'
                                        : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800'
                                        }`}>
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-white dark:text-black" />
                                        ) : (
                                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                                        )}
                                    </div>

                                    <div className="space-y-1 pb-4">
                                        <p className={`text-sm font-black uppercase tracking-tight transition-colors ${isCompleted ? 'text-black dark:text-white' : 'text-neutral-300'}`}>
                                            {step.label}
                                        </p>
                                        <p className={`text-xs leading-relaxed transition-colors ${isCompleted ? 'text-neutral-500' : 'text-neutral-300'}`}>
                                            {step.description}
                                        </p>
                                        {isCurrent && (
                                            <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                                                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white border-black dark:border-white">
                                                    Current Stage
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Summary & Mini Receipt */}
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-100 dark:border-neutral-800 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Order Summary</h2>
                        <Package className="w-4 h-4 text-neutral-200" />
                    </div>

                    <div className="space-y-6">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-start group">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-black dark:text-white uppercase tracking-tight">{item.productName}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{item.variantName}</span>
                                        <div className="w-1 h-1 rounded-full bg-neutral-200" />
                                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{item.selectedSize}</span>
                                        <div className="w-1 h-1 rounded-full bg-neutral-200" />
                                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{item.quantity} x {order.currency} {Number(item.unitPrice).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-black dark:text-white">{order.currency} {Number(item.totalPrice).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-neutral-50 dark:border-neutral-800 space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                            <span>Subtotal</span>
                            <span>{order.currency} {Number(order.subtotal).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                            <span>Shipping</span>
                            <span>{order.currency} {Number(order.shippingCost).toLocaleString()}</span>
                        </div>
                        {Number(order.discount) > 0 && (
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-green-600">
                                <span>Discount</span>
                                <span>-{order.currency} {Number(order.discount).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-3 border-t border-neutral-50 dark:border-neutral-800">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white">Total Paid</span>
                            <span className="text-lg font-serif font-black text-black dark:text-white underline decoration-black/10 underline-offset-8 decoration-2">{order.currency} {Number(order.total).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-neutral-400">
                                <MapPin className="w-3.5 h-3.5" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Delivery Destination</p>
                            </div>
                            <div className="space-y-1.5 pl-5 border-l border-neutral-100 dark:border-neutral-800">
                                <p className="text-sm font-bold text-black dark:text-white leading-relaxed">{order.shippingAddress}</p>
                                <p className="text-xs text-neutral-500">{order.shippingCity}, {order.shippingCountry}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-neutral-400">
                                <Clock className="w-3.5 h-3.5" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Need Help?</p>
                            </div>
                            <div className="space-y-3 pl-5 border-l border-neutral-100 dark:border-neutral-800">
                                <p className="text-xs text-neutral-500 leading-relaxed">Reach out to our team if you have any questions about your order.</p>
                                <a
                                    href="https://wa.me/233246231998"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black dark:text-white hover:underline underline-offset-4"
                                >
                                    Contact Support <ChevronRight className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer info */}
                <div className="text-center space-y-4 px-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300">Awuraba Collective</p>
                    <p className="text-[9px] text-neutral-400 leading-relaxed max-w-sm mx-auto italic">
                        Your tracking link is private. Please do not share this URL with anyone outside your trusted circle.
                    </p>
                </div>
            </div>
        </div>
    );
}
