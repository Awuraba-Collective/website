import HomeClient from "@/components/home/HomeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AWURABA | Elegant African Fashion",
  description: "Curated elegant African ready-to-wear pieces for everyday life, special occasions, and everything in between.",
};

export default function Home() {
  return <HomeClient />;
}
