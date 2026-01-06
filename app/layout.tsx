import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import StoreProvider from "@/store/StoreProvider";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AWURABA | Elegant African Fashion",
  description: "Curated African ready-to-wear pieces for everyday life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-screen flex flex-col bg-white text-black dark:bg-black dark:text-white`}
      >
        <StoreProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-grow w-full">
            {children}
          </main>
          <WhatsAppButton />
          <Footer />
          <Toaster position="top-right" richColors />
        </StoreProvider>
      </body>
    </html>
  );
}
