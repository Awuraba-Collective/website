export type DropStatus = 'countdown' | 'sale';

interface DropInfo {
    status: DropStatus;
    targetDate: Date;
    label: string;
    title: string;
    description: string;
    buttonText: string;
}

/**
 * Calculates the current drop cycle state based on a 25th-of-the-month anchor.
 * - Countdown: Starts on the 11th and counts down to the 25th.
 * - Sale: Starts on the 25th and lasts until the 10th of the next month.
 * This creates a continuous loop where one phase always flows into the next.
 */
export function getDropStatus(now: Date = new Date()): DropInfo {
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();

    // Key Dates
    const thisMonth11 = new Date(year, month, 11, 0, 0, 0);
    const thisMonth25 = new Date(year, month, 25, 0, 0, 0);
    const nextMonth11 = new Date(year, month + 1, 11, 0, 0, 0);

    // Determines which phase we are in
    if (date >= 11 && date <= 24) {
        // 1. Countdown Mode: From the 11th to the 24th
        return {
            status: 'countdown',
            targetDate: thisMonth25,
            label: 'Coming Soon',
            title: 'The Monthly Drop',
            description: 'Get ready to shop our new drop. A fresh collection of handcrafted pieces is almost here and will be available at special launch prices.',
            buttonText: 'Browse Existing Styles'
        };
    } else {
        // 2. Sale Mode: From the 25th to the 10th of next month
        const saleEndDate = date >= 25 ? nextMonth11 : thisMonth11;

        return {
            status: 'sale',
            targetDate: saleEndDate,
            label: 'Active Sales',
            title: 'Our sales window is open',
            description: 'Shop our latest curated collection at exclusive launch prices. These handcrafted silhouettes are available at special rates for a limited time only.',
            buttonText: 'Shop The Collection'
        };
    }
}
