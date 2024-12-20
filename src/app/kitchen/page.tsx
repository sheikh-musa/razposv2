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
        <div className="flex flex-col h-screen bg-white text-black font-sans">
            <div>
            <h1 className="text-2xl font-bold ">Kitchen</h1>
            </div>
            <div className='mt-2 bg-slate-100 pl-4 py-2 rounded-md shadow-lg'>
                <h3 className='font-semibold'>Summary item count</h3>
                    <div className='flex overflow-x-auto'>
                    {Object.entries(itemSummary).map(([key, count]) => (
                        <div key={key} className="shadow-lg flex-shrink-0 flex flex-col bg-slate-50 m-2 rounded-md p-2 items-center min-w-[150px] w-[200px]"> 
                            <span className='font-semibold'>{key.split(" ")[0]}</span>
                            <span>{key.split(" ").slice(1).join(" ")}</span>
                            <span>{count}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className='flex'>
                {incompleteOrder.map((order) => 
                    <div key={order.id} className='shadow-lg bg-slate-100 mr-2 my-5 flex flex-col border-2 p-4 rounded-md'>
                        <div>
                            <p className='font-bold text-xl'>Order No: #{order.id}</p>
                            <p className='text-xs my-2 font-bold'>Order placed <span className='text-slate-500'>{order.time}</span></p>
                        </div>
                        <div className='flex flex-col'>
                            <button type="button" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 text-xs rounded-lg px-5 py-2.5 me-2 my-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Payment received</button>
                            
                        </div>
                    </div>
                )}
            </div>
                <p>{JSON.stringify(incompleteOrder)}</p>
        </div>
    )
}
