'use client';

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ListItem {
    id: string;
    name: string;
    slug: string;
}

interface SettingsListManagerProps {
    title: string;
    description: string;
    placeholder: string;
    apiEndpoint: string;
}

export function SettingsListManager({
    title,
    description,
    placeholder,
    apiEndpoint
}: SettingsListManagerProps) {
    const [items, setItems] = useState<ListItem[]>([]);
    const [newItem, setNewItem] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Fetch items on mount
    useEffect(() => {
        fetchItems();
    }, [apiEndpoint]);

    const fetchItems = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(apiEndpoint);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch items:', error);
            toast.error('Failed to load items');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newItem.trim()) return;

        try {
            setIsAdding(true);
            const res = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newItem.trim() })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create');
            }

            const created = await res.json();
            setItems(prev => [...prev, created]);
            setNewItem("");
            toast.success(`${title.slice(0, -1)} created successfully`);
        } catch (error: any) {
            console.error('Failed to add item:', error);
            toast.error(error.message || 'Failed to create item');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        try {
            const res = await fetch(`${apiEndpoint}?id=${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete');

            setItems(prev => prev.filter(item => item.id !== id));
            toast.success(`${name} deleted successfully`);
        } catch (error) {
            console.error('Failed to delete item:', error);
            toast.error('Failed to delete item');
        }
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
                    disabled={isAdding}
                    className="bg-white dark:bg-black font-bold h-12 text-sm max-w-md"
                />
                <Button
                    onClick={handleAdd}
                    disabled={!newItem.trim() || isAdding}
                    className="h-12 w-12 rounded-full p-0 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-2 max-w-md">
                {isLoading ? (
                    <div className="p-8 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Loading...</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="group flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800"
                            >
                                <span className="font-bold text-sm">{item.name}</span>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(item.id, item.name)}
                                        className="h-8 w-8 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
                {!isLoading && items.length === 0 && (
                    <div className="p-8 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">List is empty</p>
                    </div>
                )}
            </div>
        </div>
    );
}
