'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Size, LooseSize, Length, } from '@/types/shop';
import type { SerializableProduct } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';
import { Check, ChevronRight, Info, Play, Ruler, Share2, X } from 'lucide-react';
import Link from 'next/link';
import posthog from 'posthog-js';
import { getProductPrice, formatPrice } from '@/lib/utils/currency';
import type { SerializableMeasurementType, SerializableLengthStandard, SerializableFitSize } from '@/types';

interface ProductDetailClientProps {
    product: Omit<SerializableProduct, 'relatedProducts' | 'fitCategory'> & {
        relatedProducts?: any[],
        fitCategory: {
            name: string;
            isStandard: boolean;
            sizes: SerializableFitSize[];
            measurementLabels?: string[];
        }
    };
    measurementTypes: SerializableMeasurementType[];
    lengthStandards: SerializableLengthStandard[];
}

export function ProductDetailClient({
    product,
    measurementTypes,
    lengthStandards,
}: ProductDetailClientProps) {
    const dispatch = useAppDispatch();

    // Selections
    const { currency } = useAppSelector((state) => state.shop);
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.name || "");
    const [selectedSize, setSelectedSize] = useState<Size | LooseSize | null>(null);
    const [selectedLength, setSelectedLength] = useState<Length>('Regular');

    // Note
    const [note, setNote] = useState('');

    const [activeImage, setActiveImage] = useState(0);
    const [activeGuide, setActiveGuide] = useState<'size' | 'length' | null>(null);

    // Reset active image when variant changes
    useEffect(() => {
        setActiveImage(0);
    }, [selectedVariant]);

    const { price, discountPrice } = getProductPrice(product, currency);

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast.error('Please select a size before adding to bag');
            return;
        }

        if (!selectedSize) {
            toast.error('Please select a size before adding to bag');
            return;
        }

        const { price: ghsPrice } = getProductPrice(product, 'GHS');
        const { price: usdPrice } = getProductPrice(product, 'USD');

        dispatch(addToCart({
            id: `${product.id}-${selectedVariant}-${selectedSize}-${selectedLength}`,
            productId: product.id,
            name: product.name,
            price: ghsPrice,
            priceUSD: usdPrice,
            image: activeMedia.find(m => m.type === 'IMAGE')?.src || activeMedia[0]?.src || "",
            selectedSize: selectedSize as Size,
            selectedLength,
            selectedVariant,
            fitCategory: (product.fitCategory as any)?.name || 'Standard',
            note: note,
            quantity: 1,
        }));

        // PostHog: Track product added to cart
        posthog.capture('product_added_to_cart', {
            product_id: product.id,
            product_name: product.name,
            product_slug: product.slug,
            product_category: (product.category as any)?.name,
            product_collection: (product.collection as any)?.name,
            price: currency === 'GHS' ? ghsPrice : usdPrice,
            original_price: currency === 'GHS' ? ghsPrice : usdPrice,
            selected_variant: selectedVariant,
            selected_size: selectedSize,
            selected_length: selectedLength,
            fit_category: (product.fitCategory as any)?.name || 'Standard',
            has_note: !!note,
            currency: currency,
        });

        toast.success(`${product.name} added to your bag!`);

        // Sophisticated feedback instead of alert
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 3000);
    };

    const handleShare = async () => {
        try {
            const canShare = typeof navigator.share === 'function';
            const shareMethod = canShare ? 'native_share' : 'clipboard_copy';

            if (canShare) {
                await navigator.share({
                    title: `AWURABA | ${product.name}`,
                    text: product.description,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
            }

            // PostHog: Track product shared
            posthog.capture('product_shared', {
                product_id: product.id,
                product_name: product.name,
                product_slug: product.slug,
                product_category: (product.category as any)?.name,
                share_method: shareMethod,
                price: discountPrice ?? price,
                currency: currency,
            });
        } catch (error) {
            console.error('Error sharing:', error);
            posthog.captureException(error);
        }
    };

    const [isAdded, setIsAdded] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setMousePos({ x, y });
    };

    const allProducts = useAppSelector(state => state.shop.products);

    // Recommendations Logic: FBT or Fallback
    const recommendations = (() => {
        if (product.relatedProducts && product.relatedProducts.length > 0) {
            return product.relatedProducts;
        }

        // Fallback: Randomly generated from same category
        const sameCategory = allProducts.filter(p => p.id !== product.id && (p.category as any)?.id === (product.category as any)?.id);
        return [...sameCategory].sort(() => 0.5 - Math.random()).slice(0, 4);
    })();

    const isFBT = product.relatedProducts && product.relatedProducts.length > 0;

    // Filter media by selected variant
    const activeMedia = (() => {
        const variantMedia = product.media.filter(m =>
            m.modelWearingVariant?.toLowerCase() === selectedVariant.toLowerCase() ||
            m.alt.toLowerCase().includes(selectedVariant.toLowerCase())
        );
        // Fallback to all media if no matches
        const finalMedia = variantMedia.length > 0 ? variantMedia : product.media;

        // Sort: Images first, then Videos
        return [...finalMedia].sort((a, b) => {
            if (a.type === 'IMAGE' && b.type === 'VIDEO') return -1;
            if (a.type === 'VIDEO' && b.type === 'IMAGE') return 1;
            return 0;
        });
    })();

    const sizes = product.fitCategory.sizes.map(s => s.name);
    const lengths: Length[] = ['Petite', 'Regular', 'Tall'];

    return (
        <div className="bg-white dark:bg-black min-h-screen text-black dark:text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-8 lg:mb-12 overflow-x-auto whitespace-nowrap pb-2">
                    <Link href="/shop" className="hover:text-black dark:hover:text-white transition-colors">Shop</Link>
                    <ChevronRight className="w-3 h-3 text-neutral-300" />
                    <Link href={`/shop?category=${(product.category as any)?.name}`} className="hover:text-black dark:hover:text-white transition-colors uppercase">{(product.category as any)?.name}</Link>
                    <ChevronRight className="w-3 h-3 text-neutral-300" />
                    <span className="text-black dark:text-white">{product.name}</span>
                </nav>

                <AnimatePresence>
                    {activeGuide && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setActiveGuide(null)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 shadow-2xl rounded-sm overflow-hidden"
                            >
                                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
                                    <h2 className="font-serif text-2xl uppercase tracking-tight">
                                        {activeGuide === 'size' ? 'Size Guide' : 'Length Guide'}
                                    </h2>
                                    <button
                                        onClick={() => setActiveGuide(null)}
                                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 overflow-x-auto">
                                    {activeGuide === 'size' ? (
                                        <div className="space-y-6">
                                            <table className="w-full text-center border-collapse text-xs">
                                                <thead className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold tracking-wider">
                                                    <tr>
                                                        <th className="p-3 border border-neutral-700">Size</th>
                                                        {product.fitCategory.sizes.some(s => s.standardMapping) && (
                                                            <th className="p-3 border border-neutral-700">Recommended Fit</th>
                                                        )}
                                                        {product.fitCategory.measurementLabels?.map((label: string) => (
                                                            <th key={label} className="p-3 border border-neutral-700">{label}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {product.fitCategory.sizes.map((row: any, i) => (
                                                        <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-black" : "bg-neutral-50 dark:bg-neutral-900"}>
                                                            <td className="p-3 border border-neutral-200 dark:border-neutral-700 font-bold uppercase">{row.name}</td>
                                                            {product.fitCategory.sizes.some(s => s.standardMapping) && (
                                                                <td className="p-3 border border-neutral-200 dark:border-neutral-700">{row.standardMapping || "-"}</td>
                                                            )}
                                                            {product.fitCategory.measurementLabels?.map((label: string) => (
                                                                <td key={label} className="p-3 border border-neutral-200 dark:border-neutral-700">
                                                                    {row.measurements?.[label] || "-"}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-sm text-center">
                                                    <span className="block font-bold text-[10px]">PETITE</span>
                                                    <span className="text-[10px] text-neutral-500">Under 5'3"</span>
                                                </div>
                                                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-sm text-center">
                                                    <span className="block font-bold text-[10px]">REGULAR</span>
                                                    <span className="text-[10px] text-neutral-500">5'3" to 5'7"</span>
                                                </div>
                                                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-sm text-center">
                                                    <span className="block font-bold text-[10px]">TALL</span>
                                                    <span className="text-[10px] text-neutral-500">5'7" +</span>
                                                </div>
                                            </div>
                                            <table className="w-full text-center border-collapse text-xs">
                                                <thead className="bg-black text-white dark:bg-white dark:text-black uppercase font-bold tracking-wider">
                                                    <tr>
                                                        <th className="p-3 border border-neutral-700 text-left">Category</th>
                                                        <th className="p-3 border border-neutral-700">Petite</th>
                                                        <th className="p-3 border border-neutral-700">Regular</th>
                                                        <th className="p-3 border border-neutral-700">Tall</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {lengthStandards.map((row, i) => (
                                                        <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-black" : "bg-neutral-50 dark:bg-neutral-900"}>
                                                            <td className="p-3 border border-neutral-200 dark:border-neutral-700 font-bold text-left">{row.part}</td>
                                                            <td className="p-3 border border-neutral-200 dark:border-neutral-700">{row.petite}</td>
                                                            <td className="p-3 border border-neutral-200 dark:border-neutral-700">{row.regular}</td>
                                                            <td className="p-3 border border-neutral-200 dark:border-neutral-700">{row.tall}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div
                            className="relative aspect-[3/4] bg-neutral-100 rounded-sm overflow-hidden border border-neutral-100 dark:border-neutral-800"
                            onMouseMove={activeMedia[activeImage]?.type === 'IMAGE' ? handleMouseMove : undefined}
                            onMouseEnter={() => activeMedia[activeImage]?.type === 'IMAGE' && setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            {activeMedia[activeImage]?.type === 'VIDEO' ? (
                                <video
                                    src={activeMedia[activeImage].src}
                                    controls
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Image
                                    src={activeMedia[activeImage]?.src || ''}
                                    alt={activeMedia[activeImage]?.alt || ''}
                                    fill
                                    className={`object-cover transition-transform duration-200 ${isHovering ? 'scale-[1.5]' : 'scale-100'}`}
                                    style={isHovering ? {
                                        transformOrigin: `${mousePos.x}% ${mousePos.y}%`
                                    } : undefined}
                                    priority
                                />
                            )}
                        </div>
                        {activeMedia[activeImage]?.modelHeight && (
                            <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-sm border border-neutral-100 dark:border-neutral-800">
                                <p className="text-xs uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                                    <Info className="w-3 h-3" /> Model Guide
                                </p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Model is <span className="font-medium text-black dark:text-white">{activeMedia[activeImage].modelHeight}</span> wearing size <span className="font-medium text-black dark:text-white">{activeMedia[activeImage].modelWearingSize}</span> in <span className="font-medium text-black dark:text-white font-serif">{activeMedia[activeImage].modelWearingVariant}</span>.
                                </p>
                            </div>
                        )}
                        {activeMedia.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {activeMedia.map((media, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`relative w-24 aspect-[3/4] flex-shrink-0 border-2 transition-all ${activeImage === idx ? 'border-black dark:border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        {media.type === 'VIDEO' ? (
                                            <div className="relative w-full h-full">
                                                <video
                                                    src={media.src}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center backdrop-blur-sm">
                                                        <Play className="w-4 h-4 text-black fill-black" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Image
                                                src={media.src}
                                                alt={media.alt}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info & Controls */}
                    <div className="flex flex-col h-full">
                        <div className="mb-10 border-b border-neutral-100 dark:border-neutral-900 pb-10">
                            <div className="flex justify-between items-start gap-4 mb-4">
                                <h1 className="font-serif text-4xl lg:text-5xl tracking-tight lowercase first-letter:uppercase">{product.name}</h1>
                                <button
                                    onClick={handleShare}
                                    className="p-2 rounded-full border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors group"
                                    title="Share product"
                                >
                                    <Share2 className="w-5 h-5 text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-baseline gap-4">
                                    {discountPrice ? (
                                        <>
                                            <span className="text-4xl font-bold text-black dark:text-white">{formatPrice(discountPrice, currency)}</span>
                                            <span className="text-lg text-neutral-400 line-through font-light">{formatPrice(price, currency)}</span>
                                        </>
                                    ) : (
                                        <p className="text-3xl font-medium text-black dark:text-white">{formatPrice(price, currency)}</p>
                                    )}
                                </div>

                                {product.discount?.endDate && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] uppercase tracking-[0.25em] font-black text-white bg-black dark:bg-white dark:text-black px-2 py-0.5">
                                            Limited Offer
                                        </span>
                                        <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-neutral-500">
                                            {(() => {
                                                const daysLeft = Math.ceil((new Date(product.discount.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                                return daysLeft > 0 ? `${daysLeft} days remaining at this price` : 'Ends soon';
                                            })()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-8 flex-grow">
                            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">
                                {product.description}
                            </p>

                            {/* Variants */}
                            <div>
                                <span className="block text-sm font-bold uppercase tracking-wider mb-3">Variant: <span className="text-neutral-500 font-normal capitalize">{selectedVariant}</span></span>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((variant) => {
                                        // Find the first IMAGE for this variant preview
                                        const variantPreview = product.media.find(img =>
                                            img.type === 'IMAGE' && (
                                                img.modelWearingVariant?.toLowerCase() === variant.name.toLowerCase() ||
                                                img.alt.toLowerCase().includes(variant.name.toLowerCase())
                                            )
                                        );

                                        return (
                                            <button
                                                key={variant.name}
                                                disabled={!variant.isAvailable}
                                                onClick={() => setSelectedVariant(variant.name)}
                                                className={`relative w-14 h-14 rounded-lg border-2 transition-all overflow-hidden ${selectedVariant === variant.name
                                                    ? 'border-black dark:border-white ring-2 ring-black dark:ring-white ring-offset-2'
                                                    : variant.isAvailable
                                                        ? 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                                                        : 'border-neutral-200 dark:border-neutral-800 cursor-not-allowed opacity-50'
                                                    }`}
                                                title={variant.name}
                                            >
                                                {variantPreview ? (
                                                    <Image
                                                        src={variantPreview.src}
                                                        alt={variant.name}
                                                        fill
                                                        className="object-cover scale-150"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                                                        <span className="text-[10px] font-bold text-neutral-400 uppercase text-center px-1">
                                                            {variant.name.substring(0, 3)}
                                                        </span>
                                                    </div>
                                                )}
                                                {!variant.isAvailable && (
                                                    <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center">
                                                        <div className="w-full h-[2px] bg-neutral-400 dark:bg-neutral-600 rotate-45" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Size */}
                            <div>
                                <div className="flex justify-between items-end">
                                    <span className="block text-sm font-bold uppercase tracking-wider mb-3">Size ({product.fitCategory.name})</span>
                                    <button
                                        onClick={() => {
                                            setActiveGuide('size');
                                            // PostHog: Track size guide opened
                                            posthog.capture('size_guide_opened', {
                                                product_id: product.id,
                                                product_name: product.name,
                                                product_slug: product.slug,
                                                guide_type: 'size',
                                                fit_category: product.fitCategory.name,
                                            });
                                        }}
                                        className="text-xs underline text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1 group"
                                    >
                                        <Ruler className="w-3 h-3" /> Size Guide
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`py-2 text-sm border transition-all uppercase ${selectedSize === size
                                                ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                                                : 'border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            {/* Length */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="block text-sm font-bold uppercase tracking-wider">Length</span>
                                    <button
                                        onClick={() => {
                                            setActiveGuide('length');
                                            // PostHog: Track size guide opened (length)
                                            posthog.capture('size_guide_opened', {
                                                product_id: product.id,
                                                product_name: product.name,
                                                product_slug: product.slug,
                                                guide_type: 'length',
                                                fit_category: product.fitCategory.name,
                                            });
                                        }}
                                        className="text-xs underline text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1 group"
                                    >
                                        <Ruler className="w-3 h-3" /> Length Guide
                                    </button>
                                </div>
                                <div className="flex gap-4">
                                    {lengths.map(len => (
                                        <label key={len} className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded-full border border-neutral-300 flex items-center justify-center ${selectedLength === len ? 'border-black dark:border-white' : ''}`}>
                                                {selectedLength === len && <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name="length"
                                                className="hidden"
                                                checked={selectedLength === len}
                                                onChange={() => setSelectedLength(len)}
                                            />
                                            <span className={`text-sm ${selectedLength === len ? 'font-medium' : 'text-neutral-500 group-hover:text-black dark:group-hover:text-white'}`}>{len}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Order Note */}
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-wider mb-2">Order Note (Optional)</label>
                                <textarea
                                    className="w-full p-3 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-sm text-sm min-h-[80px]"
                                    placeholder="Any special requests? e.g., 'Make it ankle length'"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>

                        </div>

                        <div className="pt-8 mt-8 border-t border-neutral-200 dark:border-neutral-800">
                            <button
                                onClick={handleAddToCart}
                                className={`w-full py-4 uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${isAdded
                                    ? 'bg-green-600 text-white'
                                    : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
                                    }`}
                            >
                                {isAdded ? (
                                    <>
                                        <Check className="w-5 h-5" /> Added to Bag
                                    </>
                                ) : 'Add to Bag'}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="mt-32">
                        <h2 className="font-serif text-3xl mb-12">
                            {isFBT ? 'Frequently Bought Together' : 'You Might Also Like'}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {(recommendations as SerializableProduct[]).map((p) => (
                                <div key={p.id} className="group cursor-pointer" onClick={() => {
                                    // PostHog: Track related product clicked
                                    posthog.capture('related_product_clicked', {
                                        source_product_id: product.id,
                                        source_product_name: product.name,
                                        clicked_product_id: p.id,
                                        clicked_product_name: p.name,
                                        clicked_product_slug: p.slug,
                                        clicked_product_category: (p.category as any)?.name,
                                        clicked_product_price: getProductPrice(p, currency).discountPrice ?? getProductPrice(p, currency).price,
                                        has_discount: !!getProductPrice(p, currency).discountPrice,
                                        currency: currency,
                                    });
                                    window.location.href = `/shop/${p.slug}`;
                                }}>
                                    <div className="relative aspect-[3/4] overflow-hidden mb-4 rounded-sm bg-neutral-100">
                                        {(() => {
                                            const imgSrc = p.media.find(m => m.type === 'IMAGE')?.src || p.media[0]?.src;
                                            return imgSrc ? (
                                                <Image src={imgSrc} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 text-xs uppercase tracking-widest font-bold">
                                                    No Image
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <h3 className="text-sm font-medium">{p.name}</h3>
                                    <p className="text-sm">
                                        {(() => {
                                            const { price: rp, discountPrice: rdp } = getProductPrice(p, currency);
                                            return rdp ? (
                                                <span className="flex gap-2">
                                                    <span className="font-bold">{formatPrice(rdp, currency)}</span>
                                                    <span className="text-neutral-400 line-through">{formatPrice(rp, currency)}</span>
                                                </span>
                                            ) : (
                                                <span className="text-neutral-500">{formatPrice(rp, currency)}</span>
                                            );
                                        })()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Sticky Buy Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800 p-4 z-50 flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
                <div className="flex-grow">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold line-clamp-1 mb-1">{product.name}</p>
                    <p className="font-bold">
                        {formatPrice(discountPrice ?? price, currency)}
                    </p>
                </div>
                <button
                    onClick={handleAddToCart}
                    className={`flex-grow h-12 uppercase tracking-widest text-xs font-bold transition-all px-6 ${isAdded
                        ? 'bg-green-600 text-white'
                        : 'bg-black text-white dark:bg-white dark:text-black'
                        }`}
                >
                    {isAdded ? 'Added' : 'Add to Bag'}
                </button>
            </div>
        </div>
    );
}
