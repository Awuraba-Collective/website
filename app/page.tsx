import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Heart, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative flex h-screen w-full flex-col items-center justify-center bg-neutral-900 px-4 text-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/fabrics.webp"
            alt="Awuraba Fabrics"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-6 px-4">
          <h1 className="font-serif text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl break-words">
            AWURABA
          </h1>
          <p className="mx-auto max-w-2xl text-base font-light tracking-wide text-neutral-200 sm:text-xl md:text-2xl">
            Curated elegant African ready-to-wear pieces for everyday life, special occasions, and everything in between.
          </p>
          <div className="pt-8">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold uppercase tracking-widest text-black transition-transform hover:scale-105 hover:bg-neutral-200"
            >
              Explore Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction / Brand Ethos */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <h2 className="font-serif text-3xl font-medium italic text-neutral-800 dark:text-neutral-200">
            "Dignity and grace should be accessible, not exclusive."
          </h2>
          <div className="h-px w-24 bg-black/10 dark:bg-white/10 mx-auto" />
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            AWURABA is a curated clothing line bringing unique, high-quality pieces to women across Ghana.
            We are building a future where African fashion is versatile, empowering, and clearly priced.
          </p>
        </div>
      </section>

      {/* What We Offer Highlights */}
      <section className="py-24 bg-neutral-50 dark:bg-neutral-900 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-black dark:text-white mb-4">What We Offer</h2>
            <p className="text-neutral-500 dark:text-neutral-400">Where Elegance meets Affordability.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Curated Collections",
                description: "5 unique styles released every month.",
                icon: <Star className="w-8 h-8 mb-4 opacity-80" />,
              },
              {
                title: "Versatile Styling",
                description: "Up to 3 color variations per style.",
                icon: <Heart className="w-8 h-8 mb-4 opacity-80" />,
              },
              {
                title: "Inclusive Sizing",
                description: "Standard sizes XS-XXL, with custom options available.",
                icon: <ShieldCheck className="w-8 h-8 mb-4 opacity-80" />,
              },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center p-8 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:shadow-lg transition-shadow">
                <div className="text-black dark:text-white">{item.icon}</div>
                <h3 className="font-serif text-xl font-medium mb-3 text-black dark:text-white">{item.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Monthly Drop Teaser */}
      <section className="py-32 px-4 text-center bg-black text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <h2 className="font-serif text-4xl sm:text-5xl">The 25th Drop</h2>
          <p className="text-neutral-300 text-lg">
            New collections drop on the 25th of every month.
            Shop during the launch window for exclusive discounted prices.
          </p>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 border-b border-white pb-1 hover:text-neutral-300 transition-colors"
          >
            Learn how it works <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
