'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Product, Size, LooseSize, Length, } from '@/types/shop';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';
import { Check, ChevronRight, Info, Ruler, Share2, X } from 'lucide-react';
import Link from 'next/link';
import posthog from 'posthog-js';

// Sizing Data
const BODY_MEASUREMENTS = [
    { label: "Bust", xs: "30-33", s: "33-36", m: "36-39", l: "39-42", xl: "42-46", xxl: "46-50" },
    { label: "Waist", xs: "23-26", s: "26-29", m: "29-32", l: "32-36", xl: "36-40", xxl: "40-45" },
    { label: "Hip", xs: "34-37", s: "37-40", m: "40-43", l: "43-46", xl: "46-50", xxl: "50-54" },
    { label: "Thigh", xs: "20-22", s: "22-24", m: "24-26", l: "26-28", xl: "28-31", xxl: "31-34" },
];

const LENGTH_GUIDE = [
    { label: "Short Sleeve", petite: "6\"", regular: "7\"", tall: "8.5\"" },
    { label: "Long Sleeve", petite: "21\"", regular: "23\"", tall: "25\"" },
    { label: "Short Dress", petite: "35-37\"", regular: "38-40\"", tall: "41-42\"" },
    { label: "3/4 Dress", petite: "38-40\"", regular: "40-43\"", tall: "44-46\"" },
    { label: "Full Length", petite: "52-54\"", regular: "55-57\"", tall: "60-62\"" },
];

interface ProductDetailClientProps {
    product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
    const dispatch = useAppDispatch();

