import { ProductVariant } from "@/app/generated/prisma";
import { useState } from "react";

export const useVariants = () => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const addVariant = async (variant: ProductVariant) => {
    const res = await fetch(`/api/products/${variant.productId}/variants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variant),
    });
    if (!res.ok) {
      throw new Error("Failed to add variant");
    }
    const data = await res.json();
    setVariants((prev) => [...prev, data]);
  };

  const deleteVariant = async (variantId: string) => {
    const res = await fetch(`/api/products/${variantId}/variants`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("Failed to delete variant");
    }
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  const updateVariant = async (variant: ProductVariant) => {
    const res = await fetch(`/api/products/${variant.id}/variants`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variant),
    });
    if (!res.ok) {
      throw new Error("Failed to update variant");
    }
    const data = await res.json();
    setVariants((prev) => prev.map((v) => (v.id === variant.id ? data : v)));
  };

  return {
    variants,
    addVariant,
    deleteVariant,
    updateVariant,
  };
};
