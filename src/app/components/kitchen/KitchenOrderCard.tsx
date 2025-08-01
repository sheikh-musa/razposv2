'use client'
import { useState, useEffect } from 'react';
import { SalesOrders, SalesInvoicePayload, PaymentEntryPayload, SalesOrderUpdatePayload, PaymentUpdatePayload } from '@/app/context/types/ERPNext';
import { useApi } from '@/app/context/ApiContext';
import toast from 'react-hot-toast';

type KitchenOrderCardProps = {
    order: SalesOrders;
    onItemComplete: (orderName: string, itemCode: string, completed: boolean) => void;
    onOrderComplete: () => void;
};

export default function KitchenOrderCard({ 
    order, 
    onItemComplete,
    onOrderComplete
}: KitchenOrderCardProps) {
    const { createSalesInvoice, createPaymentEntry, updateKitchenOrder, updateKitchenOrderPayment, getCompanyName } = useApi();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
    const [isCompleting, setIsCompleting] = useState(false);
    const [canComplete, setCanComplete] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(order.custom_payment_complete);
    const [paymentMethod, setPaymentMethod] = useState(order.custom_payment_mode);

    const paymentOptions = ["Cash", "Paynow", "Debit/Credit Card", "NETS"];

    // Check if all items are completed and payment is received
    useEffect(() => {
        const allItemsCompleted = order.items.every(item => completedItems[item.item_code]);
        setCanComplete(paymentStatus === 1 && allItemsCompleted);
    }, [completedItems, paymentStatus, order.items]);

    const handleCheckboxChange = (itemCode: string, checked: boolean) => {
        setCompletedItems(prev => ({
            ...prev,
            [itemCode]: checked
        }));
        onItemComplete(order.name, itemCode, checked);
    };

    const handlePaymentToggle = () => {
        setPaymentStatus(prev => prev === 1 ? 0 : 1);
    };

    const handlePaymentMethodChange = async (orderName: string, method: string) => {
        const payload: PaymentUpdatePayload = {
            custom_payment_mode: method
        };
        const response = await updateKitchenOrderPayment(orderName, payload);
        const data = await response.json();
        console.log('data', data.data); // ! console log
        toast.success('Payment method updated');
    };

    const handleCompleteOrder = async () => {
        try {
            setIsCompleting(true);
            // const today = new Date().toISOString().split('T')[0];
            const companyName = await getCompanyName();
            // @ts-expect-error - companyName is a string
            const companyNameString = companyName.charAt(0);
            
            const invoicePayload: SalesInvoicePayload = {
                customer: order.customer,
                items: order.items.map(item => ({
                    item_code: item.item_code,
                    qty: item.qty,
                    warehouse: `Stores - ${companyNameString}`,
                    income_account: `Sales Income - ${companyNameString}`,
                    sales_order: order.name,
                })),
                update_stock: 1,
                disable_rounded_total: 1,
                docstatus: 1
            };
            console.log('invoicePayload', invoicePayload);
            const salesInvoiceResponse = await createSalesInvoice(invoicePayload);
            const salesInvoiceData = await salesInvoiceResponse.json();

            console.log('salesInvoiceData', salesInvoiceData); // ! CONSOLE LOG

            const paymentPayload: PaymentEntryPayload = {
                payment_type: "Receive",
                party_type: "Customer",
                party: order.customer,
                paid_to: `Petty Cash - ${companyNameString}`, // ! if Bank Account - R, then reference no. needed regardless of mode of payment
                received_amount: order.total,
                paid_amount: order.total,
                references: [{
                    reference_doctype: "Sales Invoice",
                    reference_name: salesInvoiceData.data.name,
                    total_amount: order.total,
                    outstanding_amount: order.total,
                    allocated_amount: order.total,
                }],
                mode_of_payment: paymentMethod,
                docstatus: 1
            };
            console.log('paymentPayload', paymentPayload); // ! console log
            const paymentEntryResponse = await createPaymentEntry(paymentPayload);
            const paymentEntryData = await paymentEntryResponse.json();

            console.log('paymentEntryData', paymentEntryData); // ! CONSOLE LOG
            const updatePayload: SalesOrderUpdatePayload = {
                custom_order_complete: 1,
                custom_payment_complete: 1,
            };
            const updateResponse = await updateKitchenOrder(order.name, updatePayload);
            const updateData = await updateResponse.json();
            console.log('updateData', updateData); // ! CONSOLE LOG

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
                    {new Date(order.creation).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span></p>
                <div className='flex gap-2 mt-4'>
                    <button 
                        onClick={handlePaymentToggle}
                        className={`text-xs px-4 py-2 ${
                            paymentStatus === 1
                                ? 'bg-green-500 hover:bg-green-600' 
                                : 'bg-red-500 hover:bg-red-600'
                        } text-white rounded-md`}
                    >
                        {paymentStatus === 1 ? 'Payment Received' : 'Payment Pending'}
                    </button>
                    <div className="relative">
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className='text-xs px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300 flex items-center gap-2'
                        >
                            {paymentMethod}
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
                                            handlePaymentMethodChange(order.name, option);
                                            setPaymentMethod(option);
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
                                    {item.additional_notes && (
                                            <p className='text-slate-600 text-xs'>note: {item.additional_notes}</p>
                                        )}
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
                {order.custom_order_complete === 1 ? (
                    <p className='text-green-500 font-medium'>Order completed</p>
                ) : (
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
                        : !paymentStatus
                            ? 'Payment Required'
                            : !order.items.every(item => completedItems[item.item_code])
                                ? 'Items Pending'
                                : 'Complete Order'
                    }
                </button>
                )}
                {!canComplete && (
                    <div className='mt-2 text-xs text-gray-500'>
                        {!paymentStatus && '• Payment required'}
                        {!order.items.every(item => completedItems[item.item_code]) && '• Complete all items'}
                    </div>
                )}
            </div>
        </div>
    );
}
