import { Plus } from "lucide-react";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "FAQ",
    description: "Common questions about shopping with AWURABA. Information on ordering, delivery, production times, and custom sizing.",
    openGraph: {
        title: "FAQ | AWURABA",
        description: "Everything you need to know about shopping with AWURABA.",
    }
};

export default function FAQPage() {
    const faqs = [
        {
            question: "How do I place an order?",
            answer: "Orders are placed via our Google Form found on our social media bio or by clicking the 'Order' button when collections drop. After filling the form, you'll receive confirmation via WhatsApp.",
        },
        {
            question: "When are new collections released?",
            answer: "We drop a fresh collection of 5 new styles on the 25th of every month.",
        },
        {
            question: "What is 'The 25th Drop'?",
            answer: "It is our monthly launch event. Shopping during the drop gives you access to exclusive discounted prices. After the drop window, styles remain available but return to standard pricing.",
        },
        {
            question: "Do you offer delivery?",
            answer: "Yes, we offer nationwide delivery across Ghana. Delivery fees vary based on location.",
        },
        {
            question: "What items do you sell?",
            answer: "We specialize in African ready-to-wear pieces for women, including dresses, tops, and skirts suitable for both casual and special occasions.",
        },
        {
            question: "How long does production take?",
            answer: "Each AWURABA piece is crafted with care. Please allow 5 working days for production after your order is confirmed, before it is shipped for delivery.",
        },
        {
            question: "Can I provide my own measurements?",
            answer: "Yes, you can share your specific measurements with us. However, please note that we cannot be held responsible if the item does not fit as expected based on self-provided measurements.",
        },
        {
            question: "Do you offer sizes above XXL?",
            answer: "Absolutely. While our standard chart lists up to XXL, we are open to creating pieces for larger sizes as a custom order. Please contact us to assist you.",
        },
        {
            question: "Can I return an item?",
            answer: "We ensure rigorous quality checks before delivery. Please contact us via WhatsApp immediately if you have any issues with your order upon receipt.",
        },
    ];

    return (
        <div className="bg-white dark:bg-black w-full min-h-screen">
            <div className="bg-neutral-50 dark:bg-neutral-900 py-20 md:py-28 px-4 text-center">
                <h1 className="font-serif text-4xl font-bold md:text-6xl text-black dark:text-white">
                    Frequently Asked Questions
                </h1>
                <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
                    Everything you need to know about shopping with AWURABA.
                </p>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
                {faqs.map((faq, index) => (
                    <details
                        key={index}
                        className="group border-b border-black/10 dark:border-white/10 pb-4"
                    >
                        <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-lg font-medium text-black dark:text-white transition-colors hover:text-neutral-600 dark:hover:text-neutral-300">
                            {faq.question}
                            <Plus className="h-5 w-5 transition-transform duration-300 group-open:rotate-45" />
                        </summary>
                        <p className="mt-2 leading-relaxed text-neutral-600 dark:text-neutral-400">
                            {faq.answer}
                        </p>
                    </details>
                ))}

                <div className="pt-12 text-center">
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Still have questions?{" "}
                        <a
                            href="https://wa.me/233000000000" // Replace with actual number
                            className="font-semibold text-black dark:text-white underline underline-offset-4 hover:no-underline"
                        >
                            Chat with us on WhatsApp
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
