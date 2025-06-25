import { RevenueEntry } from "./types/ERPNext";

// export const mockRevenueData: RevenueEntry[] = [
//     {
//         "paid_amount": 1248.50,
//         "posting_date": "2024-03-01"
//     },
//     {
//         "paid_amount": 2156.75,
//         "posting_date": "2024-03-15"
//     },
//     {
//         "paid_amount": 1897.25,
//         "posting_date": "2024-03-28"
//     },
//     {
//         "paid_amount": 2450.00,
//         "posting_date": "2024-02-10"
//     },
//     // Add more realistic data...
// ];

export const mockPaymentMethodData = [
    { name: 'Cash', value: 35, color: '#7C3AED' },
    { name: 'Credit Card', value: 25, color: '#9461FB' },
    { name: 'PayNow', value: 20, color: '#B794FF' },
    { name: 'E-payment', value: 15, color: '#D4B5FF' },
    { name: 'CDC', value: 5, color: '#EBD7FF' },
];

// Add other mock data as needed 