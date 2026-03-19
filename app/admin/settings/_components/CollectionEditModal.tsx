'use client';

import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageIcon, Loader2, X, Search, Film, Check } from "lucide-react";
import { toast } from "sonner";
import { uploadImagesToStorage } from "@/lib/utils/product-payload";
import { motion, AnimatePresence } from "framer-motion";

interface Collection {
    id: string;
    name: string;
    slug: string;
    coverImage?: string | null;
    coverVideo?: string | null;
    coverType?: string;
    coverProductId?: string | null;
}

interface ProductResult {
    id: string;
    name: string;
    media: Array<{
        src: string;
        type: "IMAGE" | "VIDEO";
    }>;
}

interface CollectionEditModalProps {
    collection: Collection | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updated: Collection) => void;
}

export function CollectionEditModal({
    collection,
    isOpen,
    onClose,
    onUpdate
}: CollectionEditModalProps) {
    const [name, setName] = useState("");
    const [coverType, setCoverType] = useState<"IMAGE" | "VIDEO">("IMAGE");
    const [sourceType, setSourceType] = useState<"UPLOAD" | "PRODUCT">("UPLOAD");
    
    // Upload state
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    // Product Link state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ProductResult[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductResult | null>(null);
    const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    
    const [isSaving, setIsSaving] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (collection) {
            setName(collection.name);
            setCoverType((collection.coverType as "IMAGE" | "VIDEO") || "IMAGE");
            setSourceType(collection.coverProductId ? "PRODUCT" : "UPLOAD");
            
            if (collection.coverProductId) {
                setPreviewUrl(collection.coverType === "VIDEO" ? collection.coverVideo || null : collection.coverImage || null);
                // Fetch product details for the link
                fetch(`/api/products/${collection.coverProductId}`)
                    .then(res => res.json())
                    .then(data => {
                        setSelectedProduct(data);
                        setSelectedMediaUrl(collection.coverType === "VIDEO" ? collection.coverVideo || null : collection.coverImage || null);
                    })
                    .catch(console.error);
            } else {
                setPreviewUrl(collection.coverType === "VIDEO" ? collection.coverVideo || null : collection.coverImage || null);
            }
            setSelectedFile(null);
        }
    }, [collection]);

    // Product Search Logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 2 && collection) {
                setIsSearching(true);
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&collectionId=${collection.id}`);
                    const data = await res.json();
                    setSearchResults(data);
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, collection]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const isVideo = file.type.startsWith("video/");
            setCoverType(isVideo ? "VIDEO" : "IMAGE");
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!collection) return;
        setIsSaving(true);

        try {
            let finalImage = coverType === "IMAGE" ? previewUrl : null;
            let finalVideo = coverType === "VIDEO" ? previewUrl : null;
            let finalProductId = sourceType === "PRODUCT" ? selectedProduct?.id : null;

            // 1. Upload if new file selected
            if (sourceType === "UPLOAD" && selectedFile) {
                const [uploadedUrl] = await uploadImagesToStorage([selectedFile]);
                if (coverType === "IMAGE") finalImage = uploadedUrl;
                else finalVideo = uploadedUrl;
            } else if (sourceType === "PRODUCT") {
                if (coverType === "IMAGE") finalImage = selectedMediaUrl;
                else finalVideo = selectedMediaUrl;
            }

            // 2. Update via API
            const res = await fetch(`/api/collections/${collection.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    coverImage: finalImage,
                    coverVideo: finalVideo,
                    coverType: coverType,
                    coverProductId: finalProductId
                })
            });

            if (!res.ok) throw new Error('Failed to update collection');

            const updated = await res.json();
            onUpdate(updated);
            toast.success("Collection updated successfully");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update collection");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
            <DialogContent className="max-w-2xl rounded-2xl border-neutral-100 dark:border-neutral-800 p-8 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-4">
                    <DialogTitle className="font-serif text-2xl font-bold tracking-tight">
                        Edit Collection
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-8 py-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Collection Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Summer 2025"
                            className="h-12 font-bold text-sm bg-neutral-50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Cover Media</Label>
                            <Tabs value={sourceType} onValueChange={(v: any) => setSourceType(v)} className="w-auto">
                                <TabsList className="bg-neutral-100 dark:bg-neutral-900 h-8 p-1 rounded-full">
                                    <TabsTrigger value="UPLOAD" className="rounded-full text-[9px] font-black uppercase tracking-widest px-4 h-6 data-[state=active]:bg-white dark:data-[state=active]:bg-black shadow-sm">Upload</TabsTrigger>
                                    <TabsTrigger value="PRODUCT" className="rounded-full text-[9px] font-black uppercase tracking-widest px-4 h-6 data-[state=active]:bg-white dark:data-[state=active]:bg-black shadow-sm">Product</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {sourceType === "UPLOAD" ? (
                            <div className="space-y-4">
                                <div className="aspect-video rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors overflow-hidden relative group">
                                    {previewUrl ? (
                                        <>
                                            {coverType === "VIDEO" ? (
                                                <video src={previewUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                            ) : (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-[10px] text-white font-black uppercase tracking-widest bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">Change Media</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setPreviewUrl(null);
                                                    setSelectedFile(null);
                                                }}
                                                className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-rose-500 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-white dark:bg-black flex items-center justify-center shadow-sm">
                                                <ImageIcon className="w-5 h-5 text-neutral-300" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center">
                                                Click to Upload<br/><span className="text-[8px] opacity-70">Image or Video</span>
                                            </span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Product Search */}
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                        <Input
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-11 h-12 bg-neutral-50 dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 font-bold"
                                        />
                                        
                                        <AnimatePresence>
                                            {searchResults.length > 0 && searchQuery.length > 2 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-black border border-neutral-100 dark:border-neutral-800 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto p-2"
                                                >
                                                    {searchResults.map(prod => (
                                                        <button
                                                            key={prod.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedProduct(prod);
                                                                setSearchQuery("");
                                                                setSearchResults([]);
                                                                // Auto-select first media
                                                                if (prod.media && prod.media.length > 0) {
                                                                    setSelectedMediaUrl(prod.media[0].src);
                                                                    setCoverType(prod.media[0].type);
                                                                    setPreviewUrl(prod.media[0].src);
                                                                }
                                                            }}
                                                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-left"
                                                        >
                                                            <div className="w-10 h-10 rounded bg-neutral-100 overflow-hidden relative flex-shrink-0">
                                                                {prod.media?.[0]?.type === 'VIDEO' ? (
                                                                    <Film className="w-4 h-4 absolute inset-0 m-auto text-neutral-400" />
                                                                ) : (
                                                                    <img src={prod.media?.[0]?.src} className="w-full h-full object-cover" />
                                                                )}
                                                            </div>
                                                            <span className="text-xs font-bold uppercase tracking-tight">{prod.name}</span>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {selectedProduct && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Selected: {selectedProduct.name}</span>
                                            <button onClick={() => setSelectedProduct(null)} className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:underline">Change Product</button>
                                        </div>
                                        
                                        <div className="grid grid-cols-4 gap-2">
                                            {selectedProduct.media.map((m, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedMediaUrl(m.src);
                                                        setCoverType(m.type);
                                                        setPreviewUrl(m.src);
                                                    }}
                                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative group ${selectedMediaUrl === m.src ? 'border-black dark:border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                                >
                                                    {m.type === "IMAGE" ? (
                                                        <img src={m.src} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-neutral-100 flex items-center justify-center relative">
                                                            <Film className="w-4 h-4 text-neutral-400" />
                                                        </div>
                                                    )}
                                                    {selectedMediaUrl === m.src && (
                                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                            <Check className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        
                                        <div className="aspect-video rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                                            {selectedMediaUrl && (
                                                coverType === "VIDEO" ? (
                                                    <video src={selectedMediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                                ) : (
                                                    <img src={selectedMediaUrl} className="w-full h-full object-cover" />
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <p className="text-[10px] text-neutral-400 font-medium">
                            This cover will represent the collection across the platform.
                        </p>
                    </div>
                </div>

                <DialogFooter className="mt-4 gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isSaving}
                        className="rounded-full text-[10px] font-black uppercase tracking-widest px-8 h-12"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !name.trim() || !previewUrl}
                        className="bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-widest px-10 h-12 shadow-xl"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
