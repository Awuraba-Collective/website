import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import StoreProvider from "@/store/StoreProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
  metadataBase: new URL("https://awuraba.co"),
  title: {
    default: "AWURABA | Elegant African Fashion",
    template: "%s | AWURABA",
  },
  description:
    "Curated elegant African ready-to-wear pieces for everyday life, special occasions, and everything in between. Handcrafted with love in Ghana.",
  keywords: [
    "African fashion",
    "Ghanaian fashion",
    "Ready-to-wear",
    "Elegant fashion",
    "Awuraba",
    "African print dresses",
    "Modern African clothing",
    "Luxury African fashion",
  ],
  authors: [{ name: "AWURABA Collective" }],
  creator: "AWURABA Collective",
  publisher: "AWURABA Collective",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AWURABA | Elegant African Fashion",
    description:
      "Curated elegant African ready-to-wear pieces for everyday life, special occasions, and everything in between.",
    url: "https://awuraba.co",
    siteName: "AWURABA",
    images: [],
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AWURABA | Elegant African Fashion",
    description:
      "Curated elegant African ready-to-wear pieces for everyday life, special occasions, and everything in between.",
    images: [],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AWURABA",
    url: "https://awuraba.co",
    logo: "https://awuraba.co/logos/icon.png",
    sameAs: [
      "https://www.instagram.com/shopawuraba",
      "https://www.facebook.com/shopawuraba",
      // "https://www.pinterest.com/shopawuraba",
      "https://www.tiktok.com/shopawuraba",
    ],
    description:
      "Curated elegant African ready-to-wear pieces handcrafted in Ghana.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Accra",
      addressCountry: "GH",
    },
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-screen flex flex-col bg-white text-black dark:bg-black dark:text-white`}
      >
        <StoreProvider>
          {children}
          <Toaster position="top-right" richColors />
        </StoreProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
