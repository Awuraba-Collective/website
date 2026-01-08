'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";

// --- TYPES ---
interface SizeData {
    size: string;
    bust: string;
    waist: string;
    hips: string;
    thigh: string;
    back: string;
    underBust: string;
}

interface LengthData {
    part: string; // e.g., "Short Sleeve", "Dress (Maxi)"
    petite: string;
    regular: string;
    tall: string;
}

interface LooseFitData {
    looseSize: string; // S, M, L
    fitsStandard: string; // "XS - S"
}

// --- INITIAL DATA ---
const INITIAL_SIZES: SizeData[] = [
    { size: 'XS', bust: '30-33', waist: '23-26', hips: '34-37', thigh: '20-22', back: '14.5-15.5', underBust: '13-14' },
    { size: 'S', bust: '33-36', waist: '26-29', hips: '37-40', thigh: '22-24', back: '15-16', underBust: '13.5-14.5' },
    { size: 'M', bust: '36-39', waist: '29-32', hips: '40-43', thigh: '24-26', back: '15.5-16.5', underBust: '14-15' },
    { size: 'L', bust: '39-42', waist: '32-36', hips: '43-46', thigh: '26-28', back: '16-17', underBust: '14.5-15.5' },
    { size: 'XL', bust: '42-46', waist: '36-40', hips: '46-50', thigh: '28-31', back: '16.5-17.5', underBust: '15-16' },
    { size: 'XXL', bust: '46-50', waist: '40-45', hips: '50-54', thigh: '31-34', back: '17-18', underBust: '16-17' },
];

const INITIAL_LENGTHS: LengthData[] = [
    { part: "Short Sleeve", petite: "6", regular: "7", tall: "8.5" },
    { part: "Long Sleeve", petite: "21", regular: "23", tall: "25" },
    { part: "Short Length (Dress)", petite: "35-37", regular: "38-40", tall: "41-42" },
    { part: "3/4 Length (Dress)", petite: "38-40", regular: "40-43", tall: "44-46" },
    { part: "Full / Long Length", petite: "52-54", regular: "55-57", tall: "60-62" },
];

const INITIAL_LOOSE_FIT: LooseFitData[] = [
    { looseSize: 'S', fitsStandard: 'Standard XS - S' },
    { looseSize: 'M', fitsStandard: 'Standard M - L' },
    { looseSize: 'L', fitsStandard: 'Standard XL - XXL' },
];

