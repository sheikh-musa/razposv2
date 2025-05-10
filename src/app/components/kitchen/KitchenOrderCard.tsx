'use client'
import { useState, useEffect } from 'react';
import { SalesOrders, SalesInvoicePayload, PaymentEntryPayload, SalesOrderUpdatePayload } from '@/app/context/types/ERPNext';
import { useApi } from '@/app/context/ApiContext';
import toast from 'react-hot-toast';

type KitchenOrderCardProps = {
    order: SalesOrders;
    onPaymentToggle: (orderName: string, paymentReceived: boolean) => void;
    onPaymentMethodChange: (orderName: string, method: string) => void;
    onItemComplete: (orderName: string, itemCode: string, completed: boolean) => void;
    onOrderComplete: () => void;
};

export default function KitchenOrderCard({ 
    order, 
    onPaymentToggle, 
    onPaymentMethodChange,
    onItemComplete,
    onOrderComplete
}: KitchenOrderCardProps) {
    const { createSalesInvoice, createPaymentEntry, updateKitchenOrder } = useApi();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
    const [isCompleting, setIsCompleting] = useState(false);
    const [canComplete, setCanComplete] = useState(false);
    
    const paymentOptions = ["Cash", "Paynow", "Credit Card"];

    // Check if all items are completed and payment is received
    useEffect(() => {
        const allItemsCompleted = order.items.every(item => completedItems[item.item_code]);
        setCanComplete(order.custom_payment_complete === 1 && allItemsCompleted);
    }, [completedItems, order.custom_payment_complete, order.items]);

    const handleCheckboxChange = (itemCode: string, checked: boolean) => {
        setCompletedItems(prev => ({
            ...prev,
            [itemCode]: checked
        }));
        onItemComplete(order.name, itemCode, checked);
    };

    const handleCompleteOrder = async () => {
        try {
            setIsCompleting(true);
            const today = new Date().toISOString().split('T')[0];
            
            const invoicePayload: SalesInvoicePayload = {
                customer: order.customer,
                items: order.items.map(item => ({
                    item_code: item.item_code,
                    qty: item.qty,
                    warehouse: "Stores - R",
                    income_account: "Sales Income - R",
                    sales_order: order.name,
                })),
                update_stock: 1,
                docstatus: 1
            };

            const salesInvoiceResponse = await createSalesInvoice(invoicePayload);
            const salesInvoiceData = await salesInvoiceResponse.json();

            const paymentPayload: PaymentEntryPayload = {
                payment_type: "Receive",
                party_type: "Customer",
                party: order.customer,
                paid_to: "Petty Cash - R",
                received_amount: order.total,
                paid_amount: order.total,
                references: [{
                    reference_doctype: "Sales Invoice",
                    reference_name: salesInvoiceData.data.name
                }],
                mode_of_payment: "Cash",
                docstatus: 1
            };

            const paymentEntryResponse = await createPaymentEntry(paymentPayload);
            const paymentEntryData = await paymentEntryResponse.json();

            const updatePayload: SalesOrderUpdatePayload = {
                custom_order_complete: 1,
                custom_payment_complete: 1,
            };
            const updateResponse = await updateKitchenOrder(order.name, updatePayload);
            const updateData = await updateResponse.json();
            console.log('updateData', updateData);

            onOrderComplete();
            toast.success('Order completed and invoice created');
        } catch (error) {
            console.error('Error completing order:', error);
            toast.error('Failed to complete order');
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className='shadow-lg bg-slate-100 mr-3.5 my-3 flex flex-col border-2 p-4 rounded-md min-w-[320px] h-full max-h-[520px]'>
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
            <div className='flex-1 overflow-y-auto'>
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
            <div className='mt-4 pt-3 border-t'>
                <button 
                    onClick={handleCompleteOrder}
                    disabled={!canComplete || isCompleting}
                    className={`w-full px-4 py-2 rounded-md text-white text-sm font-medium transition-colors
                        ${!canComplete 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : isCompleting
                                ? 'bg-blue-400 cursor-wait'
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                >
                    {isCompleting 
                        ? 'Completing...' 
                        : !order.custom_payment_complete
                            ? 'Payment Required'
                            : !order.items.every(item => completedItems[item.item_code])
                                ? 'Items Pending'
                                : 'Complete Order'
                    }
                </button>
                {!canComplete && (
                    <div className='mt-2 text-xs text-gray-500'>
                        {!order.custom_payment_complete && '• Payment required'}
                        {!order.items.every(item => completedItems[item.item_code]) && '• Complete all items'}
                    </div>
                )}
            </div>
        </div>
    );
}
