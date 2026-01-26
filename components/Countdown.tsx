"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TimeLeft {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    total: number;
}

interface CountdownProps {
    endDate: string | Date;
    variant?: "hero" | "detail" | "card";
    className?: string;
}

export function Countdown({ endDate, variant = "detail", className = "" }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(endDate).getTime() - new Date().getTime();

            if (difference <= 0) {
                return null;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            return {
                days: days.toString().padStart(2, "0"),
                hours: hours.toString().padStart(2, "0"),
                minutes: minutes.toString().padStart(2, "0"),
                seconds: seconds.toString().padStart(2, "0"),
                total: difference,
            };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [endDate]);

    if (!timeLeft) return null;

    if (variant === "hero") {
        return (
            <div className={`flex gap-4 md:gap-8 justify-center items-center ${className}`}>
                {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hours", value: timeLeft.hours },
                    { label: "Mins", value: timeLeft.minutes },
                    { label: "Secs", value: timeLeft.seconds },
                ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                        <span className="text-3xl md:text-5xl font-black tracking-tighter tabular-nums">
                            {item.value}
                        </span>
                        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mt-1">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === "card") {
        return (
            <div className={`flex gap-1.5 items-center bg-black/80 backdrop-blur-md px-2 py-1 rounded-sm border border-white/10 ${className}`}>
                <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black tracking-widest text-white tabular-nums">
                    {timeLeft.days}:{timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
                </span>
            </div>
        );
    }

    // Default / Detail variant
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">
                Ends in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </span>
        </div>
    );
}
