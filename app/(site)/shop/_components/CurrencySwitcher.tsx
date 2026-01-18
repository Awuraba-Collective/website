"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrency } from "@/store/slices/shopSlice";
import { useEffect, useState } from "react";

interface Currency {
  code: string;
  symbol: string;
  rate: number;
  isActive: boolean;
}

export function CurrencySwitcher() {
  const dispatch = useAppDispatch();
  const { currency } = useAppSelector((state) => state.shop);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const res = await fetch("/api/currencies?active=true", {
          cache: "force-cache",
        });
        if (res.ok) {
          const data = await res.json();
          setCurrencies(data);
        }
      } catch (error) {
        console.error("Failed to fetch currencies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCurrencies();
  }, []);

  // Don't show if loading or less than 2 currencies
  if (loading || currencies.length < 2) {
    return null;
  }

  return (
    <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 rounded-full p-1 border border-neutral-200 dark:border-neutral-800">
      {currencies.map((curr) => (
        <button
          key={curr.code}
          onClick={() =>
            dispatch(setCurrency({ code: curr.code, rate: Number(curr.rate) }))
          }
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            currency === curr.code
              ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
              : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          }`}
        >
          {curr.code}
        </button>
      ))}
    </div>
  );
}
