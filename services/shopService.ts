import { Product } from '@/types/shop';
import { products } from '@/lib/shop-data';

// This service mimics an API call. 
// Later, you can replace the implementation with Supabase ORM calls.
export const shopService = {
    getProducts: async (): Promise<Product[]> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        return products;
    },

    getProductBySlug: async (slug: string): Promise<Product | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return products.find(p => p.slug === slug);
    }
};
