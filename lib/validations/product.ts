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
    modelHeight: z.string().optional(),
    wearingSize: z.string().optional(),
    wearingVariant: z.string().optional(),
});

// Discount schema
const discountSchema = z.object({
    type: z.enum(["percent", "fixed"]),
    value: z.number().min(0, "Discount value must be positive"),
    startDate: z.string().optional(),
    expiryDate: z.string().optional(),
});

// New Drop schema
const newDropSchema = z.object({
    enabled: z.boolean(),
    autoExpire: z.boolean(),
    durationDays: z.number().optional(),
    expiresAt: z.string().optional(),
});

// Pricing Schema (Form Layer)
// We keep some calculated fields out of the user input schema, 
// but we group the inputs logically.
const pricingInputSchema = z.object({
    costPrice: z.number().min(0.01, "Cost price must be greater than 0"),
    projectedProfit: z.number().min(0, "Projected profit must be 0 or greater"),
    // Discount configuration
    showDiscount: z.boolean(),
    discount: discountSchema.optional(),
});

// Main product form schema
export const productFormSchema = z.object({
    // Basic Info
    name: z.string().min(3, "Product name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Category is required"),
    fitCategory: z.enum(["Standard", "Loose"], {
        required_error: "Fit category is required",
    }),
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
    .refine(
        (data) => {
            // If discount is enabled, validate discount fields
            if (data.pricing.showDiscount && data.pricing.discount) {
                return data.pricing.discount.value > 0;
            }
            return true;
        },
        {
            message: "Discount value must be greater than 0 when discount is enabled",
            path: ["pricing", "discount", "value"],
        }
    )
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
    fitCategory: "Standard" | "Loose";
    collection?: string;

    // Pricing (Multi-currency with pre-calculated values)
    pricing: {
        // Base costs (GHS)
        costPrice: number;
        projectedProfit: number;
        marginPercentage: number;   // (profit / cost) * 100

        // Retail prices (before discount)
        priceGHS: number;            // cost + profit
        priceUSD: number;            // Math.ceil(priceGHS / 15)

        // Discount configuration (optional)
        discount?: {
            type: "percent" | "fixed";
            value: number;
            startDate?: string;        // ISO date
            expiryDate?: string;       // ISO date
        };

        // Final prices (after discount, if applicable)
        finalPriceGHS: number;       // priceGHS - discount (or same if no discount)
        finalPriceUSD: number;       // Math.ceil(finalPriceGHS / 15)

        // Calculated discount amounts (for display)
        discountAmountGHS?: number;  // Only if discount exists
        discountAmountUSD?: number;  // Only if discount exists
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
