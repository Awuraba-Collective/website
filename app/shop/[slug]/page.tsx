import { notFound } from 'next/navigation';
import { shopService } from '@/services/shopService';
import { ProductDetailClient } from '@/components/shop/ProductDetailClient';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await shopService.getProductBySlug(slug);

    if (!product) return {};

    return {
        title: product.name,
        description: product.description,
        openGraph: {
            title: `${product.name} | AWURABA`,
            description: product.description,
            images: [{ url: product.images[0].src }],
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description: product.description,
            images: [product.images[0].src],
        }
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await shopService.getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images.map(img => img.src),
        "description": product.description,
        "brand": {
            "@type": "Brand",
            "name": "AWURABA"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://awuraba.co/shop/${product.slug}`,
            "priceCurrency": "GHS",
            "price": product.discountPrice ?? product.price,
            "availability": product.variants.some(v => v.isAvailable)
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            "priceValidUntil": product.discountEndsAt ? new Date(product.discountEndsAt).toISOString().split('T')[0] : undefined
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetailClient product={product} />
        </>
    );
}
