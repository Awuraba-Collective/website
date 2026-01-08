import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/lib/validations/product";
import { useProductForm } from "../_hooks/useProductForm";

export function BasicInfoSection() {
    const form = useFormContext<ProductFormValues>();
    const { fitCategories, categories, collections } = useProductForm();

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-black dark:text-white font-serif uppercase tracking-widest text-sm">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-black uppercase tracking-widest text-neutral-400">
                                Product Name
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g. The Awuraba Maxi"
                                    className="bg-white dark:bg-black font-bold h-12 text-sm"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Category */}
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-black uppercase tracking-widest text-neutral-400">
                                Category
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="bg-white dark:bg-black font-bold !h-12 text-sm w-full uppercase">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Description */}
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-neutral-400">
                            Description
                        </FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Describe the product, its features, and what makes it special..."
                                className="min-h-[120px] resize-none font-medium leading-relaxed bg-white dark:bg-black text-sm"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fit Category */}
                <FormField
                    control={form.control}
                    name="fitCategory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-black uppercase tracking-widest text-neutral-400">
                                Fit Category
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="bg-white dark:bg-black font-bold !h-12 text-sm w-full uppercase">
                                        <SelectValue placeholder="Select Fit" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {fitCategories.map((fitCat) => (
                                        <SelectItem key={fitCat.id} value={fitCat.id}>
                                            {fitCat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Collection */}
                <FormField
                    control={form.control}
                    name="collection"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-black uppercase tracking-widest text-neutral-400">
                                Collection (Optional)
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="bg-white dark:bg-black font-bold !h-12 text-sm w-full uppercase">
                                        <SelectValue placeholder="Select Collection" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {collections.map((col) => (
                                        <SelectItem key={col.id} value={col.id}>
                                            {col.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
