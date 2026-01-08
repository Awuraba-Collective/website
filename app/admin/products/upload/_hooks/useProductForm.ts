import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema, type ProductFormValues, type ProductApiPayload } from '@/lib/validations/product';
import { uploadImagesToStorage } from '@/lib/utils/product-payload';
import { useState, useCallback } from 'react';
import { toast } from "sonner";

// Constants for Pricing
const RATES = {
    USD: 15, // 1 USD = 15 GHS
};

export const useProductForm = () => {
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: '',
            description: '',
            category: '',
            fitCategory: 'Standard',
            collection: '',
            pricing: {
                costPrice: 0,
                projectedProfit: 0,
                showDiscount: false,
                discount: {
                    type: 'percent',
                    value: 0,
                    startDate: '',
                    expiryDate: '',
                },
            },
            variants: [
                { id: '1', name: 'Emerald Green', available: true },
                { id: '2', name: 'Midnight Black', available: true }
            ],
            productImages: [],
            frequentlyBoughtTogether: [],
            newDrop: {
                enabled: false,
                autoExpire: false,
                durationDays: 14,
            },
        },
    });

    const calculatePricing = useCallback(() => {
        const { costPrice, projectedProfit, showDiscount, discount } = form.getValues('pricing');

        const retailPriceGHS = costPrice + projectedProfit;
        const marginPercentage = costPrice > 0 ? (projectedProfit / costPrice) * 100 : 0;

        let discountAmountGHS = 0;
        if (showDiscount && discount) {
            if (discount.type === 'percent') {
                discountAmountGHS = retailPriceGHS * (discount.value / 100);
            } else {
                discountAmountGHS = discount.value;
            }
        }

        const finalPriceGHS = Math.max(0, retailPriceGHS - discountAmountGHS);

        // USD Calculations (Rounded up)
        const retailPriceUSD = Math.ceil(retailPriceGHS / RATES.USD);
        const finalPriceUSD = Math.ceil(finalPriceGHS / RATES.USD);
        // Approximation of discount in USD
        const discountAmountUSD = retailPriceUSD - finalPriceUSD;

        return {
            retailPriceGHS,
            finalPriceGHS,
            marginPercentage,
            discountAmountGHS,
            retailPriceUSD,
            finalPriceUSD,
            discountAmountUSD,
            actualProfitGHS: finalPriceGHS - costPrice
        };
    }, [form]);

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

                    priceGHS: calculation.retailPriceGHS,
                    priceUSD: calculation.retailPriceUSD,

                    discount: values.pricing.showDiscount && values.pricing.discount ? {
                        type: values.pricing.discount.type,
                        value: values.pricing.discount.value,
                        startDate: values.pricing.discount.startDate,
                        expiryDate: values.pricing.discount.expiryDate
                    } : undefined,

                    finalPriceGHS: calculation.finalPriceGHS,
                    finalPriceUSD: calculation.finalPriceUSD,

                    discountAmountGHS: values.pricing.showDiscount ? calculation.discountAmountGHS : undefined,
                    discountAmountUSD: values.pricing.showDiscount ? calculation.discountAmountUSD : undefined
                },

                variants: values.variants.map(v => ({
                    name: v.name,
                    available: v.available
                })),

                images: values.productImages.map((img, index) => ({
                    url: img.previewUrl || '', // Fallback, normally needs real URL
                    alt: `${values.name} - ${img.wearingVariant || 'View'} ${index + 1}`,
                    modelHeight: img.modelHeight,
                    wearingSize: img.wearingSize,
                    wearingVariant: img.wearingVariant
                })),

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

            console.log('Final Payload:', JSON.stringify(payload, null, 2));

            // Navigate or reset
            toast.success("Product published successfully!");
            // form.reset(); // Optional

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
        calculatePricing
    };
};
