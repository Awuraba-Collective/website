'use client';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ProductForm } from './_components/ProductForm';
import { useSearchParams } from 'next/navigation';

export default function UploadPage() {
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');
    const isEditMode = !!productId;
    return (
        <div className="space-y-10 pb-20 max-w-[1200px] mx-auto px-4 min-h-screen pt-10">
            <Link href="/admin/products" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-black dark:hover:text-white transition-colors w-fit">
                <ChevronLeft className="w-3 h-3" />
                Back to Products
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-100 dark:border-neutral-900 pb-8">
                <div>
                    <h1 className="font-serif text-4xl font-bold text-black dark:text-white mb-2">
                        {isEditMode ? 'Edit Product' : 'Create Product'}
                    </h1>
                    <p className="text-neutral-500 font-light max-w-md text-sm">
                        {isEditMode
                            ? 'Adjust pricing, variants, and model specifications for this catalog item.'
                            : 'Define pricing, variants, and model specifications for your new release.'}
                    </p>
                </div>
            </div>

            <ProductForm />
        </div>
    );
}
