'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product, Size, Length } from '@/types/shop';
import { useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { Check, ChevronRight, Ruler, Info } from 'lucide-react';

interface ProductDetailClientProps {
    product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
    const dispatch = useAppDispatch();

    // Selections
    const [selectedColor, setSelectedColor] = useState(product.colors[0]);
    const [selectedSize, setSelectedSize] = useState<Size | null>(null);
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

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }

        // Validate custom
        if (selectedSize === 'Custom') {
            if (!customMeasurements.bust || !customMeasurements.waist || !customMeasurements.hips) {
                alert('Please fill in your custom measurements');
                return;
            }
        }

        dispatch(addToCart({
            id: `${product.id}-${selectedColor}-${selectedSize}-${selectedLength}`, // Simple unique ID generation
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0].src,
            selectedSize,
            selectedLength,
            selectedColor,
            customMeasurements: selectedSize === 'Custom' ? customMeasurements : undefined,
            note: note,
            quantity: 1,
        }));

        alert('Added to cart!');
    };

    const sizes: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];
    const lengths: Length[] = ['Petite', 'Regular', 'Tall'];

    return (
        <div className="bg-white dark:bg-black min-h-screen text-black dark:text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-[3/4] bg-neutral-100 rounded-sm overflow-hidden border border-neutral-100 dark:border-neutral-800">
                            <Image
                                src={product.images[activeImage].src}
                                alt={product.images[activeImage].alt}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
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
                        <div className="mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-8">
                            <h1 className="font-serif text-4xl lg:text-5xl mb-2">{product.name}</h1>
                            <p className="text-xl text-neutral-600 dark:text-neutral-400">₵ {product.price.toFixed(2)}</p>
                        </div>

                        <div className="space-y-8 flex-grow">
                            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">
                                {product.description}
                            </p>

                            {/* Color */}
                            <div>
                                <span className="block text-sm font-bold uppercase tracking-wider mb-3">Color: <span className="text-neutral-500 font-normal capitalize">{selectedColor}</span></span>
                                <div className="flex flex-wrap gap-3">
                                    {product.colors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-4 py-2 text-sm border transition-all ${selectedColor === color
                                                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                                                    : 'border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400'
                                                }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="block text-sm font-bold uppercase tracking-wider">Size</span>
                                    <button className="text-xs underline text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1">
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
                                <span className="block text-sm font-bold uppercase tracking-wider mb-3">Length</span>
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
                                className="w-full bg-black text-white dark:bg-white dark:text-black py-4 uppercase tracking-widest font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                Add to Cart
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
