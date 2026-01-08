'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsListManager } from "./_components/SettingsListManager";
import { CurrencyManager } from "./_components/CurrencyManager";
import { SizingStandardsManager } from "./_components/SizingStandardsManager";
import { DiscountManager } from "./_components/DiscountManager";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-4 py-12 space-y-12 pb-32">
            <div className="space-y-4">
                <h1 className="text-4xl font-black font-serif uppercase tracking-tight">Admin Settings</h1>
                <p className="text-neutral-500 font-medium max-w-2xl">
                    Manage global configurations for the store, including product categories, currency rates, and sizing standards.
                </p>
            </div>

            <Tabs defaultValue="general" className="w-full space-y-10">
                <TabsList className="bg-transparent p-0 gap-8 h-auto border-b border-neutral-200 dark:border-neutral-800 w-full justify-start rounded-none">
                    <TabsTrigger
                        value="general"
                        className="bg-transparent border-b-2 border-transparent data-[state=active]:border-b-black dark:data-[state=active]:border-white data-[state=active]:shadow-none rounded-none px-0 pb-4 text-xs font-black uppercase tracking-[0.2em] text-neutral-400 data-[state=active]:text-black dark:data-[state=active]:text-white transition-all"
                    >
                        General & Lists
                    </TabsTrigger>

                    <TabsTrigger
                        value="currency"
                        className="bg-transparent border-b-2 border-transparent data-[state=active]:border-b-black dark:data-[state=active]:border-white data-[state=active]:shadow-none rounded-none px-0 pb-4 text-xs font-black uppercase tracking-[0.2em] text-neutral-400 data-[state=active]:text-black dark:data-[state=active]:text-white transition-all"
                    >
                        Currency
                    </TabsTrigger>
                    <TabsTrigger
                        value="discounts"
                        className="bg-transparent border-b-2 border-transparent data-[state=active]:border-b-black dark:data-[state=active]:border-white data-[state=active]:shadow-none rounded-none px-0 pb-4 text-xs font-black uppercase tracking-[0.2em] text-neutral-400 data-[state=active]:text-black dark:data-[state=active]:text-white transition-all"
                    >
                        Discounts
                    </TabsTrigger>
                    <TabsTrigger
                        value="sizing"
                        className="bg-transparent border-b-2 border-transparent data-[state=active]:border-b-black dark:data-[state=active]:border-white data-[state=active]:shadow-none rounded-none px-0 pb-4 text-xs font-black uppercase tracking-[0.2em] text-neutral-400 data-[state=active]:text-black dark:data-[state=active]:text-white transition-all"
                    >
                        Sizing Standards
                    </TabsTrigger>
                </TabsList>

                {/* GENERAL TAB */}
                <TabsContent value="general" className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <SettingsListManager
                            title="Product Categories"
                            description="Define the main categories for product organization."
                            placeholder="e.g. Bridal"
                            apiEndpoint="/api/categories"
                        />
                        <SettingsListManager
                            title="Fit Categories"
                            description="Define fitting types available for products."
                            placeholder="e.g. Slim Fit"
                            apiEndpoint="/api/fit-categories"
                        />
                    </div>

                    <Separator />

                    <div className="max-w-2xl">
                        <SettingsListManager
                            title="Collections"
                            description="Manage active collections for product grouping."
                            placeholder="e.g. Summer 2025"
                            apiEndpoint="/api/collections"
                        />
                    </div>
                </TabsContent>

                {/* CURRENCY TAB */}
                <TabsContent value="currency" className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CurrencyManager />
                </TabsContent>

                {/* DISCOUNTS TAB */}
                <TabsContent value="discounts" className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DiscountManager />
                </TabsContent>

                {/* SIZING TAB */}
                <TabsContent value="sizing" className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <SizingStandardsManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}
