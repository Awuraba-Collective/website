"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SizingDiagram } from "./SizingDiagram";

interface SizingTablesProps {
    fitCategories: any[];
    lengthStandards: any[];
}

export function SizingTables({ fitCategories, lengthStandards }: SizingTablesProps) {
    const [unit, setUnit] = useState<"inches" | "cm">("inches");
    const [view, setView] = useState<"front" | "back">("front");

    const convertValue = (val: string) => {
        if (!val || typeof val !== "string") return val;

        const parts = val.split("-").map(p => p.trim());
        const converted = parts.map(p => {
            const num = parseFloat(p);
            if (isNaN(num)) return p;
            return unit === "cm" ? (num * 2.54).toFixed(1) : p;
        });
        return converted.join(" - ");
    };

    return (
        <div className="space-y-12">
            {/* Controls */}
            <div className="flex justify-end border-b border-black/10 dark:border-white/10 pb-4">
                <div className="flex items-center space-x-2 text-sm font-medium">
                    <span className={unit === "inches" ? "text-black dark:text-white font-bold" : "text-neutral-400"}>IN</span>
                    <button
                        onClick={() => setUnit(u => u === "inches" ? "cm" : "inches")}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${unit === "inches" ? "bg-neutral-200 dark:bg-neutral-800" : "bg-black dark:bg-white"
                            }`}
                    >
                        <motion.div
                            className={`w-4 h-4 rounded-full shadow-sm ${unit === "inches" ? "bg-white dark:bg-black" : "bg-white dark:bg-black"
                                }`}
                            animate={{ x: unit === "inches" ? 0 : 24 }}
                        />
                    </button>
                    <span className={unit === "cm" ? "text-black dark:text-white font-bold" : "text-neutral-400"}>CM</span>
                </div>
            </div>

            {/* Layout */}
            <div className="flex flex-col lg:flex-row gap-12 items-start">

                {/* Left: Diagram & Highlight Box */}
                {/* Fixed sticky issue on mobile by adding `lg:` prefix and relative/top-0 defaults */}
                <div className="w-full lg:w-1/3 relative top-0 lg:sticky lg:top-32 space-y-8">
                    <div className="relative">
                        <SizingDiagram view={view} />
                    </div>

                    {/* View Switcher Controls */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setView("front")}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${view === "front"
                                ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200"
                                }`}
                        >
                            Front View
                        </button>
                        <button
                            onClick={() => setView("back")}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${view === "back"
                                ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200"
                                }`}
                        >
                            Back View
                        </button>
                    </div>

                    {/* Guidance Box */}
                    <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-lg text-sm border-l-4 border-black dark:border-white">
                        <h3 className="font-bold mb-2 uppercase tracking-wide">Between Sizes?</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            If your measurements fall between two sizes, we recommend sizing up for a more comfortable fit, or sizing down if you prefer a snug fit.
                        </p>
                    </div>
                </div>


                {/* Right: Tables */}
                <div className="w-full lg:w-2/3 space-y-16 overflow-hidden">

                    {fitCategories.map((category) => {
                        const isCardLayout = category.measurementLabels.length === 0;

                        if (isCardLayout) {
                            return (
                                <section key={category.id} className="space-y-6">
                                    <div className="">
                                        <h2 className="font-serif text-2xl text-black dark:text-white">{category.name}</h2>
                                        {category.description && (
                                            <p className="text-sm text-neutral-500 mt-1">{category.description}</p>
                                        )}
                                    </div>
                                    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4`}>
                                        {category.sizes.map((size: any) => (
                                            <div key={size.id} className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl text-center border border-neutral-100 dark:border-neutral-800">
                                                <span className="block font-bold mb-2 tracking-widest uppercase text-lg">{size.name}</span>
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

                        // Filter out UK Size from labels to render in body
                        const bodyLabels = category.measurementLabels.filter((l: string) => l !== "UK Size");

                        return (
                            <section key={category.id} className="space-y-6">
                                <div className="">
                                    <h2 className="font-serif text-2xl text-black dark:text-white">{category.name}</h2>
                                    {category.description && (
                                        <p className="text-sm text-neutral-500 mt-1">{category.description}</p>
                                    )}
                                </div>

                                <div className="overflow-x-auto -mx-4 lg:mx-0 pb-2">
                                    <table className="w-full text-center border-collapse text-sm min-w-[600px]">
                                        <thead className="bg-black text-white dark:bg-white dark:text-black uppercase text-[10px] font-bold tracking-widest">
                                            <tr>
                                                <th className="p-4 border border-neutral-800 dark:border-neutral-200 w-1/4 text-left whitespace-nowrap">Measurement</th>
                                                {category.sizes.map((size: any) => {
                                                    const ukSize = size.measurements["UK Size"];
                                                    return (
                                                        <th key={size.id} className="p-4 border border-neutral-800 dark:border-neutral-200 whitespace-nowrap">
                                                            <div className="text-sm lg:text-base mb-1">{size.name}</div>
                                                            {ukSize && (
                                                                <div className="text-[9px] opacity-80 font-normal normal-case">
                                                                    UK {ukSize}
                                                                </div>
                                                            )}
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody className="text-neutral-700 dark:text-neutral-300 font-medium">
                                            {bodyLabels.map((label: string, i: number) => (
                                                <tr
                                                    key={label}
                                                    className={`
                                                        ${i % 2 === 0 ? "bg-white dark:bg-black" : "bg-neutral-50 dark:bg-neutral-900"}
                                                    `}
                                                >
                                                    <td className="p-4 border border-neutral-200 dark:border-neutral-800 font-bold text-black dark:text-white uppercase text-[11px] tracking-wider text-left whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {label}
                                                        </div>
                                                    </td>
                                                    {category.sizes.map((size: any) => {
                                                        const measurements = size.measurements as Record<string, string>;
                                                        const value = measurements[label] || "-";
                                                        return (
                                                            <td key={size.id} className="p-4 border border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                                                                {convertValue(value)}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        );
                    })}

                    {/* Lengths Table */}
                    {lengthStandards && lengthStandards.length > 0 && (
                        <section className="pt-8">
                            <div className="mb-6">
                                <h2 className="font-serif text-2xl text-black dark:text-white inline-block mr-3">Height &amp; Length Guide</h2>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 mb-6">
                                    Our height options ensure your pieces fall exactly where they should. From dress lengths to sleeve proportions, we adjust each cut to complement your frame perfectly.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg text-center">
                                    <div className="font-bold text-sm uppercase mb-1">Petite</div>
                                    <div className="text-xs text-neutral-500">Under 5'3"</div>
                                </div>
                                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg text-center">
                                    <div className="font-bold text-sm uppercase mb-1">Regular</div>
                                    <div className="text-xs text-neutral-500">5'3" - 5'7"</div>
                                </div>
                                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg text-center">
                                    <div className="font-bold text-sm uppercase mb-1">Tall</div>
                                    <div className="text-xs text-neutral-500">5'7" +</div>
                                </div>
                            </div>



                            <div className="overflow-x-auto -mx-4 lg:mx-0 pb-2">
                                <table className="w-full text-center border-collapse text-sm sm:text-base min-w-[600px]">
                                    <thead className="bg-black text-white dark:bg-white dark:text-black uppercase text-[10px] font-bold tracking-widest">
                                        <tr>
                                            <th className="p-4 border border-neutral-800 dark:border-neutral-200 text-left whitespace-nowrap">Item / Part</th>
                                            <th className="p-4 border border-neutral-800 dark:border-neutral-200 whitespace-nowrap">Petite</th>
                                            <th className="p-4 border border-neutral-800 dark:border-neutral-200 whitespace-nowrap">Regular</th>
                                            <th className="p-4 border border-neutral-800 dark:border-neutral-200 whitespace-nowrap">Tall</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-700 dark:text-neutral-300 font-medium">
                                        {lengthStandards.map((std: any) => (
                                            <tr key={std.id} className="bg-white dark:bg-black border-b border-neutral-100 dark:border-neutral-900">
                                                <td className="p-4 border-l border-neutral-100 dark:border-neutral-900 font-bold text-left pl-6 uppercase text-[11px] tracking-wider text-black dark:text-white whitespace-nowrap">{std.part}</td>
                                                <td className="p-4 border-x border-neutral-100 dark:border-neutral-900 whitespace-nowrap">{convertValue(std.petite)}</td>
                                                <td className="p-4 border-x border-neutral-100 dark:border-neutral-900 whitespace-nowrap">{convertValue(std.regular)}</td>
                                                <td className="p-4 border-r border-neutral-100 dark:border-neutral-900 whitespace-nowrap">{convertValue(std.tall)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div >
    );
}
