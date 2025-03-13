'use client'
import React, { useEffect, useState } from 'react';
import { useApi } from '../context/ApiContext';
import { SalesOrders } from '../context/types/ERPNext';

export default function Kitchen() {
    const { fetchKitchenOrderNames, fetchKitchenOrderDetails } = useApi();
    const [orders, setOrders] = useState<SalesOrders[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [itemSummary, setItemSummary] = useState<Record<string, number>>({});
    const [isDropdownOpen, setIsDropdownOpen] = useState<Record<string, boolean>>({});
    const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

    const paymentOptions = ["Cash", "Paynow", "Credit Card"];

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                // First, fetch all order names
                const orderNames = await fetchKitchenOrderNames();
                
                // Then fetch details for each order
                const ordersWithDetails = await Promise.all(
                    orderNames.map(async (orders) => {
                        const details = await fetchKitchenOrderDetails(orders.name);
                        return details;
                    })
                );

                // Flatten the array if fetchKitchenOrderDetails returns an array
                const flattenedOrders = ordersWithDetails.flat();

                // ! Custom status is not a valid field in the API for now
                // Filter out completed orders
                const incompleteOrders = flattenedOrders.filter(order => !order.custom_status);
                setOrders(incompleteOrders);
                console.log('incompleteOrders', incompleteOrders);
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

        loadOrders();
    }, []);

    const handlePaymentToggle = async (orderName: string, paymentReceived: boolean) => {
        try {
            // Update local state
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.name === orderName 
                        ? { ...order, payment_received: paymentReceived }
                        : order
                )
            );

            // Update backend
            // Add your API call here to update payment status
        } catch (error) {
            console.error('Error updating payment status:', error);
            // Revert local state if API call fails
        }
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
            
            // TODO add logic to display orders
            {/* Orders Section */}
            <div className='flex overflow-x-auto mt-2 h-2/3'>
                {orders.map((order) => (
                    <div key={order.name} className='shadow-lg bg-slate-100 mr-3.5 my-5 flex flex-col border-2 p-4 rounded-md min-w-[320px] overflow-y-auto'>
                        {/* Order header and content */}
                        {/* Update this section based on your KitchenOrder type structure */}
                    </div>
                ))}
            </div>
        </div>
    );
}
