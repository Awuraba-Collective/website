import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input as InputComponent } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { ProductFormValues } from "@/lib/validations/product";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Image as ImageIcon } from "lucide-react";

export function MediaSection() {
    const { control } = useFormContext<ProductFormValues>();
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "productImages",
    });

    // Watch variants to populate the dropdown
    const variants = useWatch({ control, name: "variants" });

    const handleImageChange = (index: number, file: File) => {
        const url = URL.createObjectURL(file);
        update(index, {
            ...fields[index],
            file,
            previewUrl: url
        });
    };

    return (
        <div className="space-y-8 sticky top-10">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">Media & Model Insights</Label>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => append({
                        id: Math.random().toString(36).substr(2, 9),
                        file: null,
                        previewUrl: null,
                        modelHeight: '',
                        wearingSize: '',
                        wearingVariant: ''
                    })}
                    className="h-8 rounded-full text-[9px] font-black uppercase tracking-widest px-4 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                    <Plus className="w-3 h-3 mr-2" /> Add
                </Button>
            </div>

            <div className="space-y-6">
                <AnimatePresence initial={false}>
                    {fields.map((field, index) => (
                        <motion.div
                            key={field.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-5 bg-white dark:bg-black border border-neutral-100 dark:border-neutral-800 rounded-2xl space-y-5 relative group shadow-sm hover:shadow-md transition-shadow"
                        >
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-black text-neutral-400 hover:text-rose-500 rounded-full flex items-center justify-center shadow-lg border border-neutral-100 dark:border-neutral-800 transition-colors z-10"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>

                            {/* Image Preview / Upload Area */}
                            <div className="aspect-[3/4] rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors overflow-hidden relative group/image">
                                {field.previewUrl ? (
                                    <>
                                        <img src={field.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-[9px] text-white font-black uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">Change</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-white dark:bg-black flex items-center justify-center shadow-sm">
                                            <ImageIcon className="w-4 h-4 text-neutral-300" />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">
                                            {index === 0 ? 'Main Image' : 'Alt View'}
                                        </span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            handleImageChange(index, e.target.files[0]);
                                        }
                                    }}
                                />
                            </div>

                            {/* Image Details */}
                            <div className="space-y-4 pt-2">
                                <FormField
                                    control={control}
                                    name={`productImages.${index}.modelHeight`}
                                    render={({ field: inputField }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Model Height</FormLabel>
                                            <FormControl>
                                                <InputComponent
                                                    {...inputField}
                                                    placeholder="e.g. 5'9"
                                                    className="h-10 text-[11px] font-bold bg-neutral-50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={control}
                                        name={`productImages.${index}.wearingSize`}
                                        render={({ field: inputField }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Size</FormLabel>
                                                <FormControl>
                                                    <InputComponent
                                                        {...inputField}
                                                        placeholder="M"
                                                        className="h-10 text-[11px] font-bold bg-neutral-50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800 uppercase"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name={`productImages.${index}.wearingVariant`}
                                        render={({ field: selectField }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Variant</FormLabel>
                                                <Select onValueChange={selectField.onChange} value={selectField.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 text-[11px] font-bold bg-neutral-50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800">
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {variants.map((v) => (
                                                            <SelectItem key={v.id} value={v.name} className="uppercase font-bold text-xs">
                                                                {v.name || 'Unnamed'}
                                                            </SelectItem>
                                                        ))}
                                                        {variants.length === 0 && (
                                                            <SelectItem value="none" disabled className="text-xs text-neutral-400">
                                                                No variants
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {fields.length === 0 && (
                    <div
                        onClick={() => append({
                            id: Math.random().toString(36).substr(2, 9),
                            file: null,
                            previewUrl: null,
                            modelHeight: '',
                            wearingSize: '',
                            wearingVariant: ''
                        })}
                        className="aspect-[3/4] rounded-2xl border-2 border-dashed border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-5 h-5 text-neutral-300" />
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Add Primary Image</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
