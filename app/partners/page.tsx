import Link from "next/link";
import { MoveRight } from "lucide-react";

export default function PartnersPage() {
    return (
        <div className="bg-white dark:bg-black w-full">
            {/* Hero */}
            <div className="relative overflow-hidden bg-neutral-900 py-32 text-center text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-black opacity-50" />
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <h1 className="font-serif text-4xl font-bold sm:text-6xl mb-6">
                        Partner With Us
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-neutral-300">
                        Join the future of African fashion. AWURABA is building a community of creators.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-24">

                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="font-serif text-3xl text-black dark:text-white">Why Partner with AWURABA?</h2>
                        <div className="space-y-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            <p>
                                We are evolving into a <strong>multi-vendor African fashion platform</strong>.
                                Our goal is to empower designers by providing a space to showcase your unique,
                                quality pieces to a wider audience without the hassle of managing your own logistics.
                            </p>
                            <p>
                                Whether you are an established brand or an emerging talent, we want to hear from you.
                            </p>
                        </div>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900 p-8 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                        <h3 className="font-serif text-2xl mb-4 text-black dark:text-white">Partner With Us</h3>
                        <p className="mb-6 text-sm text-neutral-500">
                            Our vision is to build a community of designers. If you are interested in joining our future multi-vendor platform:
                        </p>

                        <div className="space-y-4">
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Please send your inquiries to:
                            </p>
                            <a
                                href="mailto:helloawuraba@gmail.com"
                                className="block w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-md font-medium hover:opacity-90 transition-opacity text-center"
                            >
                                helloawuraba@gmail.com
                            </a>
                            <p className="text-xs text-center text-neutral-400 pt-2">
                                Click to open your email client
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
