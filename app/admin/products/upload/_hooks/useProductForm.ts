import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema, type ProductFormValues, type ProductApiPayload } from '@/lib/validations/product';
import { uploadImagesToStorage } from '@/lib/utils/product-payload';
import { useState, useCallback, useEffect } from 'react';
import { toast } from "sonner";

// Constants for Pricing
// Types for fetched data
export interface Currency {
    code: string;
    symbol: string;
    rate: number;
    isBase: boolean;
}

export interface Discount {
    id: string;
    description: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: number;
}

export interface FitCategory {
    id: string;
    name: string;
    slug: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface Collection {
    id: string;
    name: string;
    slug: string;
}

export const useProductForm = () => {
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: '',
            description: '',
            category: '',
            fitCategory: '',
            collection: '',
            pricing: {
                costPrice: 0,
                projectedProfit: 0,
                discountId: undefined,
                currencyOverrides: undefined
            },
            variants: [],
            productImages: [],
            frequentlyBoughtTogether: [],
            newDrop: {
                enabled: false,
                autoExpire: false,
                durationDays: 14,
            },
        },
    });

    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [fitCategories, setFitCategories] = useState<FitCategory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [currRes, discRes, fitCatRes, catRes, collRes] = await Promise.all([
                    fetch('/api/currencies?active=true').then(r => r.json()),
                    fetch('/api/discounts/active').then(r => r.json()),
                    fetch('/api/fit-categories').then(r => r.json()),
                    fetch('/api/categories').then(r => r.json()),
                    fetch('/api/collections').then(r => r.json())
                ]);
                // Safety check for array type (in case of error object)
                if (Array.isArray(currRes)) setCurrencies(currRes);
                if (Array.isArray(discRes)) setDiscounts(discRes);
                if (Array.isArray(fitCatRes)) {
                    setFitCategories(fitCatRes);
                    // Set default fitCategory to first one if available
                    if (fitCatRes.length > 0 && !form.getValues('fitCategory')) {
                        form.setValue('fitCategory', fitCatRes[0].id);
                    }
                }
                if (Array.isArray(catRes)) setCategories(catRes);
                if (Array.isArray(collRes)) setCollections(collRes);
            } catch (e) {
                console.error("Failed to fetch form data", e);
            }
        };
        fetchData();
    }, []);

    // Calculate Pricing Logic
    const calculatePricing = useCallback(() => {
        const { costPrice, projectedProfit, discountId, currencyOverrides } = form.getValues('pricing');

        // 1. Base Price (GHS)
        const priceGHS = costPrice + projectedProfit;
        const marginPercentage = costPrice > 0 ? (projectedProfit / costPrice) * 100 : 0;

        // 2. Find selected discount
        const selectedDiscount = discounts.find(d => d.id === discountId);

        // 3. Calculate per-currency prices
        const priceMap: Record<string, { price: number, discountPrice?: number }> = {};

        currencies.forEach(currency => {
            let finalPrice = 0;

            // Convert Base GHS to Target Currency
            // If Rate is "Exchange rate vs Base", e.g. USD rate 0.065 (1 GHS = 0.065 USD)
            // Then PriceUSD = PriceGHS * Rate
            // If Rate is defined as "GHS per USD" (e.g. 15), then division.
            // Based on Seed: "rate: 0.065, isBase: false" -> This implies Multiplier.

            if (currency.isBase) {
                finalPrice = priceGHS;
            } else {
                // Use multiplication for multiplier rates
                finalPrice = Number((priceGHS * Number(currency.rate)).toFixed(2));
                // Standard retail rounding (e.g. ceil) if desired, but user didn't specify strict rounding yet other than previous code.
                // Previous code used ceil. Let's keep ceil for nice numbers? 
                // Actually, let's keep it simple first.
                finalPrice = Math.ceil(finalPrice);
            }

            // Apply Discount Rule
            let discountPrice: number | undefined = undefined;
            if (selectedDiscount) {
                let deduction = 0;
                if (selectedDiscount.type === 'PERCENTAGE') {
                    // Percentage applies same to all currencies
                    deduction = finalPrice * (Number(selectedDiscount.value) / 100);
                } else if (selectedDiscount.type === 'FIXED_AMOUNT') {
                    // Fixed amount (e.g. 50 GHS) needs conversion to target currency
                    // deduction = 50 * Rate
                    const fixedVal = Number(selectedDiscount.value);
                    const rate = Number(currency.rate);
                    // If base is GHS (rate 1), deduction is 50.
                    // If USD (rate 0.065), deduction is 50 * 0.065 = 3.25.
                    deduction = fixedVal * rate;
                }

                // Effective Price
                const calcDiscountPrice = Math.max(0, finalPrice - deduction);
                // Round it too
                discountPrice = Math.ceil(calcDiscountPrice);
            }

            // Override Check
            if (currencyOverrides && currencyOverrides[currency.code]) {
                const override = currencyOverrides[currency.code];
                finalPrice = override.price; // Admin manual price
                if (override.discountPrice !== undefined) {
                    discountPrice = override.discountPrice;
                }
            }

            priceMap[currency.code] = { price: finalPrice, discountPrice };
        });

        return {
            marginPercentage,
            priceGHS,
            priceMap,
            currencies, // Pass for UI to render
            selectedDiscount
        };

    }, [form, currencies, discounts]);

    const submitForm = async (values: ProductFormValues) => {
        try {
            setIsUploading(true);

            // 1. Upload Images
            const files = values.productImages.map(img => img.file).filter(file => file !== null) as File[];
            // In a real scenario, we'd map the returned URLs back to the correct image object indices
            // For this mock, we assume order is preserved and all valid files are uploaded
            const uploadedUrls = await uploadImagesToStorage(files);

            // 2. Prepare API Payload
            const calculation = calculatePricing();

            const payload: ProductApiPayload = {
                name: values.name,
                description: values.description,
                category: values.category,
                fitCategory: values.fitCategory,
                collection: values.collection || undefined,

                pricing: {
                    costPrice: values.pricing.costPrice,
                    projectedProfit: values.pricing.projectedProfit,
                    marginPercentage: calculation.marginPercentage,

                    priceGHS: calculation.priceGHS,
                    ...(values.pricing.discountId && { discountId: values.pricing.discountId }),

                    productPrices: calculation.currencies.map(c => {
                        const calc = calculation.priceMap[c.code];
                        return {
                            currencyCode: c.code,
                            price: calc.price,
                            discountPrice: calc.discountPrice
                        };
                    })
                },

                variants: values.variants.map(v => ({
                    name: v.name,
                    available: v.available
                })),

                images: values.productImages.map((img, index) => {
                    // Start with preview
                    let finalUrl = img.previewUrl || '';

                    // If it was a file that got uploaded, find its URL
                    // Logic: we filtered files. We need to find the index in 'files' array to get 'uploadedUrls' index.
                    // This is brittle. Better: upload returns map or we track it.
                    // Simple fix for now: assumption that ALL images in 'upload' form are new files.
                    if (img.file) {
                        // Find index of this file in the 'files' array we sent
                        const fileIndex = files.indexOf(img.file);
                        if (fileIndex !== -1 && uploadedUrls[fileIndex]) {
                            finalUrl = uploadedUrls[fileIndex];
                        }
                    }
                    return {
                        url: finalUrl,
                        alt: img.alt || `${values.name} - ${img.wearingVariant || 'View'} ${index + 1}`,
                        modelHeight: img.modelHeight,
                        wearingSize: img.wearingSize,
                        wearingVariant: values.variants.find(v => v.id === img.wearingVariant)?.name || img.wearingVariant
                    };
                }),

                frequentlyBoughtTogether: values.frequentlyBoughtTogether,

                newDrop: values.newDrop?.enabled ? {
                    enabled: true,
                    autoExpire: values.newDrop.autoExpire,
                    durationDays: values.newDrop.durationDays,
                    // Calculate expiry date if not manually provided?
                    // For now pass as is or let backend handle
                } : undefined,

                createdAt: new Date().toISOString()
            };

            // 3. Send to API
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to publish product");
            }

            // Navigate or reset
            toast.success("Product published successfully!");
            form.reset();

        } catch (error) {
            console.error(error);
            toast.error("Failed to publish product.");
        } finally {
            setIsUploading(false);
        }
    };

    return {
        form,
        isUploading,
        submitForm,
        calculatePricing,
        discounts,
        currencies,
        fitCategories,
        categories,
        collections,
        // Since we are calling calculatePricing inside the hook? No, calculatePricing returns data.
        // Wait, calculatePricing is a function. I should expose the *result* or let the component call it?
        // Pattern: useWatch in component triggers re-render. Hook exposes `calculatePricing`.
        // Better: Hook exposes `pricingData` state or Memo.
        // But `calculatePricing` is just a function.
        // Let's stick to exposing data.
    };
};
