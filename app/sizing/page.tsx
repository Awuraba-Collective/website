import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function SizingPage() {
    return (
        <div className="bg-white dark:bg-black w-full min-h-screen">
            <div className="bg-neutral-50 dark:bg-neutral-900 py-24 px-4 text-center">
                <h1 className="font-serif text-4xl font-bold sm:text-5xl text-black dark:text-white">
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

                {/* Table 1: Body Measurements */}
                <section className="overflow-x-auto">
                    <div className="mb-6">
                        <h2 className="font-serif text-2xl text-black dark:text-white text-center md:text-left">Body Measurements (Inches)</h2>
                        <p className="text-sm text-neutral-500">Standard body measurements for each size.</p>
                    </div>

                    <table className="w-full text-center border-collapse text-sm sm:text-base">
                        <thead className="bg-black text-white dark:bg-white dark:text-black uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="p-3 border border-neutral-700">Size</th>
                                <th className="p-3 border border-neutral-700">XS</th>
                                <th className="p-3 border border-neutral-700">S</th>
                                <th className="p-3 border border-neutral-700">M</th>
                                <th className="p-3 border border-neutral-700">L</th>
                                <th className="p-3 border border-neutral-700">XL</th>
                                <th className="p-3 border border-neutral-700">XXL</th>
                            </tr>
                        </thead>
                        <tbody className="text-neutral-700 dark:text-neutral-300 font-medium">
                            {[
                                { label: "Bust", xs: "30-33", s: "33-36", m: "36-39", l: "39-42", xl: "42-46", xxl: "46-50" },
                                { label: "Waist", xs: "23-26", s: "26-29", m: "29-32", l: "32-36", xl: "36-40", xxl: "40-45" },
                                { label: "Hip", xs: "34-37", s: "37-40", m: "40-43", l: "43-46", xl: "46-50", xxl: "50-54" },
                                { label: "Thigh", xs: "20-22", s: "22-24", m: "24-26", l: "26-28", xl: "28-31", xxl: "31-34" },
                                { label: "Back", xs: "14.5-15.5", s: "15-16", m: "15.5-16.5", l: "16-17", xl: "16.5-17.5", xxl: "17-18" },
                                { label: "Under Bust", xs: "13-14", s: "13.5-14.5", m: "14-15", l: "14.5-15.5", xl: "15-16", xxl: "16-17" },
                            ].map((row, i) => (
                                <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-black" : "bg-neutral-50 dark:bg-neutral-900"}>
                                    <td className="p-3 border border-neutral-200 dark:border-neutral-700 font-bold text-black dark:text-white uppercase">{row.label}</td>
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
                </section>

                <section className="">
                    <h2 className="font-serif text-2xl text-black dark:text-white mb-4 text-center md:text-left">Loose (Bola) Outfits Guide</h2>
                    <div className="grid grid-cols-3 gap-6 text-center bg-neutral-50 dark:bg-neutral-900 p-8 rounded-xl">
                        <div className="space-y-2">
                            <span className="block text-2xl font-bold">S</span>
                            <span className="block text-sm text-neutral-600 dark:text-neutral-400">Fits Standard XS - S</span>
                        </div>
                        <div className="space-y-2">
                            <span className="block text-2xl font-bold">M</span>
                            <span className="block text-sm text-neutral-600 dark:text-neutral-400">Fits Standard M - L</span>
                        </div>
                        <div className="space-y-2">
                            <span className="block text-2xl font-bold">L</span>
                            <span className="block text-sm text-neutral-600 dark:text-neutral-400">Fits Standard XL - XXL</span>
                        </div>
                    </div>
                </section>

                {/* Height & Proportions */}
                <section className="space-y-8">
                    <div className="max-w-full">
                        <h2 className="font-serif text-2xl text-black dark:text-white mb-4 text-center md:text-left">Height & Length Guide</h2>
                        <div className="grid sm:grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-md text-center">
                                <span className="block font-bold mb-1">PETITE</span>
                                <span className="text-sm">Under 5'3"</span>
                            </div>
                            <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-md text-center">
                                <span className="block font-bold mb-1">REGULAR</span>
                                <span className="text-sm">5'3" to 5'7"</span>
                            </div>
                            <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-md text-center">
                                <span className="block font-bold mb-1">TALL</span>
                                <span className="text-sm">5'7" and above</span>
                            </div>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            Your height selection affects <strong>dress length and sleeve length</strong>.
                            Sleeves are adjusted to maintain proper proportions (Short sleeves are minimally adjusted, while 3/4 and long sleeves are extended for Taller fits).
                        </p>
                    </div>

                    {/* Table 2: Lengths */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse text-sm sm:text-base">
                            <thead className="bg-black text-white dark:bg-white dark:text-black uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="p-3 border border-neutral-700">Length Guide (Inches)</th>
                                    <th className="p-3 border border-neutral-700">Petite</th>
                                    <th className="p-3 border border-neutral-700">Regular</th>
                                    <th className="p-3 border border-neutral-700">Tall</th>
                                </tr>
                            </thead>
                            <tbody className="text-neutral-700 dark:text-neutral-300 font-medium">
                                {[
                                    { label: "Short Sleeve", petite: "7", regular: "7.5", tall: "8" },
                                    { label: "Long Sleeve", petite: "22", regular: "23", tall: "24" },
                                    { label: "Short Length (Dress)", petite: "30-33", regular: "33-36", tall: "36-39" },
                                    { label: "3/4 Length (Dress)", petite: "35-38", regular: "38-41", tall: "41-44" },
                                    { label: "Full / Long Length", petite: "44-47", regular: "47-50", tall: "50-53" },
                                ].map((row, i) => (
                                    <tr key={i} className="bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800">
                                        <td className="p-3 border border-neutral-200 dark:border-neutral-800 font-bold text-left pl-6">{row.label}</td>
                                        <td className="p-3 border border-neutral-200 dark:border-neutral-800">{row.petite}</td>
                                        <td className="p-3 border border-neutral-200 dark:border-neutral-800">{row.regular}</td>
                                        <td className="p-3 border border-neutral-200 dark:border-neutral-800">{row.tall}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>



                <section className="space-y-6 ">
                    <h2 className="font-serif text-2xl text-black dark:text-white text-center md:text-left">Important Notes</h2>
                    <ul className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400 list-disc list-outside ml-4">
                        <li>
                            <strong>Full Length Preference:</strong> Full length is designed to skim the floor when worn with heels.
                            If you prefer a different length (e.g., ankle length) or wear flats, please <strong>specify this in your order notes</strong>.
                        </li>
                        <li>
                            <strong>Custom Measurements:</strong> You are welcome to share your specific measurements/sizes for a potentially better fit.
                            However, please note that <strong>we do not take responsibility</strong> if the final outfit does not fit as expected based on self-provided measurements.
                        </li>
                        <li>
                            <strong>Extended Sizes:</strong> While our standard chart ends at XXL, we are happy to accommodate larger sizes via customization.
                            Please contact us directly to place an order.
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
                        className="inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-full font-medium hover:opacity-80 transition-opacity"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Chat with us on WhatsApp
                    </Link>
                </div>

            </div>
        </div>
    );
}
