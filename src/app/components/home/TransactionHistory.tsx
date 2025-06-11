/* eslint-disable */
'use client'

import React, { useEffect, useState } from "react"
import { useApi } from "@/app/context/ApiContext"
import { CompletedSalesOrder } from "@/app/context/types/ERPNext"


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


export default function TransactionHistory() {
    const [latestOrders, setLatestOrders] = useState<CompletedSalesOrder[]>([]);
    const { getCompletedSalesOrder } = useApi();
    useEffect(() => {
        fetchOrders();
    }, []);
    const fetchOrders = async () => {
        try {
            const data = await getCompletedSalesOrder();
            console.log("🚀 ~ fetchOrders ~ data:", data)
            const completedOrders = data.map((order: CompletedSalesOrder) => ({
                name: order.name.substring(14),
                customer: order.customer,
                date: order.transaction_date,
                total: order.total,
            }));
            console.log("🚀 ~ fetchOrders ~ completedOrders:", completedOrders)
            setLatestOrders(completedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };
    return (
        <>
          <div className="flex justify-between items-center mb-2 mt-1">
            <h2 className="text-md text-gray-500 font-semibold">Transaction history</h2>
          </div>
          <hr className="border-gray-200 w-5/6 mb-2"/>
          <div className="space-y-4 w-5/6">
                {latestOrders.map((order, index) => (
                    <div key={index} className="flex justify-between items-start pb-4 border-b last:border-b-0">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-medium text-sm text-black">Order #{order.name}</h3>
                            </div>
                            <p className="text-xs text-gray-500">{order.customer}</p>
                        </div>
                        <span className="text-gray-700 text-sm">- ${order.total.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </>
    )
}