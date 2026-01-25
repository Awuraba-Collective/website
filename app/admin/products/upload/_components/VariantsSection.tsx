import { FormControl, FormField, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useFormContext, useFieldArray } from "react-hook-form";
import { ProductFormValues } from "@/lib/validations/product";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";

export function VariantsSection() {
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });
  console.log("🚀 ~ VariantsSection ~ fields:", fields);

  return (
    <div className="pt-12 border-t border-neutral-100 dark:border-neutral-900 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-black dark:text-white font-serif uppercase tracking-widest">
          Product Variants
        </h2>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              id: Math.random().toString(36).substr(2, 9),
              name: "",
              available: true,
            })
          }
          className="rounded-full text-[10px] font-black uppercase tracking-widest h-8 px-4 border-neutral-200 dark:border-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
        >
          <Plus className="w-3 h-3 mr-2" /> Add Variant
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence initial={false}>
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex items-center justify-between p-4 bg-neutral-50/50 dark:bg-neutral-900/10 border border-neutral-100 dark:border-neutral-800 rounded-xl group transition-all hover:border-neutral-200 dark:hover:border-neutral-700 hover:shadow-sm"
            >
              <FormField
                control={control}
                name={`variants.${index}.name`}
                render={({ field: inputField }) => (
                  <div className="flex-1">
                    <FormControl>
                      <Input
                        {...inputField}
                        placeholder="e.g. Emerald Green"
                        className="bg-transparent border-none font-bold uppercase tracking-wide focus-visible:ring-0 px-0 h-auto text-sm placeholder:text-neutral-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                )}
              />

              <div className="flex items-center gap-6">
                <FormField
                  control={control}
                  name={`variants.${index}.available`}
                  render={({ field: toggleField }) => (
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest transition-colors ${toggleField.value ? "text-emerald-500" : "text-neutral-400"}`}
                      >
                        {toggleField.value ? "In Stock" : "Sold Out"}
                      </span>
                      <FormControl>
                        <Switch
                          checked={toggleField.value}
                          onCheckedChange={toggleField.onChange}
                          className="scale-90"
                        />
                      </FormControl>
                    </div>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-neutral-300 hover:text-rose-500 h-9 w-9 transition-colors"
                  disabled={fields.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {fields.length === 0 && (
          <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/20">
            <p className="text-[10px] text-neutral-400 uppercase font-black tracking-[0.2em]">
              No Active Variants
            </p>
          </div>
        )}
        {/* Global error for variants array */}
        <FormMessage className="text-center">
          {control.getFieldState("variants").error?.message}
        </FormMessage>
      </div>
    </div>
  );
}
