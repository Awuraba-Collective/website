'use client';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useProductForm } from "../_hooks/useProductForm";
import { BasicInfoSection } from "./BasicInfoSection";
import { PricingSection } from "./PricingSection";
import { VariantsSection } from "./VariantsSection";
import { MediaSection } from "./MediaSection";
import { RecommendationsAndDropSection } from "./RecommendationsAndDropSection";
import Link from 'next/link';

export function ProductForm() {
    const { form, submitForm, isUploading, discounts, currencies, calculatePricing } = useProductForm();

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(submitForm)} className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20">
                {/* Left Column: Media & Model Details */}
                <div className="lg:col-span-4 space-y-10">
                    <MediaSection />
                </div>

                {/* Right Column: Form Fields */}
                <div className="lg:col-span-8 space-y-16">
                    <BasicInfoSection />
                    <VariantsSection />
                    <PricingSection
                        discounts={discounts}
                        currencies={currencies}
                        calculatePricing={calculatePricing}
                    />
                    <RecommendationsAndDropSection />

                    {/* Actions */}
                    <div className="pt-12 border-t border-neutral-100 dark:border-neutral-900 flex justify-end gap-3 sticky bottom-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl p-4 -mx-4 rounded-xl border-t-0 z-50">
                        <Button
                            asChild
                            variant="outline"
                            className="px-8 h-12 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-neutral-200 dark:border-neutral-800"
                        >
                            <Link href="/admin/products">Back to Collection</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={isUploading}
                            className="bg-black dark:bg-white text-white dark:text-black px-12 h-12 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            {isUploading ? 'Finalizing Drop...' : 'Launch Product'}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
