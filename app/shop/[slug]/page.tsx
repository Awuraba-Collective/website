import { notFound } from 'next/navigation';
import { products } from '@/lib/shop-data';
import { ProductDetailClient } from '@/components/shop/ProductDetailClient';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
    const product = products.find(p => p.slug === params.slug);

    if (!product) {
        notFound();
    }

    return <ProductDetailClient product={product} />;
}
