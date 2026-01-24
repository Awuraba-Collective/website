"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SizingDiagramProps {
    view?: "front" | "back";
}

export function SizingDiagram({ view = "front" }: SizingDiagramProps) {
    return (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-8 shadow-sm relative overflow-hidden transition-all duration-500">
            <div className="relative aspect-[1/2] w-full max-w-[280px] mx-auto my-2 overflow-hidden">
                <motion.div
                    key={view}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                >
                    <Image
                        src={view === "front" ? "/images/sizing-diagram-labeled.png" : "/images/sizing-diagram-scaled.png"}
                        alt={`Sizing Diagram - ${view} view`}
                        fill
                        className={cn("object-contain origin-center", view === "front" ? "left-10 scale-210" : "scale-150")}
                    />
                </motion.div>
            </div>

            {/* View Label (Optional, but helpful) */}
            <div className="absolute bottom-4 left-0 right-0 text-center text-xs font-bold uppercase text-neutral-400 tracking-widest">
                {view} View
            </div>
        </div>
    );
}
