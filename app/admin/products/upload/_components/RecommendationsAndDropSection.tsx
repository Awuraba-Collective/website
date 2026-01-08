import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useFormContext, useWatch } from "react-hook-form";
import { ProductFormValues } from "@/lib/validations/product";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Sparkles, Tag } from "lucide-react";
import { useState, useEffect } from "react";

// Mock products for search simulation
const MOCK_PRODUCTS = [
    { id: 'prod_1', name: 'The Awuraba Maxi', image: '' },
    { id: 'prod_2', name: 'Kente Silk Scarf', image: '' },
    { id: 'prod_3', name: 'Sunset Bolero', image: '' },
    { id: 'prod_4', name: 'Gold Statement Earrings', image: '' },
];

export function RecommendationsAndDropSection() {
    const { control, setValue } = useFormContext<ProductFormValues>();
    const newDrop = useWatch({ control, name: "newDrop" });
    const frequentlyBought = useWatch({ control, name: "frequentlyBoughtTogether" }) || [];

    // Safety check if newDrop is undefined
    const isEnabled = newDrop?.enabled;

    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // Auto-set autoExpire to true when enabled, so we don't need a UI toggle for it
    useEffect(() => {
        if (isEnabled && !newDrop?.autoExpire) {
            setValue("newDrop.autoExpire", true);
        }
    }, [isEnabled, newDrop?.autoExpire, setValue]);

    const toggleProduct = (productId: string) => {
        const current = frequentlyBought;
        if (current.includes(productId)) {
            setValue("frequentlyBoughtTogether", current.filter(id => id !== productId));
        } else {
            setValue("frequentlyBoughtTogether", [...current, productId]);
        }
    };

    const filteredProducts = searchQuery
        ? MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : MOCK_PRODUCTS;

    return (
        <div className="pt-12 border-t border-neutral-100 dark:border-neutral-900 space-y-10">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black dark:text-white font-serif uppercase tracking-widest text-sm">Discovery & Launch</h2>
                <div className="h-0.5 w-12 bg-black dark:bg-white"></div>
            </div>

            <div className="grid grid-cols-1 gap-12">

                {/* Subsection: Frequently Bought Together */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-neutral-400" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500">Frequently Bought Together</h3>
                    </div>

                    <div className="pl-11 space-y-4">
                        {/* Selected Items */}
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
                            {frequentlyBought.length === 0 && (
                                <span className="text-xs text-neutral-400 self-center px-2">No products linked yet</span>
                            )}
                            {frequentlyBought.map(id => {
                                const prod = MOCK_PRODUCTS.find(p => p.id === id);
                                return (
                                    <Badge key={id} variant="secondary" className="h-8 pl-3 pr-1 rounded-full gap-2 text-[10px] uppercase tracking-wider font-bold bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                        {prod?.name || id}
                                        <button
                                            type="button"
                                            onClick={() => toggleProduct(id)}
                                            className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                );
                            })}
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                placeholder="Search products directly..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearching(true)}
                                onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                                className="pl-11 h-12 bg-white dark:bg-black font-bold text-sm border-neutral-200 dark:border-neutral-800"
                            />

                            {/* Search Results Dropdown */}
                            {isSearching && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-black border border-neutral-100 dark:border-neutral-800 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto p-2">
                                    {filteredProducts.map(prod => (
                                        <button
                                            key={prod.id}
                                            type="button"
                                            onClick={() => toggleProduct(prod.id)}
                                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors group"
                                        >
                                            <span className={`text-xs font-bold uppercase tracking-wide ${frequentlyBought.includes(prod.id) ? 'text-emerald-500' : 'text-neutral-600 dark:text-neutral-300'}`}>
                                                {prod.name}
                                            </span>
                                            {frequentlyBought.includes(prod.id) && (
                                                <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-600 border-emerald-200">Selected</Badge>
                                            )}
                                        </button>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <div className="p-4 text-center text-xs text-neutral-400">No products found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Subsection: New Drop Configuration */}
                <div className="space-y-6 pt-6 border-t border-dashed border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
                                <Tag className="w-4 h-4 text-neutral-400" />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500">New Drop Settings</h3>
                        </div>
                        <FormField
                            control={control}
                            name="newDrop.enabled"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    <AnimatePresence>
                        {isEnabled && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pl-11"
                            >
                                <FormField
                                    control={control}
                                    name="newDrop.durationDays"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-xs font-black uppercase tracking-widest text-neutral-400">Badge Duration (Days)</FormLabel>
                                            <div className="relative max-w-xs">
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                                        className="bg-white dark:bg-black font-bold h-12 pl-4 pr-12 text-lg"
                                                        placeholder="14"
                                                    />
                                                </FormControl>
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 uppercase tracking-wider">Days</span>
                                            </div>
                                            <p className="text-[10px] text-neutral-400 font-medium">
                                                The 'New Arrival' badge will automatically disappear after this period.
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
