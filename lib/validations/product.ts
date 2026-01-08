import { z } from "zod";

// Variant schema
const variantSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Variant name is required"),
    available: z.boolean(),
});

// Product image schema (for form state - File objects)
const productImageSchema = z.object({
    id: z.string(),
    file: z.instanceof(File).nullable(),
    previewUrl: z.string().nullable(),
    alt: z.string().optional(),
    modelHeight: z.string().optional(),
    wearingSize: z.string().optional(),
    wearingVariant: z.string().optional(),
});


// Pricing Schema (Form Layer)
const pricingInputSchema = z.object({
    costPrice: z.number().min(0.01, "Cost price must be greater than 0"),
    projectedProfit: z.number().min(0, "Projected profit must be 0 or greater"),

    // Discount selection
    discountId: z.string().optional(),
    showDiscount: z.boolean().optional(),

    // Currency overrides: Record<CurrencyCode, { price: number, discountPrice?: number }>
    // We'll manage this state separately or as a field
    currencyOverrides: z.record(z.string(), z.object({
        price: z.number(),
        discountPrice: z.number().optional()
    })).optional()
});

// New Drop Schema
const newDropSchema = z.object({
    enabled: z.boolean(),
    autoExpire: z.boolean(),
    durationDays: z.number().min(1).optional(),
});

// Main product form schema
export const productFormSchema = z.object({
    // Basic Info
    name: z.string().min(3, "Product name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Category is required"),
    fitCategory: z.string().min(1, "Fit category is required"),
    collection: z.string().optional(),

    // Pricing
    pricing: pricingInputSchema,

    // Variants (at least 1 required)
    variants: z.array(variantSchema).min(1, "At least one variant is required"),

    // Product Images (at least 1 required)
    productImages: z.array(productImageSchema).min(1, "At least one product image is required"),

    // Frequently Bought Together
    frequentlyBoughtTogether: z.array(z.string()).optional(),

    // New Drop
    newDrop: newDropSchema.optional(),
})
    .refine((data) => true, { message: "Validation pass" }) // Placeholder for complex validation
    .refine(
        (data) => {
            // If new drop is enabled with auto-expire, duration is required
            if (data.newDrop?.enabled && data.newDrop?.autoExpire) {
                return data.newDrop.durationDays && data.newDrop.durationDays > 0;
            }
            return true;
        },
        {
            message: "Duration is required when auto-expire is enabled",
            path: ["newDrop", "durationDays"],
        }
    );

// Infer TypeScript type from schema
export type ProductFormValues = z.infer<typeof productFormSchema>;

// API Payload type (Final structure sent to backend)
export interface ProductApiPayload {
    name: string;
    description: string;
    category: string;
    fitCategory: string;
    collection?: string;

    // Pricing (Multi-currency with pre-calculated values)
    pricing: {
        // Base costs (GHS)
        costPrice: number;
        projectedProfit: number;
        marginPercentage: number;   // (profit / cost) * 100

        // Base Price (GHS)
        priceGHS: number;

        // Discount configuration (optional)
        discountId?: string;

        // Final prices (per currency)
        productPrices: Array<{
            currencyCode: string;
            price: number;
            discountPrice?: number;
        }>;
    };

    // Variants
    variants: Array<{
        name: string;
        available: boolean;
    }>;

    // Media (uploaded to storage first, URLs provided)
    images: Array<{
        url: string;              // Storage bucket URL
        alt: string;              // Generated or provided
        modelHeight?: string;
        wearingSize?: string;
        wearingVariant?: string;  // Links to variant name
    }>;

    // Recommendations
    frequentlyBoughtTogether?: string[];  // Array of product IDs

    // New Drop Configuration
    newDrop?: {
        enabled: boolean;              // Manual toggle
        autoExpire: boolean;           // Auto-remove badge after duration
        expiresAt?: string;            // ISO date - when to remove badge
        durationDays?: number;         // e.g., 14 days (used to calculate expiresAt)
    };

    // Metadata
    createdAt: string;          // ISO timestamp
    updatedAt?: string;         // ISO timestamp
}
