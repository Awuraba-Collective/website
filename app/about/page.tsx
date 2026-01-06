import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="bg-white dark:bg-black w-full text-black dark:text-white">
            {/* Header */}
            <div className="bg-neutral-50 dark:bg-neutral-900 py-20 md:py-28 px-4 text-center">
                <h1 className="font-serif text-4xl font-bold md:text-6xl text-black dark:text-white">
                    Our Story
                </h1>
                <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
                    The heart and soul of AWURABA.
                </p>
            </div>

            <div className="max-w-5xl mx-auto px-6 pb-32 space-y-32 mt-16">

                {/* Brand Meaning */}
                <section className="text-center space-y-8 max-w-3xl mx-auto">
                    <div className="space-y-4">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">The Name</span>
                        <h2 className="font-serif text-6xl md:text-8xl">Awuraba</h2>
                        <p className="font-serif italic text-2xl text-neutral-500">/ɑː-wuu-rah-bah/</p>
                    </div>
                    <div className="space-y-6 text-lg md:text-xl font-light leading-relaxed">
                        <p>
                            It signifies <span className="font-medium">femininity, elegance, dignity, and grace</span>.
                        </p>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Although the name draws inspiration from the woman, our vision is boundless.
                            AWURABA is rooted in African identity while remaining modern, professional, and globally relevant.
                        </p>
                    </div>
                </section>

                {/* Positioning - Editorial Block */}
                <section className="relative py-20 px-6 border-y border-neutral-200 dark:border-neutral-800 text-center">
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-black px-4 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                        Our Positioning
                    </span>
                    <p className="font-serif text-3xl md:text-5xl leading-tight max-w-4xl mx-auto">
                        We sit at the unique intersection of <br className="hidden md:block" />
                        <span className="italic">Elegance</span> and <span className="italic">Affordability</span>.
                    </p>
                    <p className="mt-8 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        We believe that dignity and grace should be accessible to all, not inclusive to a few.
                    </p>
                </section>

                {/* Vision & Spirit - Two Column Narrative */}
                <section className="grid md:grid-cols-2 gap-16 md:gap-24 text-center md:text-left">
                    <div className="space-y-6">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 block mb-2">The Vision</span>
                        <h3 className="font-serif text-3xl md:text-4xl leading-tight">
                            A Curated Brand, <br /> Evolving into a Platform.
                        </h3>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            Today, AWURABA is a ready-to-wear fashion brand. In the future, we will grow into a
                            <strong className="text-black dark:text-white font-medium"> multi-vendor marketplace</strong>,
                            empowering other designers and connecting them with a global audience.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 block mb-2">The Spirit</span>
                        <h3 className="font-serif text-3xl md:text-4xl leading-tight">
                            Boundless & <br /> Inclusive.
                        </h3>
                        <div className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            <p>
                                While we currently focus on fits for women, our long-term goal is to expand into a platform for
                                <strong className="text-black dark:text-white font-medium"> all genders</strong>.
                            </p>
                            <p>
                                The "Awuraba" spirit serves as our foundation inspired by grace but it does not limit us.
                            </p>
                        </div>
                    </div>
                </section>

                {/* The 25th Drop - Highlight Feature */}
                <section className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-10 md:p-16 text-center md:text-left grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">The Ritual</span>
                        <h2 className="font-serif text-4xl md:text-6xl text-black dark:text-white">
                            The 25th Drop
                        </h2>
                        <div className="w-16 h-1 bg-black dark:bg-white mx-auto md:mx-0"></div>
                    </div>
                    <div className="space-y-6 text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        <p>
                            We operate on a unique monthly cycle. <strong>On the 25th of every month</strong>, we release a
                            brand new collection.
                        </p>
                        <p>
                            Shopping during the drop allows you to purchase these new styles at <strong>discounted launch prices</strong>.
                            After the drop period, items return to their regular pricing.
                        </p>

                    </div>
                </section>

                {/* Footer CTA */}
                <div className="text-center pt-16">
                    <Link
                        href="/partners"
                        className="group flex flex-col md:inline-flex items-center gap-3 text-lg font-serif italic hover:opacity-70 transition-opacity"
                    >
                        <span>Interested in our future platform?</span>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                            Become a partner <ArrowRight className="inline h-4 w-4" />
                        </span>
                    </Link>
                </div>

            </div>
        </div>
    );
}
