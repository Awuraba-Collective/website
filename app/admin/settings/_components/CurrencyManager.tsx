'use client';

import { useState, useEffect } from "react";
import { Plus, Trash2, Coins } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Types
interface Currency {
    code: string;
    symbol: string;
    rate: number;
    isBase: boolean;
    isActive: boolean;
}

export function CurrencyManager() {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newCurrency, setNewCurrency] = useState<Partial<Currency>>({ code: '', symbol: '', rate: 1 });

    // Fetch currencies on mount
    useEffect(() => {
        fetchCurrencies();
    }, []);

    const fetchCurrencies = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/currencies');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setCurrencies(data);
        } catch (error) {
            console.error('Failed to fetch currencies:', error);
            toast.error('Failed to load currencies');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newCurrency.code || !newCurrency.symbol || !newCurrency.rate) return;

        try {
            setIsAdding(true);
            const res = await fetch('/api/currencies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: newCurrency.code.toUpperCase(),
                    symbol: newCurrency.symbol,
                    rate: Number(newCurrency.rate)
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create');
            }

            const created = await res.json();
            setCurrencies(prev => [...prev, created]);
            setNewCurrency({ code: '', symbol: '', rate: 1 });
            setIsAddOpen(false);
            toast.success('Currency added successfully');
        } catch (error: any) {
            console.error('Failed to add currency:', error);
            toast.error(error.message || 'Failed to add currency');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (code: string) => {
        try {
            const res = await fetch(`/api/currencies?code=${code}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to delete');
            }

            setCurrencies(prev => prev.filter(c => c.code !== code));
            toast.success('Currency deleted successfully');
        } catch (error: any) {
            console.error('Failed to delete currency:', error);
            toast.error(error.message || 'Failed to delete currency');
        }
    };

    const handleRateChange = async (code: string, newRate: number) => {
        try {
            const res = await fetch('/api/currencies', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, rate: newRate })
            });

            if (!res.ok) throw new Error('Failed to update');

            const updated = await res.json();
            setCurrencies(prev => prev.map(c => c.code === code ? updated : c));
        } catch (error) {
            console.error('Failed to update rate:', error);
            toast.error('Failed to update exchange rate');
        }
    };

    const handleToggleActive = async (code: string, isActive: boolean) => {
        try {
            const res = await fetch('/api/currencies', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, isActive })
            });

            if (!res.ok) throw new Error('Failed to update');

            const updated = await res.json();
            setCurrencies(prev => prev.map(c => c.code === code ? updated : c));
            toast.success(`Currency ${isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            console.error('Failed to toggle currency:', error);
            toast.error('Failed to update currency status');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">


                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full text-[10px] ml-auto font-black uppercase tracking-widest h-10 px-6 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black">
                            <Plus className="w-3 h-3 mr-2" /> Add Currency
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="font-serif uppercase tracking-widest">Add New Currency</DialogTitle>
                            <DialogDescription>
                                Add a new currency support to the store.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="code" className="text-right text-xs uppercase font-bold text-neutral-500">
                                    Code
                                </Label>
                                <Input
                                    id="code"
                                    placeholder="e.g. EUR"
                                    className="col-span-3 font-bold uppercase"
                                    value={newCurrency.code}
                                    onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="symbol" className="text-right text-xs uppercase font-bold text-neutral-500">
                                    Symbol
                                </Label>
                                <Input
                                    id="symbol"
                                    placeholder="e.g. €"
                                    className="col-span-3 font-bold"
                                    value={newCurrency.symbol}
                                    onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="rate" className="text-right text-xs uppercase font-bold text-neutral-500">
                                    Rate
                                </Label>
                                <Input
                                    id="rate"
                                    type="number"
                                    step="0.0001"
                                    placeholder="1.00"
                                    className="col-span-3 font-bold"
                                    value={newCurrency.rate}
                                    onChange={(e) => setNewCurrency({ ...newCurrency, rate: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleAdd}
                                disabled={isAdding}
                                className="w-full bg-black text-white uppercase font-black text-xs h-10 tracking-widest rounded-full"
                            >
                                {isAdding ? 'Adding...' : 'Save Currency'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-black">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Loading currencies...</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                                <TableHead className="w-[100px] text-[10px] font-black uppercase tracking-widest text-neutral-400">Code</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Symbol</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Exchange Rate (vs GHS)</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Status</TableHead>
                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-neutral-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currencies.map((currency) => (
                                <TableRow
                                    key={currency.code}
                                    className={`border-neutral-100 dark:border-neutral-800 ${!currency.isActive ? 'opacity-50' : ''}`}
                                >
                                    <TableCell className="font-bold">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                                                <Coins className="w-3 h-3 text-neutral-500" />
                                            </div>
                                            {currency.code}
                                            {currency.isBase && (
                                                <Badge variant="secondary" className="text-[9px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">BASE</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-lg">{currency.symbol}</TableCell>
                                    <TableCell>
                                        <div className="max-w-[120px]">
                                            <Input
                                                type="number"
                                                step="0.0001"
                                                value={currency.rate}
                                                disabled={currency.isBase}
                                                onChange={(e) => handleRateChange(currency.code, parseFloat(e.target.value))}
                                                onBlur={(e) => handleRateChange(currency.code, parseFloat(e.target.value))}
                                                className="font-bold h-10 bg-transparent border-transparent hover:border-neutral-200 focus:bg-white focus:border-neutral-200 transition-all text-right pr-4"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={currency.isActive}
                                            onCheckedChange={(checked) => handleToggleActive(currency.code, checked)}
                                            disabled={currency.isBase}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!currency.isBase && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(currency.code)}
                                                className="text-neutral-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
