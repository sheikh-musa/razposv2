import { NextResponse } from "next/server";

type VariantSale = {
    quantity: number;
    revenue: number;
};

type ProductSale = {
    quantity: number;
    revenue: number;
    variants: {
        [key: string]: VariantSale;
    };
};

type DailySale = {
    date: string;  // YYYY-MM-DD
    totalSales: number;
    orderCount: number;
    itemsSold: number;
    paymentMethods: {
        cash: number;
        creditCard: number;
        payNow: number;
    };
    productSales: {
        [key: string]: ProductSale;
    };
    dineInCount: number;
    takeawayCount: number;
}

type MonthlySales = {
    month: number;  // 1-12
    year: number;
    totalSales: number;
    orderCount: number;
    itemsSold: number;
    paymentMethods: {
        cash: number;
        creditCard: number;
        payNow: number;
    };
    productSales: {
        [key: string]: ProductSale;
    };
    dineInCount: number;
    takeawayCount: number;
    dailySales: DailySale[];
}

// Mock data for one year
const mockSalesData: MonthlySales[] = Array.from({ length: 12 }, (_, monthIndex) => {
    const daysInMonth = new Date(2024, monthIndex + 1, 0).getDate();
    
    const dailySales: DailySale[] = Array.from({ length: daysInMonth }, (_, dayIndex) => {
        // Generate random daily data
        const date = new Date(2024, monthIndex, dayIndex + 1);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const baseOrders = isWeekend ? 45 : 30; // More orders on weekends
        const orderCount = baseOrders + Math.floor(Math.random() * 20);
        
        const productTypes = ["Bagels", "Pastries", "Muffins", "Cookies", "Croissants"];
        const variants = {
            "Bagels": ["Plain", "Sesame", "Everything", "Blueberry"],
            "Pastries": ["Chicken Ham & Cheese", "Chocolate", "Apple"],
            "Muffins": ["Chocolate Chip", "Blueberry", "Banana Walnut"],
            "Cookies": ["Chocolate Chip", "Oatmeal Raisin", "Peanut Butter"],
            "Croissants": ["Classic", "Almond", "Chocolate"]
        };

        const productSales: { [key: string]: ProductSale } = {};
        let totalSales = 0;
        let itemsSold = 0;

        productTypes.forEach(type => {
            const typeQuantity = Math.floor(Math.random() * 50) + 20;
            const variantSales: { [key: string]: VariantSale } = {};
            
            variants[type as keyof typeof variants].forEach(variant => {
                const quantity = Math.floor(Math.random() * (typeQuantity / 2)) + 5;
                const price = Math.floor(Math.random() * 3) + 3; // $3-$6
                const revenue = quantity * price;
                
                variantSales[variant] = {
                    quantity,
                    revenue
                };
                
                totalSales += revenue;
                itemsSold += quantity;
            });

            productSales[type] = {
                quantity: typeQuantity,
                revenue: Object.values(variantSales).reduce((acc: number, curr: VariantSale) => acc + curr.revenue, 0),
                variants: variantSales
            };
        });

        const cashPayment = totalSales * (0.4 + Math.random() * 0.2); // 40-60% cash
        const creditCardPayment = totalSales * (0.2 + Math.random() * 0.2); // 20-40% credit card
        const payNowPayment = totalSales - cashPayment - creditCardPayment; // remainder

        return {
            date: date.toISOString().split('T')[0],
            totalSales,
            orderCount,
            itemsSold,
            paymentMethods: {
                cash: Number(cashPayment.toFixed(2)),
                creditCard: Number(creditCardPayment.toFixed(2)),
                payNow: Number(payNowPayment.toFixed(2))
            },
            productSales,
            dineInCount: Math.floor(orderCount * 0.6),
            takeawayCount: Math.floor(orderCount * 0.4)
        };
    });

    // Calculate monthly totals
    const monthlyTotals = dailySales.reduce((acc, day) => ({
        totalSales: acc.totalSales + day.totalSales,
        orderCount: acc.orderCount + day.orderCount,
        itemsSold: acc.itemsSold + day.itemsSold,
        paymentMethods: {
            cash: acc.paymentMethods.cash + day.paymentMethods.cash,
            creditCard: acc.paymentMethods.creditCard + day.paymentMethods.creditCard,
            payNow: acc.paymentMethods.payNow + day.paymentMethods.payNow
        },
        dineInCount: acc.dineInCount + day.dineInCount,
        takeawayCount: acc.takeawayCount + day.takeawayCount
    }), {
        totalSales: 0,
        orderCount: 0,
        itemsSold: 0,
        paymentMethods: { cash: 0, creditCard: 0, payNow: 0 },
        dineInCount: 0,
        takeawayCount: 0
    });

    return {
        month: monthIndex + 1,
        year: 2024,
        ...monthlyTotals,
        productSales: dailySales[0].productSales, // Simplified: using first day's product breakdown
        dailySales
    };
});

export async function GET() {
    return NextResponse.json(mockSalesData);
}
