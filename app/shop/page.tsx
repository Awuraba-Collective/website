import ShopClient from "@/components/shop/ShopClient";
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: "Shop All",
    description: "Explore the full collection of AWURABA. From statement dresses to versatile sets, find handcrafted African ready-to-wear pieces for every occasion.",
    keywords: ["Shop African dresses", "Handmade in Ghana", "African print clothing", "Ready-to-wear Ghana", "Modern African fashion"],
    openGraph: {
        title: "Shop All | AWURABA",
        description: "Explore the full collection of AWURABA. Handcrafted African ready-to-wear pieces.",
    }
};

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
            <ShopClient />
        </Suspense>
    );
}
