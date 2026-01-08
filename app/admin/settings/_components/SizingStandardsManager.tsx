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
import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

export function SizingStandardsManager() {
    const [sizes, setSizes] = useState<SizeData[]>([]);
    const [lengths, setLengths] = useState<LengthData[]>([]);
    const [looseFits, setLooseFits] = useState<LooseFitData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        fetchStandards();
    }, []);

    const fetchStandards = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/sizing-standards');
            const data = await res.json();
            if (res.ok) {
                setSizes(data.sizes || []);
                setLengths(data.lengths || []);
                setLooseFits(data.looseFits || []);
            } else {
                toast.error("Failed to load sizing standards");
            }
        } catch (error) {
            toast.error("Error fetching sizing standards");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const res = await fetch('/api/sizing-standards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sizes, lengths, looseFits }),
            });

            if (res.ok) {
                toast.success("Sizing standards saved successfully");
                setIsDirty(false);
            } else {
                toast.error("Failed to save sizing standards");
            }
        } catch (error) {
            toast.error("Error saving sizing standards");
        } finally {
            setIsSaving(false);
        }
    };

    // --- SHARED HANDLERS ---
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

    const handleLooseFitChange = (index: number, field: keyof LooseFitData, value: string) => {
        const newLoose = [...looseFits];
        newLoose[index] = { ...newLoose[index], [field]: value };
        setLooseFits(newLoose);
        setIsDirty(true);
    };

    const handleAddLooseFit = () => {
        setLooseFits([...looseFits, { looseSize: 'XL', fitsStandard: '' }]);
        setIsDirty(true);
    };

    const handleRemoveLooseFit = (index: number) => {
        const newLoose = looseFits.filter((_, i) => i !== index);
        setLooseFits(newLoose);
        setIsDirty(true);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Loading Sizing Standards...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                    className="rounded-full ml-auto text-[10px] font-black uppercase tracking-widest h-10 px-8 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black disabled:opacity-50 transition-all font-sans"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-3 h-3 mr-2" />
                            {isDirty ? 'Save Changes' : 'All Changes Saved'}
                        </>
                    )}
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
                                                className="font-black h-9 text-xs bg-transparent border-transparent hover:border-neutral-200 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-200 transition-all p-2 w-full"
                                            />
                                        </TableCell>
                                        {['bust', 'waist', 'hips', 'thigh', 'back', 'underBust'].map((field) => (
                                            <TableCell key={field}>
                                                <Input
                                                    value={item[field as keyof SizeData] || ''}
                                                    onChange={(e) => handleSizeChange(index, field as keyof SizeData, e.target.value)}
                                                    className="font-bold h-9 text-xs bg-transparent border-transparent hover:border-neutral-200 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-200 transition-all p-2 w-full"
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
                        className="w-full border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white h-12 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-all font-sans"
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
                                                className="font-black text-xs uppercase bg-transparent border-transparent hover:border-neutral-200 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-200 transition-all h-9"
                                            />
                                        </TableCell>
                                        {['petite', 'regular', 'tall'].map((field) => (
                                            <TableCell key={field}>
                                                <Input
                                                    value={item[field as keyof LengthData] || ''}
                                                    onChange={(e) => handleLengthChange(index, field as keyof LengthData, e.target.value)}
                                                    className="font-bold h-9 text-xs bg-transparent border-transparent hover:border-neutral-200 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-200 transition-all"
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
                        className="w-full border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white h-12 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-all font-sans"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add New Length Item
                    </Button>
                </TabsContent>

                {/* --- LOOSE FIT TAB --- */}
                <TabsContent value="loose" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {looseFits.map((item, index) => (
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
                                    className="text-4xl font-black h-14 bg-transparent border-transparent hover:border-neutral-200 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-200 p-0"
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
                            className="h-auto min-h-[160px] flex-col gap-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white rounded-xl text-neutral-400 hover:text-black dark:hover:text-white transition-all group font-sans"
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