    // Selections
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0].name);
    const [selectedSize, setSelectedSize] = useState<Size | LooseSize | null>(null);
    const [selectedLength, setSelectedLength] = useState<Length>('Regular');

    // Custom Size Inputs
    const [customMeasurements, setCustomMeasurements] = useState({
        bust: '',
        waist: '',
        hips: '',
        height: '',
        additionalNotes: ''
    });

    // Note
    const [note, setNote] = useState('');

    const [activeImage, setActiveImage] = useState(0);
    const [activeGuide, setActiveGuide] = useState<'size' | 'length' | null>(null);

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast.error('Please select a size before adding to bag');
            return;
        }

        // Validate custom
        if (selectedSize === 'Custom') {
            if (!customMeasurements.bust || !customMeasurements.waist || !customMeasurements.hips) {
                toast.error('Please fill in your bust, waist, and hip measurements');
                return;
            }
        }

        dispatch(addToCart({
            id: `${product.id}-${selectedVariant}-${selectedSize}-${selectedLength}`,
            productId: product.id,
            name: product.name,
            price: product.discountPrice ?? product.price,
            image: product.images[0].src,
            selectedSize: selectedSize as Size,
            selectedLength,
            selectedVariant,
            fitCategory: product.fitCategory,
            customMeasurements: selectedSize === 'Custom' ? customMeasurements : undefined,
            note: note,
            quantity: 1,
        }));

        // PostHog: Track product added to cart
        posthog.capture('product_added_to_cart', {
            product_id: product.id,
            product_name: product.name,
            product_slug: product.slug,
            product_category: product.category,
            product_collection: product.collection,
            price: product.discountPrice ?? product.price,
            original_price: product.price,
            has_discount: !!product.discountPrice,
            selected_variant: selectedVariant,
            selected_size: selectedSize,
            selected_length: selectedLength,
            fit_category: product.fitCategory,
            is_custom_size: selectedSize === 'Custom',
            has_note: !!note,
            currency: 'GHS',
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
                product_category: product.category,
                share_method: shareMethod,
                price: product.discountPrice ?? product.price,
                currency: 'GHS',
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
    const relatedProducts = allProducts
        .filter((p: Product) => p.id !== product.id && (p.category === product.category || p.collection === product.collection))
        .slice(0, 4);

    const standardSizes: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];
    const looseSizes: LooseSize[] = ['S', 'M', 'L'];
    const sizes = product.fitCategory === 'Loose' ? looseSizes : standardSizes;
    const lengths: Length[] = ['Petite', 'Regular', 'Tall'];

    return (
        <div className="bg-white dark:bg-black min-h-screen text-black dark:text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-8 lg:mb-12 overflow-x-auto whitespace-nowrap pb-2">
                    <Link href="/shop" className="hover:text-black dark:hover:text-white transition-colors">Shop</Link>
                    <ChevronRight className="w-3 h-3 text-neutral-300" />
                    <Link href={`/shop?category=${product.category}`} className="hover:text-black dark:hover:text-white transition-colors uppercase">{product.category}</Link>
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
                                                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                                                            <th key={s} className="p-3 border border-neutral-700">{s}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {BODY_MEASUREMENTS.map((row, i) => (
                                                        <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-black" : "bg-neutral-50 dark:bg-neutral-900"}>
                                                            <td className="p-3 border border-neutral-200 dark:border-neutral-700 font-bold uppercase">{row.label}</td>
                                                            <td className="p-3 border border-neutral-200 dark:border-neutral-700">{row.xs}</td>
                                                            <td className="p-3 border border-neutral-200 dark:border-neutral-700">{row.s}</td>
                                                            <td className="p-3 border border-neutral-200 dark:border-neutral-700">{row.m}</td>
                                                            <td className="p-3 border border-neutral-200 dark:border-neutral-700">{row.l}</td>
                                                            <td className="p-3 border border-neutral-200 dark:border-neutral-700">{row.xl}</td>
                                                            <td className="p-3 border border-neutral-200 dark:border-neutral-700">{row.xxl}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {product.fitCategory === 'Loose' && (
                                                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-sm border border-neutral-100 dark:border-neutral-800">
                                                    <p className="text-[10px] uppercase tracking-widest font-bold mb-2">Loose (Bola) Fit Guide</p>
                                                    <div className="grid grid-cols-3 gap-4 text-center">
                                                        <div><span className="block font-bold">S</span><span className="text-[10px] text-neutral-500">Fits XS-S</span></div>
                                                        <div><span className="block font-bold">M</span><span className="text-[10px] text-neutral-500">Fits M-L</span></div>
                                                        <div><span className="block font-bold">L</span><span className="text-[10px] text-neutral-500">Fits XL-XXL</span></div>
                                                    </div>
                                                </div>
                                            )}
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
                                                    {LENGTH_GUIDE.map((row, i) => (
                                                        <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-black" : "bg-neutral-50 dark:bg-neutral-900"}>
                                                            <td className="p-3 border border-neutral-200 dark:border-neutral-700 font-bold text-left">{row.label}</td>
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
                            className="relative aspect-[3/4] bg-neutral-100 rounded-sm overflow-hidden border border-neutral-100 dark:border-neutral-800 cursor-zoom-in"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <Image
                                src={product.images[activeImage].src}
                                alt={product.images[activeImage].alt}
                                fill
                                className={`object-cover transition-transform duration-200 ${isHovering ? 'scale-[1.5]' : 'scale-100'}`}
                                style={isHovering ? {
                                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`
                                } : undefined}
                                priority
                            />
                        </div>
                        {product.modelInfo && (
                            <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-sm border border-neutral-100 dark:border-neutral-800">
                                <p className="text-xs uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                                    <Info className="w-3 h-3" /> Model Guide
                                </p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Model is <span className="font-medium text-black dark:text-white">{product.modelInfo.height}</span> wearing size <span className="font-medium text-black dark:text-white">{product.modelInfo.wearingSize}</span> in <span className="font-medium text-black dark:text-white font-serif">{product.modelInfo.wearingVariant}</span>.
                                </p>
                            </div>
                        )}
                        {product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`relative w-24 aspect-[3/4] flex-shrink-0 border-2 transition-all ${activeImage === idx ? 'border-black dark:border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <Image
                                            src={img.src}
                                            alt={img.alt}
                                            fill
                                            className="object-cover"
                                        />
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
                                    {product.discountPrice ? (
                                        <>
                                            <span className="text-4xl font-bold text-black dark:text-white">₵ {product.discountPrice.toFixed(2)}</span>
                                            <span className="text-lg text-neutral-400 line-through font-light">₵ {product.price.toFixed(2)}</span>
                                        </>
                                    ) : (
                                        <p className="text-3xl font-medium text-black dark:text-white">₵ {product.price.toFixed(2)}</p>
                                    )}
                                </div>

                                {product.discountEndsAt && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] uppercase tracking-[0.25em] font-black text-white bg-black dark:bg-white dark:text-black px-2 py-0.5">
                                            Limited Offer
                                        </span>
                                        <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-neutral-500">
                                            {(() => {
                                                const daysLeft = Math.ceil((new Date(product.discountEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
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
                                <span className="block text-sm font-bold uppercase tracking-wider mb-3">Variants: <span className="text-neutral-500 font-normal capitalize">{selectedVariant}</span></span>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((variant) => (
                                        <button
                                            key={variant.name}
                                            disabled={!variant.isAvailable}
                                            onClick={() => setSelectedVariant(variant.name)}
                                            className={`px-4 py-2 text-sm border transition-all relative ${selectedVariant === variant.name
                                                ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                                                : variant.isAvailable
                                                    ? 'border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400'
                                                    : 'border-neutral-200 text-neutral-300 dark:border-neutral-800 dark:text-neutral-600 cursor-not-allowed overflow-hidden'
                                                }`}
                                        >
                                            {variant.name}
                                            {!variant.isAvailable && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-full h-[1px] bg-neutral-300 dark:bg-neutral-700 rotate-[20deg]" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="block text-sm font-bold uppercase tracking-wider">Size {product.fitCategory === 'Loose' && <span className="text-[10px] font-normal text-neutral-500 ml-2">(Loose Fit Guide)</span>}</span>
                                    <button
                                        onClick={() => {
                                            setActiveGuide('size');
                                            // PostHog: Track size guide opened
                                            posthog.capture('size_guide_opened', {
                                                product_id: product.id,
                                                product_name: product.name,
                                                product_slug: product.slug,
                                                guide_type: 'size',
                                                fit_category: product.fitCategory,
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

                            {/* Custom Measurements Inputs */}
                            {selectedSize === 'Custom' && (
                                <div className="space-y-4 bg-neutral-50 dark:bg-neutral-900 p-6 rounded-md animate-in fade-in slide-in-from-top-4 duration-300">
                                    <h4 className="font-serif text-lg flex items-center gap-2">Custom Measurements <Info className="w-4 h-4 text-neutral-400" /></h4>
                                    <p className="text-xs text-neutral-500">Please provide your measurements in inches.</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Bust"
                                            className="p-3 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-sm w-full text-sm"
                                            value={customMeasurements.bust}
                                            onChange={(e) => setCustomMeasurements({ ...customMeasurements, bust: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Waist"
                                            className="p-3 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-sm w-full text-sm"
                                            value={customMeasurements.waist}
                                            onChange={(e) => setCustomMeasurements({ ...customMeasurements, waist: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Hips"
                                            className="p-3 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-sm w-full text-sm"
                                            value={customMeasurements.hips}
                                            onChange={(e) => setCustomMeasurements({ ...customMeasurements, hips: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Height (e.g. 5'7)"
                                            className="p-3 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-sm w-full text-sm"
                                            value={customMeasurements.height}
                                            onChange={(e) => setCustomMeasurements({ ...customMeasurements, height: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

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
                                                fit_category: product.fitCategory,
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

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-32">
                        <h2 className="font-serif text-3xl mb-12">You Might Also Like</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((p: Product) => (
                                <div key={p.id} className="group cursor-pointer" onClick={() => {
                                    // PostHog: Track related product clicked
                                    posthog.capture('related_product_clicked', {
                                        source_product_id: product.id,
                                        source_product_name: product.name,
                                        clicked_product_id: p.id,
                                        clicked_product_name: p.name,
                                        clicked_product_slug: p.slug,
                                        clicked_product_category: p.category,
                                        clicked_product_price: p.discountPrice ?? p.price,
                                        has_discount: !!p.discountPrice,
                                        currency: 'GHS',
                                    });
                                    window.location.href = `/shop/${p.slug}`;
                                }}>
                                    <div className="relative aspect-[3/4] overflow-hidden mb-4 rounded-sm bg-neutral-100">
                                        <Image src={p.images[0].src} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                    </div>
                                    <h3 className="text-sm font-medium">{p.name}</h3>
                                    <p className="text-sm">
                                        {p.discountPrice ? (
                                            <span className="flex gap-2">
                                                <span className="font-bold">₵ {p.discountPrice.toFixed(2)}</span>
                                                <span className="text-neutral-400 line-through">₵ {p.price.toFixed(2)}</span>
                                            </span>
                                        ) : (
                                            <span className="text-neutral-500">₵ {p.price.toFixed(2)}</span>
                                        )}
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
                    <p className="font-bold">₵ {(product.discountPrice ?? product.price).toFixed(2)}</p>
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
