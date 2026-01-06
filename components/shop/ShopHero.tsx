export function ShopHero() {
    return (
        <div className="relative w-full bg-neutral-900 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-20">
                {/* Placeholder for hero background pattern/image */}
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-700 to-black"></div>
            </div>

            <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 text-center space-y-6">
                <span className="inline-block border border-white/30 px-3 py-1 text-xs tracking-[0.2em] uppercase backdrop-blur-sm">
                    Limited Edition
                </span>
                <h1 className="font-serif text-5xl md:text-7xl">
                    The 25th Drop
                </h1>
                <p className="max-w-xl mx-auto text-lg text-neutral-300 font-light">
                    Exclusively designed pieces for the modern Awuraba.
                    Available for a limited time.
                </p>
            </div>
        </div>
    );
}
