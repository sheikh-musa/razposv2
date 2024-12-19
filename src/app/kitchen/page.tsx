'use client'
import React, { useEffect, useState } from 'react';


export default function Kitchen() {

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
        completed: boolean;
    };
    const [incompleteOrder, setIncompleteOrder] = useState<Order[]>([]);
    const [itemSummary, setItemSummary] = useState<Record<string, number>>({});

    useEffect(() => {
      fetch("/api/orders")
      .then((res) => res.json())
      .then((data: Order[]) => {
        // Filter orders that are not completed
        const incompleteOrders = data.filter((order) => !order.completed);
        setIncompleteOrder(incompleteOrders); // Store only incomplete orders

        const summary: Record<string, number> = {};
        incompleteOrders.forEach((order) => {
          order.product.forEach((product) => {
            product.variants.forEach((variant) => {
              const key = `${product.type} (${variant.name})`;
              summary[key] = (summary[key] || 0) + variant.orderQuantity;
            });
          });
        });

        setItemSummary(summary);
      })
      }, [])


    return (
        <div className="flex flex-col h-screen bg-white text-black">
            <div>
            <h1 className="text-2xl font-bold ">Kitchen</h1>
            </div>
            <div className='mt-2 bg-slate-200 pl-4 py-2 rounded-md'>
                <h3 className='font-semibold'>Summary item count</h3>
                    <div className='flex'>
                    {Object.entries(itemSummary).map(([key, count]) => (
                        <div key={key} className="flex flex-col bg-gray-100 m-2 rounded-md p-2 items-center"> 
                            <span className='font-semibold'>{key.split(" ")[0]}</span>
                            <span>{key.split(" ").slice(1).join(" ")}</span>
                            <span>{count}</span>

                        </div>
                    ))}
                </div>
            </div>
            <div className='flex'>
                {incompleteOrder.map((order) => 
                    <div key={order.id} className='mr-2 my-5 flex flex-col border-2 p-2 rounded-md'>
                        <div>
                            <p className='font-bold'>Order No: #{order.id}</p>
                        </div>
                    </div>
                )}
            </div>
                <p>{JSON.stringify(incompleteOrder)}</p>
        </div>
    )
}
