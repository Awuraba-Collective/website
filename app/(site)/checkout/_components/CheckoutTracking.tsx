"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import posthog from "posthog-js";

export function CheckoutTracking() {
  const { items } = useAppSelector((state) => state.cart);
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current && items.length > 0) {
      tracked.current = true;
      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      posthog.capture("checkout_started", {
        cart_total: total,
        item_count: items.length,
        total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        items: items.map((item) => ({
          product_id: item.productId,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
          selected_size: item.selectedSize,
          selected_variant: item.selectedVariant,
          selected_length: item.selectedLength,
        })),
        currency: "GHS",
      });
    }
  }, [items]);

  return null;
}
