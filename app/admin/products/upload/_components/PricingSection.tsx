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
import { Label } from "@/components/ui/label";
import { useFormContext, useWatch } from "react-hook-form";
import { ProductFormValues } from "@/lib/validations/product";
import { Currency, Discount } from "../_hooks/useProductForm";

interface PricingCalculationResult {
  marginPercentage: number;
  priceGHS: number;
  priceMap: Record<string, { price: number; discountPrice?: number }>;
  currencies: Currency[];
  selectedDiscount?: Discount;
}

interface PricingSectionProps {
  discounts: Discount[];
  calculatePricing: (
    pricingInput?: ProductFormValues["pricing"],
  ) => PricingCalculationResult;
}

export function PricingSection({
  discounts,
  calculatePricing,
}: PricingSectionProps) {
  const { control } = useFormContext<ProductFormValues>();

  // Watch form state
  const pricing = useWatch({ control, name: "pricing" });
  const hasDiscount = !!pricing.discountId;

  // Calculate derived state on every render
  const { priceMap, currencies: supportedCurrencies } =
    calculatePricing(pricing);

  const currencies = (supportedCurrencies || []).map((curr) => {
    const calc = (priceMap && priceMap[curr.code]) || { price: 0 };
    return {
      ...curr,
      label: curr.symbol, // Map symbol to label
      selling: calc.discountPrice ?? calc.price,
      retail: calc.price,
    };
  });

  const ghsCode = currencies.find((c) => c.isBase)?.code || "GHS";
  const ghsCalc =
    priceMap && priceMap[ghsCode] ? priceMap[ghsCode] : { price: 0 };
  const finalPriceGHS = ghsCalc.discountPrice ?? ghsCalc.price;
  const actualProfitGHS = finalPriceGHS - (Number(pricing.costPrice) || 0);

  return (
    <div className="pt-12 border-t border-neutral-100 dark:border-neutral-900 space-y-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-black dark:text-white font-serif uppercase tracking-widest">
          Financial Structure
        </h2>
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
                <FormLabel className="text-xs font-black uppercase tracking-widest text-neutral-400">
                  Base Cost
                </FormLabel>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">
                    GH₵
                  </span>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
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
                <FormLabel className="text-xs font-black uppercase tracking-widest text-neutral-400">
                  Projected Profit
                </FormLabel>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">
                    GH₵
                  </span>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      className="bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 h-12 pl-14 text-2xl font-bold"
                      placeholder="0.00"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Discount Selection */}
          <div className="space-y-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
            <FormField
              control={control}
              name="pricing.discountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-widest text-neutral-400">
                    Apply Discount
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : value)
                      }
                      value={field.value || "none"}
                    >
                      <SelectTrigger className="bg-white dark:bg-black font-bold !h-12 w-full uppercase text-xs">
                        <SelectValue placeholder="No Discount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {discounts.map((discount) => (
                          <SelectItem key={discount.id} value={discount.id}>
                            {discount.description} (
                            {discount.type === "PERCENTAGE"
                              ? `${discount.value}%`
                              : `₵${discount.value}`}
                            )
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        {/* Summary / Display */}
        <div className="space-y-8">
          <div className="bg-black text-white dark:bg-white dark:text-black p-10 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <div className="grid grid-cols-1 grid-rows-2 gap-8 items-center border-y border-white/10 dark:border-black/10 ">
                {currencies.map((curr) => (
                  <div key={curr.code} className="space-y-2">
                    <div className="flex items-center gap-2 opacity-50">
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {curr.code} Projection
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-5xl font-black font-serif flex items-baseline gap-2">
                        <span className="text-xl opacity-50">{curr.label}</span>
                        {curr.selling.toLocaleString()}
                      </div>
                      {hasDiscount && (
                        <div className="text-3xl opacity-40 font-bold line-through">
                          {curr.label} {curr.retail.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                    Net Profit
                  </Label>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm opacity-50">GH₵</span>
                    <span
                      className={`text-3xl font-black ${actualProfitGHS < 0 ? "text-rose-500" : "text-emerald-500"}`}
                    >
                      {actualProfitGHS.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                    Net Margin
                  </Label>
                  <div
                    className={`text-3xl font-black ${actualProfitGHS < 0 ? "text-rose-500" : "text-emerald-500"}`}
                  >
                    {((actualProfitGHS / (finalPriceGHS || 1)) * 100).toFixed(
                      1,
                    )}
                    %
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
