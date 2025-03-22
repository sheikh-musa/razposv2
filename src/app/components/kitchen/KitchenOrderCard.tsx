'use client'
import { useState } from 'react';
import { SalesOrders } from '@/app/context/types/ERPNext';

type KitchenOrderCardProps = {
    order: SalesOrders;
    onPaymentToggle: (orderName: string, paymentReceived: boolean) => void;
    onPaymentMethodChange: (orderName: string, method: string) => void;
    onItemComplete: (orderName: string, itemCode: string, completed: boolean) => void;
};

export default function KitchenOrderCard({ 
    order, 
    onPaymentToggle, 
    onPaymentMethodChange,
    onItemComplete 
}: KitchenOrderCardProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
    
    const paymentOptions = ["Cash", "Paynow", "Credit Card"];

    const handleCheckboxChange = (itemCode: string, checked: boolean) => {
        setCompletedItems(prev => ({
            ...prev,
            [itemCode]: checked
        }));
        onItemComplete(order.name, itemCode, checked);
    };

    return (
        <div className='shadow-lg bg-slate-100 mr-3.5 my-5 flex flex-col border-2 p-4 rounded-md min-w-[320px] overflow-y-auto'>
            <div className='border-b pb-3'>
                <p className='font-bold text-xl'>Order No: #{order.name}</p>
                <p className='text-sm my-2'>Order placed <span className='text-slate-500'>
                    {new Date(order.transaction_date).toLocaleTimeString()}
                </span></p>
                <div className='flex gap-2 mt-4'>
                    <button 
                        onClick={() => onPaymentToggle(order.name, !order.custom_payment_complete)}
                        className={`text-xs px-4 py-2 ${
                            order.custom_payment_complete 
                                ? 'bg-green-500 hover:bg-green-600' 
                                : 'bg-red-500 hover:bg-red-600'
                        } text-white rounded-md`}
                    >
                        {order.custom_payment_complete ? 'Payment Received' : 'Payment Pending'}
                    </button>
                    <div className="relative">
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className='text-xs px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300 flex items-center gap-2'
                        >
                            {order.custom_payment_mode}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg">
                                {paymentOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            onPaymentMethodChange(order.name, option);
                                            setIsDropdownOpen(false);
                                        }}
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
                <p className='font-medium'>Total: <span className='font-light'>${order.total.toFixed(2)}</span></p>
                <p className='font-medium'>Items: <span className='font-light'>{order.items.length}</span></p>
            </div>
            <div className='py-3'>
                <p className='font-bold mb-3'>Remaining order:</p>
                {order.items.map((item, idx) => (
                    <div key={idx} className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-3'>
                            <input 
                                type="checkbox" 
                                className='w-4 h-4'
                                checked={completedItems[item.item_code] || false}
                                onChange={(e) => handleCheckboxChange(item.item_code, e.target.checked)}
                            />
                            <div className={completedItems[item.item_code] ? 'line-through text-gray-400' : ''}>
                                <p className='font-medium'>{item.item_code}</p>
                                <p className='text-slate-600'>Qty: {item.qty}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {order.custom_remarks && (
                <div className='pt-3 border-t'>
                    <p className='text-red-500 font-medium'>Remarks:</p>
                    <p className='text-slate-600'>{order.custom_remarks}</p>
                </div>
            )}
        </div>
    );
}
