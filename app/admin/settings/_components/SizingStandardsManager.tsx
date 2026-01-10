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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Loader2, ChevronRight, Ruler, X } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";

// --- TYPES ---
interface FitSize {
    id?: string;
    name: string;
    standardMapping?: string;
    measurements: Record<string, string>; // Dynamic: { "Bust": "34-36" }
    order: number;
}

interface FitCategory {
    id: string;
    name: string;
    slug: string;
    isStandard: boolean;
    description?: string;
    measurementLabels: string[]; // e.g. ["Bust", "Waist"]
    sizes: FitSize[];
}

interface LengthData {
    part: string;
    petite: string;
    regular: string;
    tall: string;
}

export function SizingStandardsManager() {
    const [fitCategories, setFitCategories] = useState<FitCategory[]>([]);
    const [globalMeasurementTypes, setGlobalMeasurementTypes] = useState<{ id: string, name: string }[]>([]);
    const [lengths, setLengths] = useState<LengthData[]>([]);
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        fetchStandards();
        fetchGlobalTypes();
    }, []);

    const fetchGlobalTypes = async () => {
        try {
            const res = await fetch('/api/measurement-types');
            const data = await res.json();
            if (res.ok) setGlobalMeasurementTypes(data);
        } catch (e) { console.error(e); }
    };

    const fetchStandards = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/sizing-standards');
            const data = await res.json();
            if (res.ok) {
                // Ensure measurements is at least an empty object for each size
                const categories = (data.fitCategories || []).map((cat: any) => ({
                    ...cat,
                    measurementLabels: cat.measurementLabels || [],
                    sizes: (cat.sizes || []).map((s: any) => ({
                        ...s,
                        measurements: s.measurements || {}
                    }))
                }));
                setFitCategories(categories);
                setLengths(data.lengths || []);
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
                body: JSON.stringify({ fitCategories, lengths }),
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

    // --- FIT SCALE HANDLERS ---
    const updateActiveCategory = (updates: Partial<FitCategory>) => {
        const newCats = [...fitCategories];
        newCats[activeCategoryIndex] = { ...newCats[activeCategoryIndex], ...updates };
        setFitCategories(newCats);
        setIsDirty(true);
    };

    const addMeasurementColumn = (label?: string) => {
        const activeCategory = fitCategories[activeCategoryIndex];
        const currentLabels = activeCategory.measurementLabels;

        let finalLabel = label;

        if (!finalLabel) {
            const extra = prompt("Enter custom measurement name:");
            if (!extra) return;
            finalLabel = extra;
        }

        if (currentLabels.includes(finalLabel)) {
            toast.error("Column already exists");
            return;
        }

        const newCats = [...fitCategories];
        newCats[activeCategoryIndex].measurementLabels = [...currentLabels, finalLabel];
        setFitCategories(newCats);
        setIsDirty(true);
    };

    const removeMeasurementColumn = (label: string) => {
        if (!confirm(`Are you sure you want to remove the "${label}" column? This will hide the values, but they will remain in the database until you save.`)) return;

        const newCats = [...fitCategories];
        const cat = newCats[activeCategoryIndex];
        cat.measurementLabels = cat.measurementLabels.filter(l => l !== label);
        setFitCategories(newCats);
        setIsDirty(true);
    };

    const updateSize = (sizeIndex: number, updates: Partial<FitSize>) => {
        const newCats = [...fitCategories];
        const category = newCats[activeCategoryIndex];
        const newSizes = [...category.sizes];
        newSizes[sizeIndex] = { ...newSizes[sizeIndex], ...updates };
        category.sizes = newSizes;
        setFitCategories(newCats);
        setIsDirty(true);
    };

    const updateMeasurement = (sizeIndex: number, label: string, value: string) => {
        const newCats = [...fitCategories];
        const category = newCats[activeCategoryIndex];
        const newSizes = [...category.sizes];
        const size = { ...newSizes[sizeIndex] };
        size.measurements = { ...size.measurements, [label]: value };
        newSizes[sizeIndex] = size;
        category.sizes = newSizes;
        setFitCategories(newCats);
        setIsDirty(true);
    };

    const addSize = () => {
        const newCats = [...fitCategories];
        const category = newCats[activeCategoryIndex];
        category.sizes = [...category.sizes, { name: 'New', order: category.sizes.length, measurements: {} }];
        setFitCategories(newCats);
        setIsDirty(true);
    };

    const removeSize = (index: number) => {
        const newCats = [...fitCategories];
        const category = newCats[activeCategoryIndex];
        category.sizes = category.sizes.filter((_, i) => i !== index);
        setFitCategories(newCats);
        setIsDirty(true);
    };

    // --- LENGTH HANDLERS ---
    const handleLengthChange = (index: number, field: keyof LengthData, value: string) => {
        const newLengths = [...lengths];
        newLengths[index] = { ...newLengths[index], [field]: value };
        setLengths(newLengths);
        setIsDirty(true);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Loading Sizing Interface...</p>
            </div>
        );
    }

    const activeCategory = fitCategories[activeCategoryIndex];

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold font-serif uppercase tracking-tight">Sizing Standards</h2>
                    <p className="text-xs text-neutral-500">Configure fit scales and dynamic measurement charts.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                    className="rounded-full text-[10px] font-black uppercase tracking-widest h-10 px-8 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black disabled:opacity-50 transition-all font-sans"
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

            <Tabs defaultValue="scales" className="w-full">
                <TabsList className="bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-lg mb-8 h-auto w-fit">
                    <TabsTrigger value="scales" className="text-[10px] uppercase font-black tracking-widest px-6 py-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm">Fit Scales</TabsTrigger>
                    <TabsTrigger value="length" className="text-[10px] uppercase font-black tracking-widest px-6 py-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm">Length Guide</TabsTrigger>
                </TabsList>

                {/* --- FIT SCALES TAB --- */}
                <TabsContent value="scales" className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar: Categories */}
                        <div className="lg:col-span-1 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4 px-2">Active Fits</p>
                            {fitCategories.map((cat, idx) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategoryIndex(idx)}
                                    className={clsx(
                                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                                        activeCategoryIndex === idx
                                            ? "bg-black text-white border-black shadow-lg dark:bg-white dark:text-black dark:border-white"
                                            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white"
                                    )}
                                >
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest">{cat.name}</p>
                                        <p className={clsx("text-[10px] opacity-60", activeCategoryIndex === idx ? "text-white dark:text-black" : "text-neutral-500")}>
                                            {cat.sizes.length} Sizes Defined
                                        </p>
                                    </div>
                                    <ChevronRight className={clsx("w-4 h-4", activeCategoryIndex === idx ? "opacity-100" : "opacity-0")} />
                                </button>
                            ))}
                        </div>

                        {/* Main Content: Sizes for Active Category */}
                        <div className="lg:col-span-3 space-y-6">
                            {activeCategory && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mb-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Category Name</Label>
                                                <Input
                                                    value={activeCategory.name}
                                                    onChange={(e) => updateActiveCategory({ name: e.target.value })}
                                                    className="font-black h-12 text-sm bg-white dark:bg-black"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-4 h-full pt-6">
                                                <Switch
                                                    id="isStandard"
                                                    checked={activeCategory.isStandard}
                                                    onCheckedChange={(checked) => updateActiveCategory({ isStandard: checked })}
                                                />
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="isStandard" className="text-xs font-black uppercase tracking-widest">Standard Fit Scale</Label>
                                                    <p className="text-[10px] text-neutral-500">Uses direct body measurements primarily.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-black">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 w-[80px]">Size</TableHead>
                                                    {!activeCategory.isStandard && (
                                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 min-w-[150px]">Mapping</TableHead>
                                                    )}
                                                    {activeCategory.measurementLabels.map((label) => (
                                                        <TableHead key={label} className="text-[10px] font-black uppercase tracking-widest text-neutral-400 min-w-[100px] border-r border-neutral-100 dark:border-neutral-800 last:border-r-0">
                                                            <div className="flex items-center justify-between group">
                                                                <span>{label}</span>
                                                                <button
                                                                    onClick={() => removeMeasurementColumn(label)}
                                                                    className="text-neutral-300 hover:text-rose-500 transition-colors"
                                                                    title="Remove Column"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </TableHead>
                                                    ))}
                                                    <TableHead className="w-[50px]">
                                                        <Select onValueChange={(val) => {
                                                            if (val === "CUSTOM") {
                                                                addMeasurementColumn();
                                                            } else {
                                                                addMeasurementColumn(val);
                                                            }
                                                        }}>
                                                            <SelectTrigger className="h-8 w-8 p-0 border-none bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 justify-center">
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </SelectTrigger>
                                                            <SelectContent position="popper">
                                                                <SelectGroup>
                                                                    <SelectLabel className="text-[10px] uppercase font-black tracking-widest px-2 py-1.5 opacity-50">Global Types</SelectLabel>
                                                                    {globalMeasurementTypes.filter(t => !activeCategory.measurementLabels.includes(t.name)).length > 0 ? (
                                                                        globalMeasurementTypes
                                                                            .filter(t => !activeCategory.measurementLabels.includes(t.name))
                                                                            .map((type) => (
                                                                                <SelectItem key={type.id} value={type.name} className="text-xs font-bold uppercase tracking-widest">{type.name}</SelectItem>
                                                                            ))
                                                                    ) : (
                                                                        <div className="px-2 py-4 text-center">
                                                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">No more global types</p>
                                                                        </div>
                                                                    )}
                                                                    <SelectSeparator />
                                                                    <SelectItem value="CUSTOM" className="text-xs font-black uppercase tracking-widest text-neutral-500 italic">Add Custom...</SelectItem>
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {activeCategory.sizes.map((size, sIdx) => (
                                                    <TableRow key={sIdx} className="border-neutral-100 dark:border-neutral-800">
                                                        <TableCell>
                                                            <Input
                                                                value={size.name}
                                                                onChange={(e) => updateSize(sIdx, { name: e.target.value })}
                                                                className="font-black h-10 text-xs bg-transparent border-transparent hover:border-neutral-200 focus:bg-white dark:focus:bg-neutral-900 p-2"
                                                            />
                                                        </TableCell>
                                                        {!activeCategory.isStandard && (
                                                            <TableCell>
                                                                <Input
                                                                    value={size.standardMapping || ''}
                                                                    onChange={(e) => updateSize(sIdx, { standardMapping: e.target.value })}
                                                                    placeholder="e.g. Standard M"
                                                                    className="font-bold h-10 text-xs bg-white dark:bg-black italic"
                                                                />
                                                            </TableCell>
                                                        )}
                                                        {activeCategory.measurementLabels.map((label) => (
                                                            <TableCell key={label}>
                                                                <Input
                                                                    value={size.measurements[label] || ''}
                                                                    onChange={(e) => updateMeasurement(sIdx, label, e.target.value)}
                                                                    className="h-10 text-xs bg-transparent border-transparent hover:border-neutral-200 focus:bg-white dark:focus:bg-neutral-900 p-2"
                                                                />
                                                            </TableCell>
                                                        ))}
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeSize(sIdx)}
                                                                className="h-8 w-8 text-neutral-300 hover:text-rose-500"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={addSize}
                                        className="w-full mt-4 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white h-14 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:border-white transition-all rounded-2xl"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Size to {activeCategory.name}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* --- LENGTH GUIDE TAB --- */}
                <TabsContent value="length" className="space-y-4">
                    <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-black">
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
                                                className="font-black text-xs uppercase bg-transparent border-transparent hover:border-neutral-200 focus:bg-white transition-all h-9"
                                            />
                                        </TableCell>
                                        {['petite', 'regular', 'tall'].map((field) => (
                                            <TableCell key={field}>
                                                <Input
                                                    value={item[field as keyof LengthData] || ''}
                                                    onChange={(e) => handleLengthChange(index, field as keyof LengthData, e.target.value)}
                                                    className="font-bold h-9 text-xs bg-transparent border-transparent hover:border-neutral-200 focus:bg-white transition-all"
                                                />
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setLengths(lengths.filter((_, i) => i !== index))}
                                                className="h-8 w-8 text-neutral-300 hover:text-rose-500"
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
                        onClick={() => setLengths([...lengths, { part: 'New Item', petite: '', regular: '', tall: '' }])}
                        className="w-full border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white h-14 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:border-white transition-all rounded-2xl"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add New Length Item
                    </Button>
                </TabsContent>
            </Tabs>
        </div>
    );
}
