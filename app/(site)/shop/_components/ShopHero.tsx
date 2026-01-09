export function ShopHero() {
    return (
        <div className="relative w-full bg-neutral-900 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-20">
                {/* Placeholder for hero background pattern/image */}
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-700 to-black"></div>
            </div>

            <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 text-center space-y-6">
                <span className="inline-block border border-white/30 px-3 py-1 text-[10px] tracking-[0.3em] uppercase backdrop-blur-sm font-bold">
                    Monthly Event
                </span>
                <h1 className="font-serif text-5xl md:text-7xl tracking-tight">
                    The 25<sup>th</sup> Drop
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-300 font-light leading-relaxed">
                    Exclusive discounts on our new pieces,
                    available for a limited time only.
                </p>
            </div>
        </div>
    );
}
