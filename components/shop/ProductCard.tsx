import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/shop';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Link href={`/shop/${product.slug}`} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 rounded-sm">
                {/* Main Image */}
                <Image
                    src={product.images[0].src}
                    alt={product.images[0].alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Hover Image (if exists) */}
                {product.images[1] && (
                    <Image
                        src={product.images[1].src}
                        alt={product.images[1].alt}
                        fill
                        className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                )}

                {/* New Drop Badge */}
                {product.isNewDrop && (
                    <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 uppercase tracking-widest">
                        New Drop
                    </div>
                )}
            </div>

            <div className="mt-4 space-y-1 text-center sm:text-left">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white uppercase tracking-wide">
                    {product.name}
                </h3>
                <p className="text-sm text-neutral-500">
                    ₵ {product.price.toFixed(2)}
                </p>
            </div>
        </Link>
    );
}
