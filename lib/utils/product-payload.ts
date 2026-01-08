import { ProductFormValues, ProductApiPayload } from "@/lib/validations/product";

/**
 * Transforms form data into API payload
 * Note: In production, files should be uploaded to storage first
 * and this function should receive the uploaded URLs
 */
export async function transformToApiPayload(
    formData: ProductFormValues,
    uploadedImageUrls: string[] // URLs from storage bucket
): Promise<ProductApiPayload> {
    const { pricing } = formData;
    const { costPrice, projectedProfit, showDiscount, discount } = pricing;

    // Calculate pricing
    const priceGHS = costPrice + projectedProfit;
    const priceUSD = Math.ceil(priceGHS / 15);
    const marginPercentage = costPrice > 0 ? (projectedProfit / costPrice) * 100 : 0;

    // Calculate discount amounts if applicable
    let finalPriceGHS = priceGHS;
    let finalPriceUSD = priceUSD;
    let discountAmountGHS: number | undefined;
    let discountAmountUSD: number | undefined;

    if (showDiscount && discount) {
        if (discount.type === "percent") {
            discountAmountGHS = (priceGHS * discount.value) / 100;
        } else {
            discountAmountGHS = discount.value;
        }

        finalPriceGHS = Math.max(0, priceGHS - discountAmountGHS);
        finalPriceUSD = Math.ceil(finalPriceGHS / 15);
        // Approximation for display
        discountAmountUSD = priceUSD - finalPriceUSD;
    }

    // Calculate new drop expiry if applicable
    let newDropPayload: ProductApiPayload["newDrop"];
    if (formData.newDrop?.enabled) {
        const now = new Date();
        let expiresAt: string | undefined;

        if (formData.newDrop.autoExpire && formData.newDrop.durationDays) {
            const expiryDate = new Date(now);
            expiryDate.setDate(expiryDate.getDate() + formData.newDrop.durationDays);
            expiresAt = expiryDate.toISOString();
        }

        newDropPayload = {
            enabled: true,
            autoExpire: formData.newDrop.autoExpire,
            expiresAt,
            durationDays: formData.newDrop.durationDays,
        };
    } else {
        newDropPayload = undefined;
    }

    // Build the API payload
    const payload: ProductApiPayload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        fitCategory: formData.fitCategory,
        collection: formData.collection || undefined,

        pricing: {
            costPrice,
            projectedProfit,
            marginPercentage,
            priceGHS,
            priceUSD,
            discount: showDiscount && discount ? {
                type: discount.type,
                value: discount.value,
                startDate: discount.startDate,
                expiryDate: discount.expiryDate,
            } : undefined,
            finalPriceGHS,
            finalPriceUSD,
            discountAmountGHS,
            discountAmountUSD,
        },

        variants: formData.variants.map(v => ({
            name: v.name,
            available: v.available,
        })),

        images: formData.productImages.map((img, index) => ({
            url: uploadedImageUrls[index] || "", // Use uploaded URL
            alt: `${formData.name} - ${img.wearingVariant || 'Image'}`,
            modelHeight: img.modelHeight,
            wearingSize: img.wearingSize,
            wearingVariant: img.wearingVariant,
        })),

        frequentlyBoughtTogether: formData.frequentlyBoughtTogether,
        newDrop: newDropPayload,
        createdAt: new Date().toISOString(),
    };

    return payload;
}

/**
 * Dummy function to simulate file upload to storage
 * In production, this would upload to S3, Cloudinary, etc.
 */
export async function uploadImagesToStorage(files: (File | null)[]): Promise<string[]> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return dummy URLs (in production, these would be real storage URLs)
    return files.map((file, index) => {
        if (!file) return "";
        return `https://storage.example.com/products/${Date.now()}-${index}.jpg`;
    });
}
