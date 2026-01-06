import { MetadataRoute } from 'next';
import { shopService } from '@/services/shopService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://awuraba.co';

    // Static routes
    const staticRoutes = [
        '',
        '/shop',
        '/about',
        '/sizing',
        '/partners',
        '/faq',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic product routes
    const products = await shopService.getProducts();
    const productRoutes = products.map((product) => ({
        url: `${baseUrl}/shop/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes];
}
