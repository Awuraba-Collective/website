import Image from "next/image";
import Link from "next/link";
import type { ProductWithRelations } from "@/types";

interface ProductCardProps {
  product: ProductWithRelations;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images[0];
  const hoverImage = product.images[1];
  const price = Number(product.price);
  const discountPrice = product.discountPrice
    ? Number(product.discountPrice)
    : null;

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 rounded-sm">
        {/* Main Image */}
        {mainImage && (
          <Image
            src={mainImage.src}
            alt={mainImage.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8+vZrPQAJDgNY5U8QkAAAAABJRU5ErkJggg=="
          />
        )}

        {/* Hover Image (if exists) */}
        {hoverImage && (
          <Image
            src={hoverImage.src}
            alt={hoverImage.alt}
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

        {/* Sale Badge */}
        {discountPrice && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm dark:bg-black/90 text-black dark:text-white text-[10px] px-2 py-1 uppercase tracking-[0.2em] font-bold border border-neutral-200 dark:border-neutral-800 shadow-sm">
            Sale
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1 text-center sm:text-left">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-white uppercase tracking-wide">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          {discountPrice ? (
            <>
              <span className="text-sm font-bold text-black dark:text-white">
                ₵ {discountPrice.toFixed(2)}
              </span>
              <span className="text-xs text-neutral-400 line-through font-medium">
                ₵ {price.toFixed(2)}
              </span>
            </>
          ) : (
            <p className="text-sm text-black dark:text-white font-semibold">
              ₵ {price.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
