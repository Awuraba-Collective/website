import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SizingTables } from "./_components/SizingTables";
import { Metadata } from 'next';
import { prisma } from "@/lib/database";


export const metadata: Metadata = {
    title: "Size Guidelines",
    description: "Find your perfect fit with the AWURABA size guide. Detailed measurements for all our handcrafted African ready-to-wear pieces.",
    openGraph: {
        title: "Size Guidelines | AWURABA",
        description: "Find your perfect fit with the AWURABA size guide.",
    }
};

export default async function SizingPage() {
    const [fitCategories, lengthStandards] = await Promise.all([
        prisma.fitCategory.findMany({
            include: {
                sizes: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { createdAt: 'asc' }
        }),
        prisma.lengthStandard.findMany({
            orderBy: { order: 'asc' }
        })
    ]);

    return (
        <div className="bg-white dark:bg-black w-full min-h-screen">
            <div className="bg-neutral-50 dark:bg-neutral-900 py-20 md:py-28 px-4 text-center">
                <h1 className="font-serif text-4xl font-bold md:text-6xl text-black dark:text-white">
                    Size Guidelines
                </h1>
                <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                    Finding the right fit makes all the difference. Our pieces are designed with comfort, movement, and elegant proportions in mind.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-16 space-y-20">

                {/* Intro / How to Choose */}
                <section className="grid md:grid-cols-2 gap-12 items-start">
                    <div className="space-y-6 md:order-last">
                        <h2 className="font-serif text-2xl text-black dark:text-white border-b border-black/10 dark:border-white/10 pb-2 text-center md:text-left">How to Choose Your Size</h2>
                        <ul className="space-y-4 text-neutral-600 dark:text-neutral-400 list-inside">
                            <li className="flex gap-3">
                                <span className="text-black dark:text-white">•</span>
                                <div>Measure your <strong>bust, waist, hips, etc.</strong> using a measuring tape.</div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-black dark:text-white">•</span>
                                <div>Compare your measurements with our size chart below.</div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-black dark:text-white">•</span>
                                <div><strong>Choose the size that fits your largest measurement.</strong></div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-black dark:text-white">•</span>
                                <div>If one area falls into a larger size, <strong>size up for comfort</strong>.</div>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-6 text-center md:text-left">
                        <h2 className="font-serif text-2xl text-black dark:text-white border-b border-black/10 dark:border-white/10 pb-2">Sizing Chart Explained</h2>
                        <ul className="space-y-4 text-neutral-600 dark:text-neutral-400 list-inside text-left">
                            <li className="flex gap-3">
                                <span className="text-black dark:text-white">•</span>
                                <div>
                                    <strong>Size Ranges:</strong> Our sizes are offered in ranges to comfortably accommodate different body shapes and avoid sizing issues.
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-black dark:text-white">•</span>
                                <div>
                                    <strong>Fit Categories:</strong> Depending on the style, we provide either our <strong>Standard Fit</strong> or <strong>Loose Fit</strong> scale to ensure the intended look.
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-black dark:text-white">•</span>
                                <div>
                                    <strong>Lengths:</strong> Our length chart guides various heights, but you can also leverage it to select a preferred length of a piece.
                                </div>
                            </li>

                        </ul>
                    </div>
                </section>

                <SizingTables fitCategories={fitCategories} lengthStandards={lengthStandards} />

                <section className="space-y-6 ">
                    <h2 className="font-serif text-2xl text-black dark:text-white text-center md:text-left border-b border-neutral-100 dark:border-neutral-900 pb-2">Important Notes</h2>
                    <ul className="space-y-6 text-sm text-neutral-600 dark:text-neutral-400 list-disc list-outside ml-4">
                        <li className="pl-2">
                            <strong className="text-black dark:text-white">Full Length Preference:</strong>{" "}
                            Full-length pieces are designed to skim the floor when worn with heels. If you prefer a shorter length (such as ankle length) or typically wear flats,{" "}
                            <span className="font-semibold text-black dark:text-white">
                                please include your preferred length in the order notes
                            </span>.
                        </li>

                        <li className="pl-2">
                            <strong className="text-black dark:text-white">Custom Measurements:</strong>{" "}
                            You’re welcome to share your specific measurements for a more personalized fit alongside your size selection. Simply include them in the order notes on the product details page.{" "}
                            <span className="font-semibold text-black dark:text-white">
                                Custom pieces are made according to the measurements provided
                            </span>, so fit outcomes depend on the accuracy of the details shared.
                        </li>

                        <li className="pl-2">
                            <strong className="text-black dark:text-white">Extended Sizes:</strong>{" "}
                            While our standard size chart goes up to XXL, we’re happy to create pieces in larger sizes through customization.{" "}
                            <span className="font-semibold text-black dark:text-white">
                                Please contact us directly
                            </span>{" "}
                            to place an order.
                        </li>
                    </ul>

                </section>

                <div className="text-center pt-12 border-t border-dashed border-black/20 dark:border-white/20">
                    <h3 className="font-serif text-xl mb-4 text-black dark:text-white">Still Unsure?</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                        We’re happy to help you choose the right size.
                    </p>
                    <Link
                        href="https://wa.me/233549726818"
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-10 py-4 rounded-full font-medium hover:opacity-80 transition-opacity uppercase tracking-widest text-xs"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Chat with us on WhatsApp
                    </Link>
                </div>

            </div>
        </div>
    );
}
