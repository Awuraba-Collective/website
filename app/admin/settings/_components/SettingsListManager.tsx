'use client';

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsListManagerProps {
    title: string;
    description: string;
    placeholder: string;
    initialItems: string[];
    onUpdate?: (items: string[]) => void;
}

export function SettingsListManager({
    title,
    description,
    placeholder,
    initialItems,
    onUpdate
}: SettingsListManagerProps) {
    const [items, setItems] = useState<string[]>(initialItems);
    const [newItem, setNewItem] = useState("");

    const handleAdd = () => {
        if (!newItem.trim()) return;
        if (items.includes(newItem.trim())) return; // Prevent duplicates for now

        const updated = [...items, newItem.trim()];
        setItems(updated);
        setNewItem("");
        onUpdate?.(updated);
    };

    const handleDelete = (index: number) => {
        const updated = items.filter((_, i) => i !== index);
        setItems(updated);
        onUpdate?.(updated);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest">{title}</h3>
                <p className="text-xs text-neutral-500">{description}</p>
            </div>

            <div className="flex items-center gap-3">
                <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="bg-white dark:bg-black font-bold h-12 text-sm max-w-md"
                />
                <Button
                    onClick={handleAdd}
                    disabled={!newItem.trim()}
                    className="h-12 w-12 rounded-full p-0 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-2 max-w-md">
                <AnimatePresence initial={false}>
                    {items.map((item, index) => (
                        <motion.div
                            key={item}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="group flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800"
                        >
                            <span className="font-bold text-sm">{item}</span>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(index)}
                                    className="h-8 w-8 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {items.length === 0 && (
                    <div className="p-8 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">List is empty</p>
                    </div>
                )}
            </div>
        </div>
    );
}
