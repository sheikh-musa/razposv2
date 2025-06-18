/* eslint-disable */
'use client'

import React, { useEffect, useState } from "react"
import { useApi } from "@/app/context/ApiContext"
import { CompletedSalesOrder } from "@/app/context/types/ERPNext"


export default function TransactionHistory() {
    const [latestOrders, setLatestOrders] = useState<CompletedSalesOrder[]>([]);
    const { getCompletedSalesOrder } = useApi();

    useEffect(() => {
        fetchOrders();
    }, []);
    const fetchOrders = async () => {
        try {
            const data = await getCompletedSalesOrder();
            console.log('data', data);
            const completedOrders = data.map((order: CompletedSalesOrder) => (
                {
                name: order.name.substring(14),
                customer: order.customer,
                date: order.date,
                total: order.total,
            }));
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
          <div className="space-y-4 w-5/6 overflow-y-auto h-full">
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