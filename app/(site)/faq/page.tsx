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
            question: "What items do you sell?",
            answer: "We specialize in elegant African ready-to-wear pieces for women, including dresses, tops, and sets.",
        },
        {
            question: "When are new collections released?",
            answer: "We release a fresh collection on the 25th of every month.",
        },
        {
            question: "What is 'The 25th Drop'?",
            answer: "It is our monthly launch event. Shopping during the drop period gives you access to exclusive launch prices. After the drop window, items remain available at their standard pricing.",
        },
        {
            question: "How do I place an order?",
            answer: "You can place an order directly on our website. Simply browse our collections, select your preferred size and length, and proceed to checkout. We will contact you via phone or WhatsApp to confirm your order and finalize delivery details.",
        },
        {
            question: "Can I provide my own measurements?",
            answer: "Yes. We offer a 'Custom' sizing option for every piece. You can include your specific measurements in the order notes on the product details page. Custom orders are made based on the measurements provided, so fit outcomes depend on the accuracy of the details shared.",
        },
        {
            question: "Do you offer sizes above XXL?",
            answer: "Absolutely. While our standard size chart goes up to XXL, we are happy to create pieces in larger sizes. Please reach out to us directly if you need assistance.",
        },
        {
            question: "How long does production take?",
            answer: "Each AWURABA piece is thoughtfully made with attention to detail. Production typically takes 5–7 days after your order is confirmed, and delivery is arranged as soon as your piece is ready.",
        },
        {
            question: "Do you offer delivery?",
            answer: "Yes, we offer nationwide delivery across Ghana, as well as international delivery. We will reach out to arrange delivery and confirm fees (payable on delivery) once production is complete.",
        },
        {
            question: "Can I return an item?",
            answer: "As each piece is made to order, all sales are final. We carry out careful quality checks before delivery, but if you notice any issues upon receiving your order, please contact us via WhatsApp immediately so we can assist.",
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
                            href="https://wa.me/233549726818"
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
