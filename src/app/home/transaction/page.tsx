'use client'

import React, { useEffect, useState } from "react"

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


export default function Transaction() {
    const [latestOrders, setLatestOrders] = useState<Order[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/orders');
                const data = await response.json();
                // Filter completed orders and get latest 8
                const completedOrders = data
                    .filter((order: Order) => order.completed)
                    .slice(0, 8);
                setLatestOrders(completedOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, []);

    return (
        <>
          <div className="flex justify-between items-center mb-2 mt-1">
            <h2 className="text-md text-gray-500 font-semibold">Transaction history</h2>
          </div>
          <hr className="border-gray-200 w-5/6 mb-2"/>
          <div className="space-y-4 w-5/6">
                {latestOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-start pb-4 border-b last:border-b-0">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-medium text-sm text-black">Order #{order.id}</h3>
                            </div>
                            <p className="text-xs text-gray-500">olivia@untitledui.com</p>
                        </div>
                        <span className="text-gray-700 text-sm">- ${order.totalPrice.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </>
    )
}