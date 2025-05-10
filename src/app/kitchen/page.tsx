'use client'
import React, { useEffect, useState } from 'react';
import { useApi } from '../context/ApiContext';
import { SalesOrders } from '../context/types/ERPNext';
import KitchenOrderCard from '@/app/components/kitchen/KitchenOrderCard';

export default function Kitchen() {
    const { fetchKitchenOrderNames, fetchKitchenOrderDetails } = useApi();
    const [orders, setOrders] = useState<SalesOrders[]>([]);
    const [showOrders, setShowOrders] = useState(true);
    const [completedOrders, setCompletedOrders] = useState<SalesOrders[]>([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [itemSummary, setItemSummary] = useState<Record<string, number>>({});
    const [isDropdownOpen, setIsDropdownOpen] = useState<Record<string, boolean>>({});
    const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

    const paymentOptions = ["Cash", "Paynow", "Credit Card"];

    const loadOrders = async () => {
        try {
            setLoading(true);
            const orderNames = await fetchKitchenOrderNames();
            
            const ordersWithDetails = await Promise.all(
                orderNames.map(async (orders) => {
                    const details = await fetchKitchenOrderDetails(orders.name);
                    return details;
                })
            );

            const flattenedOrders = ordersWithDetails.flat();

            // Separate completed and incomplete orders
            const incompleteOrders = flattenedOrders.filter(order => !order.custom_order_complete);
            const completedOrders = flattenedOrders.filter(order => order.custom_order_complete === 1);
            console.log('completedOrders', completedOrders);
            console.log('incompleteOrders', incompleteOrders);
            setOrders(incompleteOrders);
            setCompletedOrders(completedOrders);
            
            // Calculate item summary
            const summary: Record<string, number> = {};
            incompleteOrders.forEach((order) => {
                order.items.forEach((item) => {
                    const key = `${item.item_code}`;
                    summary[key] = (summary[key] || 0) + item.qty;
                });
            });
            setItemSummary(summary);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);


    const handlePaymentMethodChange = async (orderName: string, method: string) => {
        // Add API call to update payment method
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.name === orderName
                    ? { ...order, payment_method: method }
                    : order
            )
        );
    };

    const handleItemComplete = async (orderName: string, itemCode: string, completed: boolean) => {
        // Add API call to update item completion status
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.name === orderName
                    ? {
                        ...order,
                        items: order.items.map(item =>
                            item.item_code === itemCode
                                ? { ...item, completed }
                                : item
                        )
                    }
                    : order
            )
        );
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex flex-col h-screen bg-white text-black font-sans">
            <div>
                <h1 className="text-2xl font-bold">Kitchen</h1>
            </div>
            
            {/* Summary Section */}
            <div className='mt-2 bg-slate-100 pl-4 py-2 rounded-md shadow-lg'>
                <h3 className='font-semibold'>Summary item count</h3>
                <div className='flex overflow-x-auto'>
                    {Object.entries(itemSummary).map(([key, count]) => (
                        <div key={key} className="shadow-lg flex-shrink-0 flex flex-col bg-slate-50 m-2 rounded-md p-2 items-center min-w-[150px] w-[200px]">
                            <span className='font-semibold'>{key}</span>
                            <span>{count}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Orders Section */}
            <div className='mt-2 bg-slate-100 pl-4 py-2 rounded-md shadow-lg'>
            <button 
                    onClick={() => setShowOrders(!showOrders)}
                    className="flex items-center gap-2 font-semibold"
                >
                    <h3>Pending Orders ({orders.length})</h3>
                    <svg 
                        className={`w-4 h-4 transition-transform ${showOrders ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

            {showOrders && (
                <div className='flex overflow-x-auto mt-2 mb-2 h-[550px]'>
                {orders.map((order) => (
                    <KitchenOrderCard
                        key={order.name}
                        order={order}
                        onPaymentMethodChange={handlePaymentMethodChange}
                        onItemComplete={handleItemComplete}
                        onOrderComplete={loadOrders}
                    />   
                    ))}
                    </div>
                )}
            </div>

            {/* Completed Orders Section */}
            <div className='mt-2 bg-slate-100 pl-4 py-2 rounded-md shadow-lg'>
                <button 
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-2 font-semibold"
                >
                    <h3>Completed Orders ({completedOrders.length})</h3>
                    <svg 
                        className={`w-4 h-4 transition-transform ${showCompleted ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                
                {showCompleted && (
                    <div className='flex overflow-x-auto mt-2'>
                        {completedOrders.map((order) => (
                            <KitchenOrderCard
                                key={order.name}
                                order={order}
                                onPaymentMethodChange={handlePaymentMethodChange}
                                onItemComplete={handleItemComplete}
                                onOrderComplete={loadOrders}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
