'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calendar, Tag, Percent, DollarSign, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Discount {
    id: string;
    code?: string;
    description: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: number;
    startDate: string;
    endDate?: string;
    isActive: boolean;
}

export function DiscountManager() {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        description: "",
        type: "PERCENTAGE",
        value: "",
        code: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        isActive: true
    });

    const fetchDiscounts = async () => {
        try {
            const res = await fetch('/api/admin/discounts');
            const data = await res.json();
            if (Array.isArray(data)) {
                setDiscounts(data);
            }
        } catch (error) {
            console.error("Failed to fetch discounts", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const handleSubmit = async () => {
        if (!formData.description || !formData.value) {
            toast.error("Please fill in required fields");
            return;
        }

        try {
            const res = await fetch('/api/admin/discounts', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Discount created");
                setIsDialogOpen(false);
                fetchDiscounts();
                // Reset minimal
                setFormData({ ...formData, description: "", value: "", code: "" });
            } else {
                toast.error("Failed to create discount");
            }
        } catch (error) {
            toast.error("Error creating discount");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will remove the discount from any attached products.")) return;

        try {
            const res = await fetch(`/api/admin/discounts/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Discount deleted");
                setDiscounts(prev => prev.filter(d => d.id !== id));
            }
        } catch (error) {
            toast.error("Failed to delete discount");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold font-serif uppercase tracking-widest">Discounts & Promotions</h2>
                    <p className="text-sm text-neutral-500">Manage sales, coupon codes, and automatic discounts.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-black uppercase tracking-widest h-10 px-6">
                            <Plus className="w-3 h-3 mr-2" />
                            Create Discount
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Discount</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    placeholder="e.g. Summer Sale 2024"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={val => setFormData({ ...formData, type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                            <SelectItem value="FIXED_AMOUNT">Fixed Amount (GHS)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Value</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.value}
                                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Discount Code (Optional)</Label>
                                <Input
                                    placeholder="e.g. SUMMER20"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date (Optional)</Label>
                                    <Input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={checked => setFormData({ ...formData, isActive: checked })}
                                />
                                <Label>Active</Label>
                            </div>
                            <Button onClick={handleSubmit} className="w-full mt-4 bg-black text-white">Create Discount</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center text-neutral-400 py-12">Loading discounts...</div>
                ) : discounts.length === 0 ? (
                    <div className="col-span-full text-center py-12 border border-dashed border-neutral-200 rounded-xl">
                        <Tag className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                        <p className="text-neutral-400 font-medium">No discounts found</p>
                    </div>
                ) : (
                    discounts.map((discount) => (
                        <div key={discount.id} className="group relative bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-xl hover:shadow-lg transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg ${discount.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-400'}`}>
                                    {discount.type === 'PERCENTAGE' ? <Percent className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${discount.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                                        {discount.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(discount.id)}
                                        className="text-neutral-300 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg mb-1">{discount.description}</h3>
                            <div className="text-3xl font-black font-serif mb-4">
                                {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `₵${discount.value}`}
                                <span className="text-sm font-sans font-medium text-neutral-400 ml-1">OFF</span>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                {discount.code && (
                                    <div className="flex items-center text-xs font-medium text-neutral-500">
                                        <Tag className="w-3 h-3 mr-2" />
                                        Code: <span className="ml-1 font-mono text-black dark:text-white bg-neutral-100 dark:bg-neutral-800 px-1 rounded">{discount.code}</span>
                                    </div>
                                )}
                                <div className="flex items-center text-xs font-medium text-neutral-500">
                                    <Calendar className="w-3 h-3 mr-2" />
                                    {new Date(discount.startDate).toLocaleDateString()}
                                    {discount.endDate ? ` - ${new Date(discount.endDate).toLocaleDateString()}` : ' - Ongoing'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
