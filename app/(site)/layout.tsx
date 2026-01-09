import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CartDrawer } from "./shop/_components/CartDrawer";

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <CartDrawer />
            <main className="flex-grow w-full">
                {children}
            </main>
            <WhatsAppButton />
            <Footer />
        </>
    );
}
