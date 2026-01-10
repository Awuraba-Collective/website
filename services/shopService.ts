import { SerializableProduct } from '@/types';

// This service fetches live product data from the database.
export const shopService = {
    getProducts: async (): Promise<SerializableProduct[]> => {
        try {
            const response = await fetch('/api/shop/all-products');
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error("ShopService.getProducts Error:", error);
            return [];
        }
    },

    getProductBySlug: async (slug: string): Promise<SerializableProduct | undefined> => {
        // detail page now uses direct prisma fetch in server component, 
        // but we'll keep this helper for other uses if needed
        try {
            const response = await fetch(`/api/products?slug=${slug}`);
            if (!response.ok) return undefined;
            const data = await response.json();
            return data.products?.[0]; // matching existing api response format
        } catch (error) {
            return undefined;
        }
    }
};
