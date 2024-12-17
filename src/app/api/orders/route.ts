import { NextResponse } from "next/server";

// Define types
type Variant = {
    name: string;
    price: number;
    productId: number;
    orderQuantity: number;
};
type Product = {
    type: string;
    variants: Variant[];
  };
type Order = {
    id: number;
    itemsType: number;
    product: Product[];
    totalPrice: number;
    date: string; // Format: YYYY-MM-DD
    time: string; // Format: HH:mm:ss
};

const orders: Order[] = [
  {
    id: 1,
    itemsType: 2,
    product: 
        [   
            {
                type: "Croissant", 
                variants: 
                        [
                            {name: "Chocolate", price: 5, productId: 1, orderQuantity: 3},
                            {name: "Plain", price: 5, productId: 1, orderQuantity: 3},
                        ]
            },
            {
                type: "Donut",
                variants: 
                        [
                            {name: "Plain", price: 3, productId: 3, orderQuantity: 5}
                        ]
            }
        ],
    totalPrice: 45,
    date: "2024-12-16",
    time: "10:30:00",
  },
];

// API handler
export async function GET() {
    return NextResponse.json(orders);
  }
  
