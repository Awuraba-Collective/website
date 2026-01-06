import { notFound } from 'next/navigation';
import { shopService } from '@/services/shopService';
import { ProductDetailClient } from '@/components/shop/ProductDetailClient';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await shopService.getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    return <ProductDetailClient product={product} />;
}
