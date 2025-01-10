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
        variantType: number,
        product: Product[];
        totalPrice: number;
        date: string; // Format: YYYY-MM-DD
        time: string; // Format: HH:mm:ss
        completed: boolean;
        paymentBy: string;
        paymentReceived: boolean,
        remarks: string;
    };
    const [incompleteOrder, setIncompleteOrder] = useState<Order[]>([]);
    const [itemSummary, setItemSummary] = useState<Record<string, number>>({});
    const [isDropdownOpen, setIsDropdownOpen] = useState<Record<number, boolean>>({});
    const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

    const paymentOptions = ["Cash", "Paynow", "Credit Card"];

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

    const handlePaymentToggle = (orderId: number, paymentReceived: boolean) => {
        setIncompleteOrder(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId 
                    ? { ...order, paymentReceived: paymentReceived }
                    : order
            )
        );

        // Optional: Update the backend
        fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentReceived }),
        });
    };

    const handleAddQty = (orderId: number, variantId: number) => {
        setIncompleteOrder(prevOrders => 
            prevOrders.map(order => {
                if (order.id === orderId) {
                    return {
                        ...order,
                        product: order.product.map(product => ({
                            ...product,
                            variants: product.variants.map(variant => 
                                variant.productId === variantId
                                    ? { ...variant, orderQuantity: variant.orderQuantity + 1 }
                                    : variant
                            )
                        }))
                    };
                }
                return order;
            })
        );

        // Optional: Update the backend
        // fetch(`/api/orders/${orderId}/variant/${variantId}`, {
        //     method: 'PATCH',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ increment: 1 }),
        // });
    };

    const handleMinusQty = (orderId: number, variantId: number) => {
        setIncompleteOrder(prevOrders => 
            prevOrders.map(order => {
                if (order.id === orderId) {
                    return {
                        ...order,
                        product: order.product.map(product => ({
                            ...product,
                            variants: product.variants.map(variant => 
                                variant.productId === variantId && variant.orderQuantity > 0
                                    ? { ...variant, orderQuantity: variant.orderQuantity - 1 }
                                    : variant
                            )
                        }))
                    };
                }
                return order;
            })
        );

        // Optional: Update the backend
        // fetch(`/api/orders/${orderId}/variant/${variantId}`, {
        //     method: 'PATCH',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ increment: -1 }),
        // });
    };

    const handlePaymentMethodChange = (orderId: number, paymentMethod: string) => {
        setIncompleteOrder(prevOrders => 
            prevOrders.map(order => 
                order.id === orderId 
                    ? { ...order, paymentBy: paymentMethod }
                    : order
            )
        );
        setIsDropdownOpen(prev => ({...prev, [orderId]: false}));

        // Optional: Update the backend
        // fetch(`/api/orders/${orderId}`, {
        //     method: 'PATCH',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ paymentBy: paymentMethod }),
        // });
    };

    const handleCheckboxChange = (orderId: number, variantId: number, checked: boolean) => {
        const key = `${orderId}-${variantId}`;
        setCompletedItems(prev => ({...prev, [key]: checked}));
        
        setIncompleteOrder(prevOrders => 
            prevOrders.map(order => {
                if (order.id === orderId) {
                    // Find current quantity before updating
                    const currentVariant = order.product
                        .flatMap(p => p.variants)
                        .find(v => v.productId === variantId);
                    
                    const quantityToSubtract = currentVariant?.orderQuantity || 0;

                    return {
                        ...order,
                        variantType: checked 
                            ? order.variantType - 1 
                            : order.variantType + 1,
                        product: order.product.map(product => ({
                            ...product,
                            variants: product.variants.map(variant => 
                                variant.productId === variantId
                                    ? { 
                                        ...variant, 
                                        orderQuantity: checked ? 0 : variant.orderQuantity 
                                      }
                                    : variant
                            )
                        }))
                    };
                }
                return order;
            })
        );

        // Optional: Update the backend
        // fetch(`/api/orders/${orderId}`, {
        //     method: 'PATCH',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ 
        //         variantType: checked ? -1 : 1,
        //         orderQuantity: 0,
        //         completed: checked 
        //     }),
        // });
    };

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
            <div className='flex overflow-x-auto mt-2 h-2/3'>
                {incompleteOrder.map((order) => 
                    <div key={order.id} className='shadow-lg bg-slate-100 mr-3.5 my-5 flex flex-col border-2 p-4 rounded-md min-w-[320px] overflow-y-auto'>
                        <div className='border-b pb-3'>
                            <p className='font-bold text-xl'>Order No: #{order.id}</p>
                            <p className='text-sm my-2'>Order placed <span className='text-slate-500'>{order.time}</span></p>
                            <div className='flex gap-2 mt-4'>
                                {order.paymentReceived ? (
                                    <button 
                                        onClick={() => handlePaymentToggle(order.id, false)}
                                        className='text-xs px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600'
                                    >
                                        Payment Received
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handlePaymentToggle(order.id, true)}
                                        className='text-xs px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600'
                                    >
                                        Payment Pending
                                    </button>
                                )}
                                <div className="relative">
                                    <button 
                                        onClick={() => setIsDropdownOpen(prev => ({...prev, [order.id]: !prev[order.id]}))}
                                        className='text-xs px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300 flex items-center gap-2'
                                    >
                                        {order.paymentBy}
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {isDropdownOpen[order.id] && (
                                        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg">
                                            {paymentOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => handlePaymentMethodChange(order.id, option)}
                                                    className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-slate-100 first:rounded-t-md last:rounded-b-md"
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='py-3 border-b text-sm'>
                            {/* <p>Order No: <span className='font-medium'>#{order.id}</span></p> */}
                            <p className='font-medium'>Total: <span className='font-light'>${order.totalPrice.toFixed(2)}</span></p>
                            <p className='font-medium'>Items: <span className='font-light'>{order.variantType}</span></p>
                        </div>
                        <div className='py-3'>
                            <p className='font-bold mb-3'>Remaining order:</p>
                            {order.product.map((product) =>
                                product.variants.map((variant, idx) => (
                                    <div key={idx} className='flex items-center justify-between mb-2'>
                                        <div className='flex items-center gap-3'>
                                            <input 
                                                type="checkbox" 
                                                className='w-4 h-4'
                                                checked={completedItems[`${order.id}-${variant.productId}`]}
                                                onChange={(e) => handleCheckboxChange(order.id, variant.productId, e.target.checked)}
                                            />
                                            <div className={completedItems[`${order.id}-${variant.productId}`] ? 'line-through text-gray-400' : ''}>
                                                <p className='font-medium'>{product.type}</p>
                                                <p className='text-slate-600'>{variant.name}</p>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <button
                                                onClick={() => handleMinusQty(order.id, variant.productId)} 
                                                className='w-8 h-8 bg-slate-200 rounded-md disabled:opacity-50'
                                                disabled={variant.orderQuantity <= 0 || completedItems[`${order.id}-${variant.productId}`]}
                                            >
                                                -
                                            </button>
                                            <span className='w-8 text-center'>{variant.orderQuantity}</span>
                                            <button 
                                                onClick={() => handleAddQty(order.id, variant.productId)}
                                                className='w-8 h-8 bg-slate-200 rounded-md disabled:opacity-50'
                                                disabled={completedItems[`${order.id}-${variant.productId}`]}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className='pt-3 border-t'>
                            <p className='text-red-500 font-medium'>Remarks:</p>
                            <p className='text-slate-600'>{order.remarks}</p>
                        </div>
                    </div>
                )}
            </div>
                {/* <p>{JSON.stringify(incompleteOrder)}</p> */}
        </div>
    )
}
