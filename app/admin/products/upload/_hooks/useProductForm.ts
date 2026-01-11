import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema, type ProductFormValues, type ProductApiPayload } from '@/lib/validations/product';
import { uploadImagesToStorage } from '@/lib/utils/product-payload';
import { useState, useCallback, useEffect } from 'react';
import { toast } from "sonner";
import { useSearchParams, useRouter } from 'next/navigation';

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
    const [isLoadingProduct, setIsLoadingProduct] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const rawProductId = searchParams.get('id');
    const productId = rawProductId && rawProductId !== 'undefined' ? rawProductId : null;
    const [originalCreatedAt, setOriginalCreatedAt] = useState<string | null>(null);

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
    console.log(form.formState.errors);
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

                if (Array.isArray(currRes)) setCurrencies(currRes);
                if (Array.isArray(discRes)) setDiscounts(discRes);
                if (Array.isArray(fitCatRes)) {
                    setFitCategories(fitCatRes);
                    if (fitCatRes.length > 0 && !form.getValues('fitCategory') && !productId) {
                        form.setValue('fitCategory', fitCatRes[0].id);
                    }
                }
                if (Array.isArray(catRes)) setCategories(catRes);
                if (Array.isArray(collRes)) setCollections(collRes);

                // Load existing product if ID is present
                if (productId) {
                    setIsLoadingProduct(true);
                    const prodRes = await fetch(`/api/products/${productId}`);
                    if (prodRes.ok) {
                        const product = await prodRes.json();

                        setOriginalCreatedAt(product.createdAt);

                        // Calculate duration days if expiresAt is present
                        let durationDays = 14;
                        if (product.newDropExpiresAt && product.createdAt) {
                            const start = new Date(product.createdAt).getTime();
                            const end = new Date(product.newDropExpiresAt).getTime();
                            durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                        }

                        // Map product data to form values
                        // Get GHS price from prices array
                        const ghsPrice = product.prices?.find((p: any) => p.currencyCode === 'GHS');
                        const basePrice = ghsPrice ? Number(ghsPrice.price) : 0;
                        const costPrice = Number(product.costPrice) || 0;

                        form.reset({
                            name: product.name,
                            description: product.description || '',
                            category: product.categoryId || '',
                            fitCategory: product.fitCategoryId || '',
                            collection: product.collectionId || '',
                            pricing: {
                                costPrice: costPrice,
                                projectedProfit: basePrice - costPrice,
                                discountId: product.discountId || undefined,
                                currencyOverrides: undefined
                            },
                            variants: product.variants?.map((v: any) => ({
                                id: v.id,
                                name: v.name,
                                available: v.isAvailable
                            })) || [],
                            productImages: product.media?.map((img: any) => ({
                                id: img.id,
                                previewUrl: img.src,
                                file: null,
                                alt: img.alt || '',
                                modelHeight: img.modelHeight || '',
                                wearingSize: img.modelWearingSize || '',
                                wearingVariant: product.variants?.find((v: any) => v.name === img.modelWearingVariant)?.id || img.modelWearingVariant,
                                type: img.type || 'IMAGE'
                            })) || [],
                            frequentlyBoughtTogether: product.relatedProducts?.map((rp: any) => rp.id) || [],
                            newDrop: {
                                enabled: product.isNewDrop || false,
                                autoExpire: product.newDropAutoExpire || false,
                                durationDays: durationDays,
                            }
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to fetch form data", e);
            } finally {
                setIsLoadingProduct(false);
            }
        };
        fetchData();
    }, [productId, form]);

    // Calculate Pricing Logic
    const calculatePricing = useCallback((pricingInput?: ProductFormValues['pricing']) => {
        const { costPrice, projectedProfit, discountId, currencyOverrides } = pricingInput || form.getValues('pricing');

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
                // Use division for "Base per Target" rates (e.g. 15 GHS per 1 USD)
                finalPrice = Number((priceGHS / Number(currency.rate)).toFixed(2));
                // Standard retail rounding (e.g. ceil) if desired
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
                    // deduction = 50 / Rate
                    const fixedVal = Number(selectedDiscount.value);
                    const rate = Number(currency.rate);
                    // If USD rate is 15, then 50 GHS / 15 = 3.33 USD
                    deduction = fixedVal / rate;
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

    }, [currencies, discounts]);

    const submitForm = async (values: ProductFormValues) => {
        try {
            setIsUploading(true);

            // 1. Upload Images (Only those that have a new File object)
            const filesToUpload = values.productImages
                .filter(img => img.file instanceof File)
                .map(img => img.file) as File[];

            // Only call upload if there are new files
            const uploadedUrls = filesToUpload.length > 0
                ? await uploadImagesToStorage(filesToUpload)
                : [];

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
                    id: v.id.startsWith('new-') ? undefined : v.id,
                    name: v.name,
                    available: v.available
                })),

                images: values.productImages.map((img, index) => {
                    // 1. If we have a new file, it was uploaded already in Step 1
                    if (img.file instanceof File) {
                        const fileIndex = filesToUpload.indexOf(img.file);
                        if (fileIndex !== -1 && uploadedUrls[fileIndex]) {
                            return {
                                url: uploadedUrls[fileIndex],
                                alt: img.alt || `${values.name} - ${index + 1}`,
                                modelHeight: img.modelHeight || undefined,
                                wearingSize: img.wearingSize || undefined,
                                wearingVariant: values.variants.find(v => v.id === img.wearingVariant)?.name || img.wearingVariant || undefined,
                                type: img.type || 'IMAGE'
                            };
                        }
                    }

                    // 2. If it's an existing image (persisted URL)
                    return {
                        id: img.id.startsWith('new-') ? undefined : img.id,
                        url: img.previewUrl || '',
                        alt: img.alt || `${values.name} - ${index + 1}`,
                        modelHeight: img.modelHeight || undefined,
                        wearingSize: img.wearingSize || undefined,
                        wearingVariant: values.variants.find(v => v.id === img.wearingVariant)?.name || img.wearingVariant || undefined,
                        type: img.type || 'IMAGE'
                    };
                }),

                frequentlyBoughtTogether: values.frequentlyBoughtTogether,

                newDrop: values.newDrop?.enabled ? {
                    enabled: true,
                    autoExpire: values.newDrop.autoExpire,
                    durationDays: values.newDrop.durationDays,
                    expiresAt: new Date(new Date(originalCreatedAt || new Date()).getTime() + ((values.newDrop.durationDays || 14) * 24 * 60 * 60 * 1000)).toISOString()
                } : undefined,

                createdAt: originalCreatedAt || new Date().toISOString()
            };

            // 3. Send to API
            const res = await fetch(productId ? `/api/products/${productId}` : '/api/products', {
                method: productId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `Failed to ${productId ? 'update' : 'publish'} product`);
            }

            toast.success(`Product ${productId ? 'updated' : 'published'} successfully!`);
            if (!productId) {
                form.reset();
            } else {
                router.push('/admin/products');
            }

        } catch (error) {
            console.error(error);
            toast.error(`Failed to ${productId ? 'update' : 'publish'} product.`);
        } finally {
            setIsUploading(false);
        }
    };

    return {
        form,
        isUploading,
        isLoadingProduct,
        isEditMode: !!productId,
        submitForm,
        calculatePricing,
        discounts,
        currencies,
        fitCategories,
        categories,
        collections,
    };
};
