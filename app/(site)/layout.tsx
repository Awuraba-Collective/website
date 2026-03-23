import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CartDrawer } from "./shop/_components/CartDrawer";
import { SalesPopup } from "./shop/_components/SalesPopup";

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <CartDrawer />
            <SalesPopup />
            <main className="flex-grow w-full">
                {children}
            </main>
            <WhatsAppButton />
            <Footer />
        </>
    );
}
