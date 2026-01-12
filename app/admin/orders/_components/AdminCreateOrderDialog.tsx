"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Search,
    Plus,
    Trash2,
    Check,
    ChevronRight,
    UserPlus,
    Package,
    Loader2,
} from "lucide-react";
import { searchProductsForOrder } from "@/app/actions/product-actions";
import { getCustomers } from "@/app/actions/customer-actions";
import { createOrder } from "@/app/actions/order-actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Length } from "@/app/generated/prisma";
import { motion, AnimatePresence } from "framer-motion";

interface AdminCreateOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onOrderCreated?: () => void;
}

export function AdminCreateOrderDialog({
    open,
    onOpenChange,
    onOrderCreated,
}: AdminCreateOrderDialogProps) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Customer State
    const [customers, setCustomers] = useState<any[]>([]);
    const [customerSearch, setCustomerSearch] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
    const [newCustomer, setNewCustomer] = useState({
        firstName: "",
        lastName: "",
        whatsapp: "",
        address: "",
        city: "",
        region: "",
    });

    // Product State
    const [productSearch, setProductSearch] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearchingProducts, setIsSearchingProducts] = useState(false);
    const [orderItems, setOrderItems] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            loadCustomers();
        } else {
            resetForm();
        }
    }, [open]);

    const loadCustomers = async () => {
        const data = await getCustomers();
        setCustomers(data);
    };

    const resetForm = () => {
        setStep(1);
        setSelectedCustomer(null);
        setNewCustomer({
            firstName: "",
            lastName: "",
            whatsapp: "",
            address: "",
            city: "",
            region: "",
        });
        setOrderItems([]);
        setProductSearch("");
        setSearchResults([]);
    };

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return customers.slice(0, 5);
        return customers.filter(
            (c) =>
                `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
                c.whatsappNumber.includes(customerSearch)
        );
    }, [customers, customerSearch]);

    const handleSearchProducts = async (val: string) => {
        setProductSearch(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearchingProducts(true);
        const results = await searchProductsForOrder(val);
        setSearchResults(results);
        setIsSearchingProducts(false);
    };

    const addProductToOrder = (product: any) => {
        const newItem = {
            productId: product.id,
            name: product.name,
            price: product.basePrice,
            quantity: 1,
            selectedVariant: product.variants[0],
            selectedSize: product.fitCategory?.sizes[0]?.name || "Standard",
            selectedLength: "REGULAR" as Length,
            fitCategory: product.fitCategory?.name || "Standard",
            image: product.media[0]?.src || "",
            note: "",
            // Helper for UI
            availableVariants: product.variants,
            availableSizes: product.fitCategory?.sizes || [],
        };
        setOrderItems([...orderItems, newItem]);
        setProductSearch("");
        setSearchResults([]);
    };

    const removeOrderItem = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const updateOrderItem = (index: number, updates: any) => {
        const newItems = [...orderItems];
        newItems[index] = { ...newItems[index], ...updates };
        setOrderItems(newItems);
    };

    const subtotal = useMemo(() => {
        return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [orderItems]);

    const handleSubmit = async () => {
        if (orderItems.length === 0) {
            toast.error("Add at least one item to the order");
            return;
        }

        setIsLoading(true);
        try {
            const customerInfo = selectedCustomer
                ? {
                    firstName: selectedCustomer.firstName,
                    lastName: selectedCustomer.lastName,
                    whatsapp: selectedCustomer.whatsappNumber,
                    address: selectedCustomer.lastAddress,
                    city: selectedCustomer.lastCity,
                    region: selectedCustomer.lastRegion,
                }
                : newCustomer;

            const res = await createOrder({
                customer: customerInfo,
                items: orderItems,
            });

            if (res.success) {
                toast.success(`Order created successfully: ${res.orderNumber}`);
                onOrderCreated?.();
                onOpenChange(false);
            } else {
                toast.error(res.error || "Failed to create order");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
                <DialogHeader className="p-6 border-b border-neutral-100 dark:border-neutral-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="font-serif text-2xl font-bold italic">
                                Create Physical Order
                            </DialogTitle>
                            <p className="text-sm text-neutral-500 mt-1">
                                Step {step} of 3: {step === 1 ? "Customer Information" : step === 2 ? "Add Products" : "Review & Confirm"}
                            </p>
                        </div>
                        <Badge variant="outline" className="px-3 py-1 uppercase tracking-widest text-[10px] font-black">
                            Manual Entry
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/30 dark:bg-neutral-950/30">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step-1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                                        Identify Client
                                    </Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                        <Input
                                            placeholder="Search existing customers by name or phone..."
                                            value={customerSearch}
                                            onChange={(e) => setCustomerSearch(e.target.value)}
                                            className="pl-10 h-11 bg-white dark:bg-black"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        {filteredCustomers.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => {
                                                    setSelectedCustomer(c);
                                                    setStep(2);
                                                }}
                                                className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left group ${selectedCustomer?.id === c.id
                                                        ? "border-black dark:border-white bg-black/5 dark:bg-white/5"
                                                        : "border-neutral-100 dark:border-neutral-800 bg-white dark:bg-black hover:border-neutral-300"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                                        {c.firstName[0]}{c.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">
                                                            {c.firstName} {c.lastName}
                                                        </p>
                                                        <p className="text-xs text-neutral-500">{c.whatsappNumber}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-black dark:group-hover:text-white" />
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-neutral-100 dark:border-neutral-900" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white dark:bg-black px-2 text-neutral-400 font-black tracking-widest">Or</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <UserPlus className="w-4 h-4 text-neutral-400" />
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Add New Guest</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName" className="text-[10px] font-bold uppercase text-neutral-500">First Name</Label>
                                                <Input
                                                    id="firstName"
                                                    value={newCustomer.firstName}
                                                    onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                                                    className="h-10 bg-white dark:bg-black"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName" className="text-[10px] font-bold uppercase text-neutral-500">Last Name</Label>
                                                <Input
                                                    id="lastName"
                                                    value={newCustomer.lastName}
                                                    onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                                                    className="h-10 bg-white dark:bg-black"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="whatsapp" className="text-[10px] font-bold uppercase text-neutral-500">WhatsApp Number</Label>
                                            <Input
                                                id="whatsapp"
                                                placeholder="e.g. 23354XXXXXXX"
                                                value={newCustomer.whatsapp}
                                                onChange={(e) => setNewCustomer({ ...newCustomer, whatsapp: e.target.value })}
                                                className="h-10 bg-white dark:bg-black"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step-2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                                            Curate Items
                                        </Label>
                                        {selectedCustomer && (
                                            <Badge variant="secondary" className="text-[10px] gap-2">
                                                <Check className="w-3 h-3 text-green-500" />
                                                Client: {selectedCustomer.firstName}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Product Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                        <Input
                                            placeholder="Search products..."
                                            value={productSearch}
                                            onChange={(e) => handleSearchProducts(e.target.value)}
                                            className="pl-10 h-11 bg-white dark:bg-black"
                                        />
                                        {isSearchingProducts && (
                                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 animate-spin" />
                                        )}

                                        {searchResults.length > 0 && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                                                <div className="max-h-64 overflow-y-auto">
                                                    {searchResults.map((p) => (
                                                        <button
                                                            key={p.id}
                                                            onClick={() => addProductToOrder(p)}
                                                            className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-50 dark:border-neutral-900 last:border-0 text-left"
                                                        >
                                                            <div className="w-10 h-10 bg-neutral-100 rounded overflow-hidden">
                                                                {p.media[0] && (
                                                                    <img src={p.media[0].src} alt={p.name} className="w-full h-full object-cover" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-bold">{p.name}</p>
                                                                <p className="text-[10px] text-neutral-400 uppercase tracking-widest">GHS {p.basePrice}</p>
                                                            </div>
                                                            <Plus className="w-4 h-4 text-neutral-300" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Items List */}
                                    <div className="space-y-3">
                                        {orderItems.length === 0 ? (
                                            <div className="py-12 border-2 border-dashed border-neutral-100 dark:border-neutral-900 rounded-3xl flex flex-col items-center justify-center text-neutral-400">
                                                <Package className="w-12 h-12 mb-2 opacity-20" />
                                                <p className="text-sm font-light italic">No items added yet</p>
                                            </div>
                                        ) : (
                                            orderItems.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-4 bg-white dark:bg-black border border-neutral-100 dark:border-neutral-800 rounded-2xl flex flex-col gap-4 shadow-sm"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-neutral-50 rounded-xl overflow-hidden border border-neutral-100 flex-shrink-0">
                                                            {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-serif font-bold italic text-md leading-tight truncate">{item.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                                    GHS {item.price}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeOrderItem(idx)}
                                                            className="p-2 text-neutral-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {/* Variant */}
                                                        <div className="space-y-1">
                                                            <Label className="text-[9px] font-black uppercase text-neutral-400">Variant</Label>
                                                            <Select
                                                                value={item.selectedVariant.id}
                                                                onValueChange={(val) => {
                                                                    const v = item.availableVariants.find((av: any) => av.id === val);
                                                                    updateOrderItem(idx, { selectedVariant: v });
                                                                }}
                                                            >
                                                                <SelectTrigger className="h-8 text-[10px] font-bold uppercase">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {item.availableVariants.map((v: any) => (
                                                                        <SelectItem key={v.id} value={v.id} className="text-[10px] font-bold uppercase">{v.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        {/* Size */}
                                                        <div className="space-y-1">
                                                            <Label className="text-[9px] font-black uppercase text-neutral-400">Size</Label>
                                                            <Select
                                                                value={item.selectedSize}
                                                                onValueChange={(val) => updateOrderItem(idx, { selectedSize: val })}
                                                            >
                                                                <SelectTrigger className="h-8 text-[10px] font-bold uppercase">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {item.availableSizes.map((s: any) => (
                                                                        <SelectItem key={s.id} value={s.name} className="text-[10px] font-bold uppercase">{s.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        {/* Length */}
                                                        <div className="space-y-1">
                                                            <Label className="text-[9px] font-black uppercase text-neutral-400">Length</Label>
                                                            <Select
                                                                value={item.selectedLength}
                                                                onValueChange={(val) => updateOrderItem(idx, { selectedLength: val })}
                                                            >
                                                                <SelectTrigger className="h-8 text-[10px] font-bold uppercase">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {["MINI", "MIDI", "MAXI", "REGULAR"].map((l) => (
                                                                        <SelectItem key={l} value={l} className="text-[10px] font-bold uppercase">{l}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        {/* Qty */}
                                                        <div className="space-y-1">
                                                            <Label className="text-[9px] font-black uppercase text-neutral-400">Qty</Label>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => updateOrderItem(idx, { quantity: parseInt(e.target.value) || 1 })}
                                                                className="h-8 text-[11px] font-bold text-center pl-3 pr-1"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step-3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-black dark:bg-white" />
                                                Client Dossier
                                            </h4>
                                            <div className="p-6 rounded-2xl bg-white dark:bg-black border border-neutral-100 dark:border-neutral-800 shadow-sm space-y-3">
                                                <div>
                                                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Authorized Customer</p>
                                                    <p className="text-md font-serif font-bold italic tracking-tight">
                                                        {selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : `${newCustomer.firstName} ${newCustomer.lastName}`}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">WhatsApp Access</p>
                                                    <p className="text-sm font-medium">{selectedCustomer ? selectedCustomer.whatsappNumber : newCustomer.whatsapp}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-black dark:bg-white" />
                                                Shipping Instructions
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[9px] font-bold uppercase text-neutral-500">City</Label>
                                                        <Input
                                                            value={selectedCustomer ? selectedCustomer.lastCity || "" : newCustomer.city}
                                                            onChange={(e) => selectedCustomer ? setSelectedCustomer({ ...selectedCustomer, lastCity: e.target.value }) : setNewCustomer({ ...newCustomer, city: e.target.value })}
                                                            className="h-10"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[9px] font-bold uppercase text-neutral-500">Region</Label>
                                                        <Input
                                                            value={selectedCustomer ? selectedCustomer.lastRegion || "" : newCustomer.region}
                                                            onChange={(e) => selectedCustomer ? setSelectedCustomer({ ...selectedCustomer, lastRegion: e.target.value }) : setNewCustomer({ ...newCustomer, region: e.target.value })}
                                                            className="h-10"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-bold uppercase text-neutral-500">Full Address</Label>
                                                    <Input
                                                        value={selectedCustomer ? selectedCustomer.lastAddress || "" : newCustomer.address}
                                                        onChange={(e) => selectedCustomer ? setSelectedCustomer({ ...selectedCustomer, lastAddress: e.target.value }) : setNewCustomer({ ...newCustomer, address: e.target.value })}
                                                        className="h-10"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-black dark:bg-white" />
                                                Order Summary
                                            </h4>
                                            <div className="p-6 rounded-2xl bg-neutral-900 text-white shadow-xl space-y-6">
                                                <div className="space-y-3">
                                                    {orderItems.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between text-xs opacity-80">
                                                            <p>{item.quantity}x {item.name}</p>
                                                            <p>GHS {(item.price * item.quantity).toFixed(2)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Total Payable</p>
                                                        <p className="text-3xl font-serif font-bold italic tracking-tight">
                                                            GHS {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <Badge className="bg-green-500 text-white border-0 text-[9px] uppercase font-black px-3 py-1 mb-2">
                                                        Approved
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <DialogFooter className="p-6 border-t border-neutral-100 dark:border-neutral-900 bg-white dark:bg-black">
                    <div className="flex items-center justify-between w-full">
                        <Button
                            variant="ghost"
                            onClick={() => (step === 1 ? onOpenChange(false) : setStep(step - 1))}
                            className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white"
                        >
                            {step === 1 ? "Cancel" : "Back"}
                        </Button>
                        <Button
                            onClick={() => (step === 3 ? handleSubmit() : setStep(step + 1))}
                            disabled={
                                isLoading ||
                                (step === 1 && !selectedCustomer && (!newCustomer.firstName || !newCustomer.whatsapp)) ||
                                (step === 2 && orderItems.length === 0)
                            }
                            className="h-12 px-8 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-transform shadow-lg"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : step === 3 ? (
                                "Finalize Order"
                            ) : (
                                "Proceed"
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