export function SizingStandardsManager() {
    const [sizes, setSizes] = useState<SizeData[]>(INITIAL_SIZES);
    const [lengths, setLengths] = useState<LengthData[]>(INITIAL_LENGTHS);
    const [looseFit, setLooseFit] = useState<LooseFitData[]>(INITIAL_LOOSE_FIT);
    const [isDirty, setIsDirty] = useState(false);

    // --- SHARED HANDLERS ---
    const handleSave = () => {
        console.log("Saving All Standards:", { sizes, lengths, looseFit });
        setIsDirty(false);
    };

    // --- BODY MEASUREMENTS HANDLERS ---
    const handleSizeChange = (index: number, field: keyof SizeData, value: string) => {
        const newSizes = [...sizes];
        newSizes[index] = { ...newSizes[index], [field]: value };
        setSizes(newSizes);
        setIsDirty(true);
    };

    const handleAddSize = () => {
        setSizes([...sizes, { size: 'NEW', bust: '', waist: '', hips: '', thigh: '', back: '', underBust: '' }]);
        setIsDirty(true);
    };

    const handleRemoveSize = (index: number) => {
        const newSizes = sizes.filter((_, i) => i !== index);
        setSizes(newSizes);
        setIsDirty(true);
    };

    // --- LENGTH GUIDE HANDLERS ---
    const handleLengthChange = (index: number, field: keyof LengthData, value: string) => {
        const newLengths = [...lengths];
        newLengths[index] = { ...newLengths[index], [field]: value };
        setLengths(newLengths);
        setIsDirty(true);
    };

    const handleAddLength = () => {
        setLengths([...lengths, { part: 'New Item', petite: '', regular: '', tall: '' }]);
        setIsDirty(true);
    };

    const handleRemoveLength = (index: number) => {
        const newLengths = lengths.filter((_, i) => i !== index);
        setLengths(newLengths);
        setIsDirty(true);
    };


    // --- LOOSE FIT HANDLERS ---
    const handleLooseFitChange = (index: number, field: keyof LooseFitData, value: string) => {
        const newLoose = [...looseFit];
        newLoose[index] = { ...newLoose[index], [field]: value };
        setLooseFit(newLoose);
        setIsDirty(true);
    };

    const handleAddLooseFit = () => {
        setLooseFit([...looseFit, { looseSize: 'XL', fitsStandard: '' }]);
        setIsDirty(true);
    };

    const handleRemoveLooseFit = (index: number) => {
        const newLoose = looseFit.filter((_, i) => i !== index);
        setLooseFit(newLoose);
        setIsDirty(true);
    };


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-black dark:text-white font-serif uppercase tracking-widest text-sm">Size Guide Definitions</h3>
                    <p className="text-xs text-neutral-500">Manage all measurement standards for the sizing modal.</p>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="rounded-full text-[10px] font-black uppercase tracking-widest h-10 px-8 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black disabled:opacity-50 transition-all"
                >
                    <Save className="w-3 h-3 mr-2" />
                    {isDirty ? 'Save Changes' : 'Saved'}
                </Button>
            </div>

            <Tabs defaultValue="body" className="w-full">
                <TabsList className="bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-lg mb-6 h-auto w-fit">
                    <TabsTrigger value="body" className="text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm">Body Measurements</TabsTrigger>
                    <TabsTrigger value="length" className="text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm">Length Guide</TabsTrigger>
                    <TabsTrigger value="loose" className="text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm">Loose Fit Guide</TabsTrigger>
                </TabsList>

                {/* --- BODY MEASUREMENTS TAB --- */}
                <TabsContent value="body" className="space-y-4">
                    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-black overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 w-[60px]">Size</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 min-w-[80px]">Bust</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 min-w-[80px]">Waist</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 min-w-[80px]">Hips</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 min-w-[80px]">Thigh</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 min-w-[80px]">Back</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 min-w-[80px]">U-Bust</TableHead>
                                    <TableHead className="w-[40px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sizes.map((item, index) => (
                                    <TableRow key={index} className="border-neutral-100 dark:border-neutral-800">
                                        <TableCell>
                                            <Input
                                                value={item.size}
                                                onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                                                className="font-black h-9 text-xs bg-transparent border-transparent hover:border-neutral-200 focus:bg-white focus:border-neutral-200 transition-all p-2 w-full"
                                            />
                                        </TableCell>
                                        {['bust', 'waist', 'hips', 'thigh', 'back', 'underBust'].map((field) => (
                                            <TableCell key={field}>
                                                <Input
                                                    value={item[field as keyof SizeData]}
                                                    onChange={(e) => handleSizeChange(index, field as keyof SizeData, e.target.value)}
                                                    className="font-bold h-9 text-xs bg-transparent border-transparent hover:border-neutral-200 focus:bg-white focus:border-neutral-200 transition-all p-2 w-full"
                                                />
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveSize(index)}
                                                className="h-8 w-8 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleAddSize}
                        className="w-full border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white h-12 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add New Body Size
                    </Button>
                </TabsContent>

                {/* --- LENGTH GUIDE TAB --- */}
                <TabsContent value="length" className="space-y-4">
                    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-black">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 w-[200px]">Garment Part / Style</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Petite ({"<"}5'3")</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Regular (5'3" - 5'7")</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Tall ({">"}5'7")</TableHead>
                                    <TableHead className="w-[40px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lengths.map((item, index) => (
                                    <TableRow key={index} className="border-neutral-100 dark:border-neutral-800">
                                        <TableCell>
                                            <Input
                                                value={item.part}
                                                onChange={(e) => handleLengthChange(index, 'part', e.target.value)}
                                                className="font-black text-xs uppercase bg-transparent border-transparent hover:border-neutral-200 focus:bg-white focus:border-neutral-200 transition-all h-9"
                                            />
                                        </TableCell>
                                        {['petite', 'regular', 'tall'].map((field) => (
                                            <TableCell key={field}>
                                                <Input
                                                    value={item[field as keyof LengthData]}
                                                    onChange={(e) => handleLengthChange(index, field as keyof LengthData, e.target.value)}
                                                    className="font-bold h-9 text-xs bg-transparent border-transparent hover:border-neutral-200 focus:bg-white focus:border-neutral-200 transition-all"
                                                />
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveLength(index)}
                                                className="h-8 w-8 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleAddLength}
                        className="w-full border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white h-12 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add New Length Item
                    </Button>
                </TabsContent>

                {/* --- LOOSE FIT TAB --- */}
                <TabsContent value="loose" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {looseFit.map((item, index) => (
                            <div key={index} className="relative group border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-3 bg-white dark:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveLooseFit(index)}
                                    className="absolute top-2 right-2 h-6 w-6 text-neutral-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>

                                <Input
                                    value={item.looseSize}
                                    onChange={(e) => handleLooseFitChange(index, 'looseSize', e.target.value)}
                                    className="text-4xl font-black h-14 bg-transparent border-transparent hover:border-neutral-200 focus:bg-white focus:border-neutral-200 p-0"
                                />

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Corresponds To:</label>
                                    <Input
                                        value={item.fitsStandard}
                                        onChange={(e) => handleLooseFitChange(index, 'fitsStandard', e.target.value)}
                                        className="font-bold h-10 bg-white dark:bg-black"
                                    />
                                </div>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            onClick={handleAddLooseFit}
                            className="h-auto min-h-[160px] flex-col gap-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white rounded-xl text-neutral-400 hover:text-black dark:hover:text-white transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Add New Loose Fit</span>
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
