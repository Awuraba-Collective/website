import Link from "next/link";
import { MessageCircle } from "lucide-react";
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
    // Fetch all sizing data
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
                    <div className="space-y-6">
                        <h2 className="font-serif text-2xl text-black dark:text-white border-b border-black/10 dark:border-white/10 pb-2 text-center md:text-left">How to Choose Your Size</h2>
                        <ul className="space-y-4 text-neutral-600 dark:text-neutral-400 list-disc list-inside">
                            <li>Measure your <strong>bust, waist, and hips</strong> using a measuring tape.</li>
                            <li>Compare your measurements with our size chart below.</li>
                            <li><strong>Choose the size that fits your largest measurement.</strong></li>
                            <li>If one area falls into a larger size, <strong>size up for comfort</strong>.</li>
                        </ul>
                    </div>

                    <div className="space-y-6 text-center md:text-left">
                        <h2 className="font-serif text-2xl text-black dark:text-white border-b border-black/10 dark:border-white/10 pb-2">Size Ranges Explained</h2>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Our sizes are offered in <strong>ranges</strong> to accommodate different body shapes.
                            You may notice some measurements appear in more than one size. This is intentional and helps avoid “in-between size” issues.
                        </p>
                        <p className="font-medium text-black dark:text-white">
                            Always select your size based on your largest body measurement.
                        </p>
                    </div>
                </section>

                {/* Body Measurement Tables / Cards */}
                {fitCategories.map((category) => {
                    const isCardLayout = category.measurementLabels.length === 0;

                    if (isCardLayout) {
                        return (
                            <section key={category.id} className="space-y-6">
                                <div className="">
                                    <h2 className="font-serif text-2xl text-black dark:text-white text-center md:text-left">{category.name} Measurements</h2>
                                    {category.description && (
                                        <p className="text-sm text-neutral-500 mt-1">{category.description}</p>
                                    )}
                                </div>
                                <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(category.sizes.length, 3)} gap-4`}>
                                    {category.sizes.map((size) => (
                                        <div key={size.id} className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl text-center border border-neutral-100 dark:border-neutral-800">
                                            <span className="block font-bold mb-2 tracking-widest uppercase">{size.name}</span>
                                            {size.standardMapping && (
                                                <span className="block text-sm text-neutral-600 dark:text-neutral-400">
                                                    Fits {size.standardMapping.toLowerCase().includes("standard") ? size.standardMapping : `Standard ${size.standardMapping}`}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    }

                    return (
                        <section key={category.id} className="overflow-x-auto space-y-6">
                            <div className="">
                                <h2 className="font-serif text-2xl text-black dark:text-white text-center md:text-left">{category.name} Measurements (Inches)</h2>
                                {category.description && (
                                    <p className="text-sm text-neutral-500 mt-1">{category.description}</p>
                                )}
                            </div>

                            <table className="w-full text-center border-collapse text-sm sm:text-base">
                                <thead className="bg-black text-white dark:bg-white dark:text-black uppercase text-[10px] font-bold tracking-widest">
                                    <tr>
                                        <th className="p-4 border border-neutral-800 dark:border-neutral-200">Size</th>
                                        {category.sizes.map(size => (
                                            <th key={size.id} className="p-4 border border-neutral-800 dark:border-neutral-200">{size.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="text-neutral-700 dark:text-neutral-300 font-medium">
                                    {category.measurementLabels.map((label, i) => (
                                        <tr key={label} className={i % 2 === 0 ? "bg-white dark:bg-black" : "bg-neutral-50 dark:bg-neutral-900"}>
                                            <td className="p-4 border border-neutral-200 dark:border-neutral-800 font-bold text-black dark:text-white uppercase text-[11px] tracking-wider text-left">{label}</td>
                                            {category.sizes.map(size => {
                                                const measurements = size.measurements as Record<string, string>;
                                                return (
                                                    <td key={size.id} className="p-4 border border-neutral-200 dark:border-neutral-800">
                                                        {measurements[label] || "-"}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    );
                })}

                {/* Height & Proportions */}
                <section className="space-y-12">
                    <div className="max-w-full">
                        <h2 className="font-serif text-2xl text-black dark:text-white mb-4 text-center md:text-left">Height & Length Guide</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl text-center border border-neutral-100 dark:border-neutral-800">
                                <span className="block font-bold mb-2 tracking-widest uppercase ">PETITE</span>
                                <span className="block text-sm text-neutral-600 dark:text-neutral-400">Under 5'3"</span>
                            </div>
                            <div className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl text-center border border-neutral-100 dark:border-neutral-800">
                                <span className="block font-bold mb-2 tracking-widest uppercase">REGULAR</span>
                                <span className="block text-sm text-neutral-600 dark:text-neutral-400">5'3" to 5'7"</span>
                            </div>
                            <div className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl text-center border border-neutral-100 dark:border-neutral-800">
                                <span className="block font-bold mb-2 tracking-widest uppercase">TALL</span>
                                <span className="block text-sm text-neutral-600 dark:text-neutral-400">5'7" and above</span>
                            </div>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                            Our height options (Petite, Regular, Tall) ensure your pieces fall exactly where they should. From dress lengths to sleeve proportions, we adjust each cut to complement your frame perfectly.
                        </p>
                    </div>

                    {/* Lengths Table */}
                    {lengthStandards.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-center border-collapse text-sm sm:text-base">
                                <thead className="bg-black text-white dark:bg-white dark:text-black uppercase text-[10px] font-bold tracking-widest">
                                    <tr>
                                        <th className="p-4 border border-neutral-800 dark:border-neutral-200 text-left">Length Guide (Inches)</th>
                                        <th className="p-4 border border-neutral-800 dark:border-neutral-200">Petite</th>
                                        <th className="p-4 border border-neutral-800 dark:border-neutral-200">Regular</th>
                                        <th className="p-4 border border-neutral-800 dark:border-neutral-200">Tall</th>
                                    </tr>
                                </thead>
                                <tbody className="text-neutral-700 dark:text-neutral-300 font-medium">
                                    {lengthStandards.map((std, i) => (
                                        <tr key={std.id} className="bg-white dark:bg-black border-b border-neutral-100 dark:border-neutral-900">
                                            <td className="p-4 border-l border-neutral-100 dark:border-neutral-900 font-bold text-left pl-6 uppercase text-[11px] tracking-wider text-black dark:text-white">{std.part}</td>
                                            <td className="p-4 border-x border-neutral-100 dark:border-neutral-900">{std.petite || "-"}</td>
                                            <td className="p-4 border-x border-neutral-100 dark:border-neutral-900">{std.regular || "-"}</td>
                                            <td className="p-4 border-r border-neutral-100 dark:border-neutral-900">{std.tall || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

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
