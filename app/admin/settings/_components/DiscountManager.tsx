'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calendar, Tag, Percent, DollarSign, Edit2 } from "lucide-react";
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

const INITIAL_FORM_STATE = {
    description: "",
    type: "PERCENTAGE",
    value: "",
    code: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    isActive: true
};

export function DiscountManager() {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    const fetchDiscounts = async () => {
        try {
            const res = await fetch('/api/discounts');
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
            const url = editingId ? `/api/discounts/${editingId}` : '/api/discounts';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editingId ? "Discount updated" : "Discount created");
                setIsDialogOpen(false);
                setEditingId(null);
                setFormData(INITIAL_FORM_STATE);
                fetchDiscounts();
            } else {
                toast.error(editingId ? "Failed to update discount" : "Failed to create discount");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleEdit = (discount: Discount) => {
        setEditingId(discount.id);
        setFormData({
            description: discount.description,
            type: discount.type,
            value: discount.value.toString(),
            code: discount.code || "",
            startDate: new Date(discount.startDate).toISOString().split('T')[0],
            endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : "",
            isActive: discount.isActive
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will remove the discount from any attached products.")) return;

        try {
            const res = await fetch(`/api/discounts/${id}`, { method: 'DELETE' });
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
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingId(null);
                        setFormData(INITIAL_FORM_STATE);
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-black ml-auto text-white dark:bg-white dark:text-black rounded-full text-xs font-black uppercase tracking-widest h-10 px-6">
                            <Plus className="w-3 h-3 mr-2" />
                            Create Discount
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Discount" : "Create New Discount"}</DialogTitle>
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
                                        onValueChange={val => setFormData({ ...formData, type: val as any })}
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
                            <Button onClick={handleSubmit} className="w-full mt-4 bg-black text-white dark:bg-white dark:text-black rounded-full font-black uppercase tracking-widest text-xs h-12">
                                {editingId ? "Update Discount" : "Create Discount"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center text-neutral-400 py-12 font-black uppercase tracking-widest text-[10px]">Loading discounts...</div>
                ) : discounts.length === 0 ? (
                    <div className="col-span-full text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                        <Tag className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                        <p className="text-neutral-400 font-medium">No discounts found</p>
                    </div>
                ) : (
                    discounts.map((discount) => (
                        <div key={discount.id} className="group relative bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg ${discount.isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'}`}>
                                    {discount.type === 'PERCENTAGE' ? <Percent className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${discount.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'}`}>
                                        {discount.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(discount)}
                                            className="h-8 w-8 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(discount.id)}
                                            className="h-8 w-8 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg mb-1 leading-tight">{discount.description}</h3>
                            <div className="text-4xl font-black font-serif mb-4">
                                {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `₵${discount.value}`}
                                <span className="text-sm font-sans font-black text-neutral-400 ml-1">OFF</span>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                {discount.code && (
                                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-neutral-500">
                                        <Tag className="w-3 h-3 mr-2" />
                                        Code: <span className="ml-1 font-mono text-black dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded leading-none">{discount.code}</span>
                                    </div>
                                )}
                                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-neutral-500">
                                    <Calendar className="w-3 h-3 mr-2" />
                                    {new Date(discount.startDate).toLocaleDateString()}
                                    {discount.endDate ? ` - ${new Date(discount.endDate).toLocaleDateString()}` : ' - Ongoing'}
                                </div>
                            </div>

                            {/* Abstract background symbol */}
                            <div className="absolute -bottom-4 -right-4 opacity-[0.03] select-none pointer-events-none">
                                <Percent className="w-24 h-24" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
