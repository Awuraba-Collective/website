import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useFormContext, useWatch } from "react-hook-form";
import { ProductFormValues } from "@/lib/validations/product";
import { motion, AnimatePresence } from "framer-motion";
import { useProductForm } from "../_hooks/useProductForm";

export function PricingSection() {
    const { control } = useFormContext<ProductFormValues>();
    const { calculatePricing } = useProductForm();

    const pricing = useWatch({ control, name: "pricing" });
    const showDiscount = pricing.showDiscount;

    const RATES = { USD: 15 };
    const costPrice = pricing.costPrice || 0;
    const projectedProfit = pricing.projectedProfit || 0;
    const retailPriceGHS = costPrice + projectedProfit;

    let discountAmountGHS = 0;
    if (showDiscount && pricing.discount) {
        if (pricing.discount.type === 'percent') {
            discountAmountGHS = retailPriceGHS * (pricing.discount.value / 100);
        } else {
            discountAmountGHS = pricing.discount.value;
        }
    }
    const finalPriceGHS = Math.max(0, retailPriceGHS - discountAmountGHS);
    const actualProfitGHS = finalPriceGHS - costPrice;

    // Currency Displays
    const currencies = [
        {
            code: 'GHS',
            label: '₵',
            selling: finalPriceGHS,
            retail: retailPriceGHS
        },
        {
            code: 'USD',
            label: '$',
            selling: Math.ceil(finalPriceGHS / RATES.USD),
            retail: Math.ceil(retailPriceGHS / RATES.USD)
        }
    ];

    return (
        <div className="pt-12 border-t border-neutral-100 dark:border-neutral-900 space-y-12">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black dark:text-white font-serif uppercase tracking-widest text-sm">Financial Structure</h2>
                <div className="h-0.5 w-12 bg-black dark:bg-white"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Inputs */}
                <div className="space-y-8">
                    {/* Cost Price */}
                    <FormField
                        control={control}
                        name="pricing.costPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-black uppercase tracking-widest text-neutral-400">Base Cost</FormLabel>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">GH₵</span>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                            className="bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 h-12 pl-14 text-2xl font-bold"
                                            placeholder="0.00"
                                        />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Projected Profit */}
                    <FormField
                        control={control}
                        name="pricing.projectedProfit"
                        render={({ field }) => (
                            <FormItem className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                                <FormLabel className="text-xs font-black uppercase tracking-widest text-neutral-400">Projected Profit</FormLabel>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">GH₵</span>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                            className="bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 h-12 pl-14 text-2xl font-bold"
                                            placeholder="0.00"
                                        />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Discount Toggle & Fields */}
                    <div className="space-y-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                        <FormField
                            control={control}
                            name="pricing.showDiscount"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg p-0 space-y-0">
                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-neutral-400">Apply Discount</FormLabel>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <AnimatePresence>
                            {showDiscount && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden space-y-4 pt-2"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={control}
                                            name="pricing.discount.type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white dark:bg-black font-bold !h-12 w-full uppercase text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="percent">Percent (%)</SelectItem>
                                                            <SelectItem value="fixed">Fixed (GHS)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name="pricing.discount.value"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                            className="bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 h-12 font-bold"
                                                            placeholder="Value"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <FormField
                                            control={control}
                                            name="pricing.discount.startDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase text-neutral-400">Start Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} className="text-[10px] font-bold h-12" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name="pricing.discount.expiryDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase text-neutral-400">Expiry Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} className="h-12 text-[10px] font-bold" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Summary / Display */}
                <div className="space-y-8">
                    <div className="bg-black text-white dark:bg-white dark:text-black p-10 rounded-2xl shadow-xl relative overflow-hidden">
                        <div className="relative z-10 space-y-10">
                            <div className="grid grid-cols-1 grid-rows-2 gap-8 items-center border-y border-white/10 dark:border-black/10 py-6">
                                {currencies.map((curr) => (
                                    <div key={curr.code} className="space-y-2">
                                        <div className="flex items-center gap-2 opacity-50">
                                            <span className="text-[10px] font-black uppercase tracking-widest">{curr.code} Projection</span>
                                        </div>
                                        <div className="text-5xl font-black font-serif flex items-baseline gap-2">
                                            <span className="text-xl opacity-50">{curr.label}</span>
                                            {curr.selling.toLocaleString()}
                                        </div>
                                        {showDiscount && (
                                            <div className="text-sm opacity-40 font-bold line-through">
                                                {curr.label} {curr.retail.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Net Profit</Label>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm opacity-50">GH₵</span>
                                        <span className={`text-3xl font-black ${actualProfitGHS < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {actualProfitGHS.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2 text-right">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Net Margin</Label>
                                    <div className={`text-3xl font-black ${actualProfitGHS < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {((actualProfitGHS / (finalPriceGHS || 1)) * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subtle background decoration */}
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none">
                            <span className="text-[200px] font-black leading-none">A</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
