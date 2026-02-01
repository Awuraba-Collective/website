
import { isDiscountActive } from './lib/utils/currency';

const today = new Date();
const formattedToday = today.toISOString().split('T')[0];

console.log('Testing isDiscountActive with end date set to today (string):', formattedToday);

const discount = {
    isActive: true,
    startDate: '2020-01-01',
    endDate: formattedToday
};

const active = isDiscountActive(discount);
console.log('Result:', active ? 'ACTIVE (Correct)' : 'INACTIVE (Incorrect)');

const discountWithT = {
    isActive: true,
    startDate: '2020-01-01',
    endDate: formattedToday + 'T00:00:00.000Z'
};

const activeWithT = isDiscountActive(discountWithT);
console.log('Testing with T (00:00:00):', activeWithT ? 'ACTIVE' : 'INACTIVE (Expected if time is past)');

const discountExpired = {
    isActive: true,
    startDate: '2020-01-01',
    endDate: '2020-12-31'
};
console.log('Testing with expired date:', isDiscountActive(discountExpired) ? 'ACTIVE (Incorrect)' : 'INACTIVE (Correct)');
