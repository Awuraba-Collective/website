export const CURRENCY_SYMBOLS: Record<string, string> = {
    GHS: '₵',
    USD: '$',
    EUR: '€',
    GBP: '£',
};

export function formatPrice(amount: number, currency: string): string {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Calculate discounted price from base price and discount
 */
export function calculateDiscountedPrice(
    basePrice: number,
    discount: { type: 'PERCENTAGE' | 'FIXED_AMOUNT'; value: number } | null
): number | null {
    if (!discount) return null;

    if (discount.type === 'PERCENTAGE') {
        return Math.round(basePrice * (1 - discount.value / 100));
    }
    return Math.max(0, Math.round(basePrice - discount.value));
}

/**
 * Check if a discount is currently active
 */
export function isDiscountActive(discount: {
    isActive: boolean;
    startDate: Date | string;
    endDate?: Date | string | null;
} | null): boolean {
    if (!discount || !discount.isActive) return false;

    const now = new Date();
    const startDate = new Date(discount.startDate);
    const endDate = discount.endDate ? new Date(discount.endDate) : null;

    // If endDate is just a date string (no time), normalize it to the end of the day
    if (endDate && typeof discount.endDate === 'string' && !discount.endDate.includes('T')) {
        endDate.setHours(23, 59, 59, 999);
    }

    return startDate <= now && (!endDate || endDate >= now);
}

/**
 * Get product price for a specific currency with discount calculation
 */
export function getProductPrice(
    product: any,
    currency: string
): { price: number; discountPrice: number | null } {
    // Find price for currency
    const priceEntry = product.prices?.find((p: any) => p.currencyCode === currency);

    if (!priceEntry) {
        return { price: 0, discountPrice: null };
    }

    const basePrice = Number(priceEntry.price);

    // Calculate discount if active
    const discount = product.discount;
    let discountPrice = null;

    if (discount && isDiscountActive(discount)) {
        discountPrice = calculateDiscountedPrice(basePrice, {
            type: discount.type,
            value: Number(discount.value)
        });
    }

    return { price: basePrice, discountPrice };
}
