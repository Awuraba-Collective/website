"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Package,
  Loader2,
  X as CloseIcon,
  Video,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter State
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [activeDiscounts, setActiveDiscounts] = useState<any[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");

  // Deletion State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview State
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: searchTerm,
      });
      if (selectedCategory !== "all")
        params.append("categoryId", selectedCategory);
      if (selectedCollection !== "all")
        params.append("collectionId", selectedCollection);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data.products);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, selectedCategory, selectedCollection]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, collRes, discRes] = await Promise.all([
          fetch("/api/categories").then((r) => r.json()),
          fetch("/api/collections").then((r) => r.json()),
          fetch("/api/discounts/active").then((r) => r.json()),
        ]);
        if (Array.isArray(catRes)) setCategories(catRes);
        if (Array.isArray(collRes)) setCollections(collRes);
        if (Array.isArray(discRes)) setActiveDiscounts(discRes);
      } catch (e) {
        console.error(e);
      }
    };
    fetchFilters();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) throw new Error("Update failed");

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p))
      );

      toast.success(`Product ${!currentStatus ? "activated" : "deactivated"}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product status");
    }
  };

  const handlePreview = async (product: any) => {
    setIsLoadingPreview(true);
    try {
      const res = await fetch(`/api/products/${product.id}`);
      if (!res.ok) throw new Error("Failed to fetch full product details");
      const fullProduct = await res.json();
      setPreviewProduct(fullProduct);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load product details");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");

      toast.success("Product deleted permanently");
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-10 pb-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-100 dark:border-neutral-900 pb-8">
        <div>
          <h1 className="font-serif text-4xl font-bold text-black dark:text-white mb-2">
            Products
          </h1>
          <p className="text-neutral-500 font-light max-w-md">
            Manage your collection and inventory across all categories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/upload"
            className="flex items-center gap-2 px-6 py-2 border-2 border-black dark:border-white text-black dark:text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Creation
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg py-2.5 pl-10 pr-4 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-10 text-[9px] font-black uppercase tracking-widest bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 w-[140px] rounded-lg">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-bold tracking-wider uppercase"
              >
                All Categories
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem
                  key={cat.id}
                  value={cat.id}
                  className="text-[10px] font-bold tracking-wider uppercase"
                >
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedCollection}
            onValueChange={setSelectedCollection}
          >
            <SelectTrigger className="h-10 text-[9px] font-black uppercase tracking-widest bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 w-[140px] rounded-lg">
              <SelectValue placeholder="Collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="text-[10px] font-bold tracking-wider uppercase"
              >
                All Collections
              </SelectItem>
              {collections.map((coll) => (
                <SelectItem
                  key={coll.id}
                  value={coll.id}
                  className="text-[10px] font-bold tracking-wider uppercase"
                >
                  {coll.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(selectedCategory !== "all" || selectedCollection !== "all") && (
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedCollection("all");
              }}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg text-neutral-400 transition-colors"
              title="Clear Filters"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white dark:bg-black rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden min-h-[400px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-black dark:text-white" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/10">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">
                  Status
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">
                  Product
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">
                  Category
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">
                  Collections
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-900">
              {products.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Package className="w-8 h-8 text-neutral-200 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                      No Collective Items Found
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="group hover:bg-neutral-50/30 dark:hover:bg-neutral-900/5 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={product.isActive}
                          onCheckedChange={() =>
                            handleToggleActive(product.id, product.isActive)
                          }
                          className="scale-75 data-[state=checked]:bg-emerald-500"
                        />
                        <span
                          className={`text-[8px] font-black uppercase tracking-widest ${product.isActive
                            ? "text-emerald-500 shadow-emerald-500/20"
                            : "text-neutral-300"
                            }`}
                        >
                          {product.isActive ? "Active" : "Hidden"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                          {product.media?.[0]?.src ? (
                            product.media[0].type === 'VIDEO' ? (
                              <video
                                src={product.media[0].src.replace(/\.(mov|webm|ogg)$/i, '.mp4')}
                                className="w-full h-full object-cover"
                                muted
                                autoPlay
                                loop
                                playsInline
                              />
                            ) : (
                              <img
                                src={product.media[0].src}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            )
                          ) : (
                            <Package className="w-5 h-5 text-neutral-200" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-[200px]">
                          <p className="text-[11px] font-bold text-black dark:text-white uppercase tracking-tight truncate">
                            {product.name}
                          </p>
                          <p className="text-[9px] font-bold text-neutral-400 mt-0.5 tracking-tight uppercase truncate">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <Badge
                        variant="outline"
                        className="text-[9px] font-black uppercase tracking-widest border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-500"
                      >
                        {product.category?.name || "Uncategorized"}
                      </Badge>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest truncate">
                        {product.collection?.name || "N/A"}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handlePreview(product)}
                          disabled={isLoadingPreview}
                          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md transition-colors disabled:opacity-50"
                          title="View details"
                        >
                          {isLoadingPreview ? (
                            <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-neutral-400" />
                          )}
                        </button>
                        <Link
                          href={`/admin/products/upload?id=${product.id}`}
                          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md transition-colors"
                          title="Edit product"
                        >
                          <Edit3 className="w-4 h-4 text-neutral-400" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors group/delete"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4 text-neutral-300 group-hover/delete:text-rose-500" />
                        </button>
                      </div>
                      <div className="group-hover:hidden flex justify-end">
                        <MoreHorizontal className="w-4 h-4 text-neutral-300" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between bg-white dark:bg-black">
          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">
            Found {total} Items • Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 border border-neutral-200 dark:border-neutral-800 rounded-lg disabled:opacity-20 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2.5 border border-neutral-200 dark:border-neutral-800 rounded-lg disabled:opacity-20 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors shadow-sm"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open: boolean) =>
          !open && !isDeleting && setDeleteId(null)
        }
      >
        <AlertDialogContent className="max-w-md rounded-2xl border-neutral-100 dark:border-neutral-800 p-8">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="font-serif text-2xl font-bold tracking-tight">
              Permanent Deletion?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500 font-light leading-relaxed">
              This action is absolute. The product and all its variants, images,
              and pricing history will be permanently erased from the Awuraba
              archives.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 sm:space-x-4">
            <AlertDialogCancel className="border-neutral-200 dark:border-neutral-800 text-[10px] uppercase font-black tracking-widest rounded-full h-11 px-8">
              Return
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-rose-500 hover:bg-rose-600 text-white border-none text-[10px] uppercase font-black tracking-widest rounded-full h-11 px-8"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Confirm Erase"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product Preview */}
      <Dialog
        open={!!previewProduct}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewProduct(null);
            setActiveImageIndex(0);
          }
        }}
      >
        <DialogContent className="!w-[95vw] max-w-5xl h-[92vh] rounded-[2rem] md:rounded-[3rem] border-neutral-100 dark:border-neutral-800 p-0 overflow-hidden bg-white dark:bg-black shadow-2xl">
          {previewProduct &&
            (() => {
              const discount = activeDiscounts.find(
                (d) => d.id === previewProduct.discountId
              );
              const calculateDiscountedPrice = (original: number) => {
                if (!discount) return null;
                if (discount.type === "PERCENTAGE") {
                  return Math.round(original * (1 - discount.value / 100));
                }
                return Math.max(0, original - discount.value);
              };
              const discountedGHS = calculateDiscountedPrice(
                previewProduct.price
              );

              return (
                <div className="grid grid-cols-1 md:grid-cols-12 h-full overflow-y-auto md:overflow-hidden">
                  {/* Visuals - Interactive Gallery (5 cols) */}
                  <div className="md:col-span-5 bg-neutral-50 dark:bg-neutral-900/30 p-6 md:p-10 flex flex-col gap-6 md:gap-8 border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-900 min-w-[300px] md:h-full md:overflow-y-auto">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black shadow-xl relative group"
                    >
                      <AnimatePresence mode="wait">
                        {previewProduct.media?.[activeImageIndex]?.type === 'VIDEO' ? (
                          <motion.video
                            key={activeImageIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            src={previewProduct.media[activeImageIndex].src.replace(/\.(mov|webm|ogg)$/i, '.mp4')}
                            className="w-full h-full object-cover"
                            controls
                            autoPlay
                            loop
                            muted
                          />
                        ) : (
                          <motion.img
                            key={activeImageIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            src={
                              previewProduct.media?.[activeImageIndex]?.src ||
                              previewProduct.media?.[0]?.src
                            }
                            alt={previewProduct.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <div className="grid grid-cols-5 gap-2 md:gap-3">
                      {previewProduct.media?.map((img: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          className={`aspect-[3/4] rounded-lg md:rounded-xl overflow-hidden border transition-all ${activeImageIndex === i
                            ? "border-black dark:border-white ring-2 ring-black/5 dark:ring-white/5 scale-105"
                            : "border-neutral-100 dark:border-neutral-800 opacity-50 hover:opacity-100"
                            } bg-white dark:bg-black`}
                        >
                          {img.type === 'VIDEO' ? (
                            <div className="relative w-full h-full">
                              <video
                                src={img.src.replace(/\.(mov|webm|ogg)$/i, '.mp4')}
                                className="w-full h-full object-cover"
                                muted
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Video className="w-4 h-4 text-white drop-shadow-md" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={img.src}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Details (7 cols) */}
                  <div className="md:col-span-7 p-6 md:p-10 lg:p-12 space-y-8 md:space-y-12 md:h-full md:overflow-y-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
                        <Badge
                          variant="outline"
                          className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] px-3 md:px-4 py-1.5 border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50"
                        >
                          {previewProduct.category?.name}
                        </Badge>
                        {previewProduct.isNewDrop && (
                          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 rounded-full pl-2.5 pr-3.5 py-1.5 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                              Active Drop
                            </span>
                          </div>
                        )}
                      </div>
                      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 tracking-tight leading-tight uppercase break-words">
                        {previewProduct.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 md:mb-8">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                          ID: {previewProduct.id.slice(-8)}
                        </p>
                        <span className="hidden sm:inline w-1 h-1 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 truncate">
                          {previewProduct.collection?.name ||
                            "Independent Piece"}
                        </p>
                      </div>
                      <p className="text-neutral-500 font-light leading-relaxed text-sm md:text-base max-w-xl italic">
                        "
                        {previewProduct.description ||
                          "No description provided for this architectural piece."}
                        "
                      </p>
                    </motion.div>

                    {/* Financial Layout */}
                    <motion.div
                      className="space-y-4 md:space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                        {/* Cost Price */}
                        <div className="p-4 md:p-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl md:rounded-[1.5rem] border border-neutral-100 dark:border-neutral-900">
                          <p className="text-[7px] md:text-[8px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1.5 md:mb-2">
                            Cost Price (GHS)
                          </p>
                          <p className="text-xl md:text-2xl font-black tracking-tighter">
                            GH₵{" "}
                            {previewProduct.costPrice?.toLocaleString() ||
                              "---"}
                          </p>
                        </div>
                        {/* Selling Price */}
                        <div className="p-4 md:p-6 bg-black dark:bg-white text-white dark:text-black rounded-2xl md:rounded-[1.5rem] shadow-xl">
                          <p className="text-[7px] md:text-[8px] font-black opacity-60 uppercase tracking-[0.2em] mb-1.5 md:mb-2">
                            Selling Price (GHS)
                          </p>
                          <p className="text-xl md:text-2xl font-black tracking-tighter">
                            GH₵ {previewProduct.price.toLocaleString()}
                          </p>
                        </div>
                        {/* Discounted Price */}
                        {discountedGHS && (
                          <div className="p-4 md:p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl md:rounded-[1.5rem] border border-emerald-500/20">
                            <p className="text-[7px] md:text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1.5 md:mb-2">
                              Discount Price (GHS)
                            </p>
                            <p className="text-xl md:text-2xl font-black tracking-tighter text-emerald-500">
                              GH₵ {discountedGHS.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Other Currencies */}
                    {previewProduct.prices?.length > 0 && (
                      <motion.div
                        className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                      >
                        {previewProduct.prices?.map((price: any) => (
                          <div
                            key={price.currencyCode}
                            className="p-4 md:p-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl md:rounded-[1.5rem] border border-neutral-100 dark:border-neutral-900 group hover:bg-neutral-100/50 transition-colors"
                          >
                            <p className="text-[7px] md:text-[8px] font-black text-neutral-400 group-hover:text-neutral-500 transition-colors uppercase tracking-[0.2em] mb-1.5 md:mb-2">
                              {price.currencyCode}
                            </p>
                            <div className="flex flex-col">
                              <p
                                className={`text-xl md:text-2xl font-black tracking-tighter ${price.discountPrice
                                  ? "text-emerald-500"
                                  : "text-black dark:text-white"
                                  }`}
                              >
                                {price.discountPrice?.toLocaleString() ||
                                  price.price.toLocaleString()}
                              </p>
                              {price.discountPrice && (
                                <span className="text-[9px] md:text-[10px] font-bold opacity-30 line-through mt-0.5 md:mt-1 tracking-tight">
                                  {price.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Inventory & Recommendations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 pt-2 md:pt-4">
                      <motion.div
                        className="space-y-4 md:space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex flex-col gap-2 md:gap-2.5">
                          {previewProduct.variants?.map((v: any) => (
                            <div
                              key={v.id}
                              className={`group px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl border transition-all flex items-center justify-between ${v.isAvailable
                                ? "border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/20 hover:border-black dark:hover:border-white"
                                : "border-rose-100/50 bg-rose-50/30 text-rose-400"
                                }`}
                            >
                              <span
                                className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${v.isAvailable
                                  ? "text-neutral-700 dark:text-neutral-300"
                                  : "text-rose-400"
                                  }`}
                              >
                                {v.name}
                              </span>
                              {v.isAvailable ? (
                                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  Ready
                                </span>
                              ) : (
                                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">
                                  Out
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        className="space-y-4 md:space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="p-6 md:p-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center text-center gap-3 md:gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center border border-neutral-100 dark:border-neutral-900">
                            <Package className="w-4 h-4 md:w-5 md:h-5 text-neutral-300" />
                          </div>
                          <div>
                            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] text-black dark:text-white mb-0.5 md:mb-1">
                              {previewProduct.relatedProducts?.length || 0}{" "}
                              Recommendations
                            </p>
                            <p className="text-[8px] md:text-[9px] font-medium text-neutral-400 uppercase tracking-widest leading-relaxed">
                              Linked for "Complete the Look"
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <motion.div
                      className="pt-8 md:pt-12 border-t border-neutral-100 dark:border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <p className="text-[8px] md:text-[9px] font-black text-neutral-400 uppercase tracking-[0.3em]">
                        Last Sync: {new Date().toLocaleDateString()}
                      </p>
                      <div className="flex gap-3 md:gap-4 w-full sm:w-auto">
                        <Button
                          onClick={() => {
                            setPreviewProduct(null);
                            setActiveImageIndex(0);
                          }}
                          variant="ghost"
                          className="flex-1 sm:flex-none rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest px-6 md:px-10 h-12 md:h-14 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                        >
                          Close
                        </Button>
                        <Button
                          asChild
                          className="flex-1 sm:flex-none bg-black dark:bg-white text-white dark:text-black rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest px-8 md:px-12 h-12 md:h-14 shadow-2xl hover:scale-105 transition-all"
                        >
                          <Link
                            href={`/admin/products/upload?id=${previewProduct.id}`}
                          >
                            Refine Archive
                          </Link>
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
