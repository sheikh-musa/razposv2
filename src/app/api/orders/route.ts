import { NextResponse } from "next/server";

// Define types
type Variant = {
    productId: number;
    name: string;
    price: number;
    orderQuantity: number;
};

type Product = {
    type: string;
    variants: Variant[];
};

type Order = {
    id: number;
    itemsType: number;
    variantType: number;
    product: Product[];
    totalPrice: number;
    date: string; // Format: YYYY-MM-DD
    time: string; // Format: HH:mm:ss
    paymentBy: string;
    paymentReceived: boolean;
    completed: boolean;
    remarks: string;
};

const generateOrders = (): Order[] => {
    const orders: Order[] = [];
    let orderId = 1;
    
    // Product types and their variants
    const productTypes = {
        'Croissant': ['Chocolate', 'Plain', 'Almond'],
        'Baguette': ['Traditional', 'Sesame', 'Whole Grain'],
        'Focaccia': ['Rosemary', 'Olive', 'Tomato'],
        'Sourdough': ['Classic', 'Rye', 'Whole Wheat'],
        'Danish': ['Apple', 'Cherry', 'Cream Cheese'],
        'Muffin': ['Blueberry', 'Chocolate Chip', 'Banana Nut']
    };

    const paymentMethods = ['Cash', 'Credit Card', 'PayNow', 'E-payment'];

    // Generate orders for each month of 2024
    for (let month = 1; month <= 12; month++) {
        // Generate 3-5 orders per month
        const ordersThisMonth = Math.floor(Math.random() * 3) + 3; // 3-5 orders

        for (let i = 0; i < ordersThisMonth; i++) {
            // Random day of month
            const day = Math.floor(Math.random() * 28) + 1;
            const hour = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
            const minute = Math.floor(Math.random() * 60);

            // Format date and time
            const date = `2024-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

            // Generate random products
            const numProductTypes = Math.floor(Math.random() * 3) + 1; // 1-3 product types
            const products: Product[] = [];
            let totalPrice = 0;

            // Select random product types
            const availableTypes = Object.keys(productTypes);
            const selectedTypes = new Set();
            while (selectedTypes.size < numProductTypes) {
                selectedTypes.add(availableTypes[Math.floor(Math.random() * availableTypes.length)]);
            }

            // Generate variants for each selected product type
            selectedTypes.forEach(type => {
                const variants: Variant[] = [];
                const numVariants = Math.floor(Math.random() * 2) + 1; // 1-2 variants per type
                
                for (let j = 0; j < numVariants; j++) {
                    const variantName = productTypes[type as keyof typeof productTypes][j];
                    const price = Math.floor(Math.random() * 6) + 3; // $3-8
                    const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 items
                    
                    variants.push({
                        productId: j + 1,
                        name: variantName,
                        price: price,
                        orderQuantity: quantity
                    });
                    
                    totalPrice += price * quantity;
                }

                products.push({
                    type: type as string,
                    variants: variants
                });
            });

            orders.push({
                id: orderId++,
                itemsType: products.length,
                variantType: products.reduce((acc, prod) => acc + prod.variants.length, 0),
                product: products,
                totalPrice: totalPrice,
                date: date,
                time: time,
                paymentBy: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                paymentReceived: true,
                completed: true,
                remarks: Math.random() > 0.7 ? "Extra crispy" : "" // 30% chance of having remarks
            });
        }
    }
// Add 4 latest orders where completed: false
const latestDate = "2024-12-31"; // Latest date for the additional orders
const latestTimes = ["18:30:00", "19:00:00", "19:30:00", "20:00:00"];

for (let i = 0; i < 4; i++) {
    orders.push({
        id: orderId++,
        itemsType: 2,
        variantType: 4,
        product: [
            {
                type: "Croissant",
                variants: [
                    { productId: 1, name: "Chocolate", price: 5, orderQuantity: 2 },
                    { productId: 2, name: "Almond", price: 6, orderQuantity: 1 }
                ]
            },
            {
                type: "Muffin",
                variants: [
                    { productId: 1, name: "Blueberry", price: 4, orderQuantity: 3 },
                    { productId: 2, name: "Banana Nut", price: 5, orderQuantity: 2 }
                ]
            }
        ],
        totalPrice: 37,
        date: latestDate,
        time: latestTimes[i],
        paymentBy: "Credit Card",
        paymentReceived: false,
        completed: false,
        remarks: "Pending confirmation"
    });
}
    // Sort orders by date and time
    return orders.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime(); // Descending order
    });
};



const orders = generateOrders();

export async function GET() {
    return NextResponse.json(orders);
}


  
