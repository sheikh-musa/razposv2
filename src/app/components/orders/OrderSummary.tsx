'use client'
import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useApi } from '../../context/ApiContext';
import { SalesOrderPayload, SalesOrders } from '../../context/types/ERPNext';
import toast from 'react-hot-toast';
// import { generateReceipt } from '../../utils/receiptUtils';
import SendReceiptModal from '../modals/order/SendReceiptModal';
import { useRouter } from 'next/navigation';

interface OrderSummaryProps {
  onClose: () => void;
  orderToUpdate: SalesOrders | null;
}

export default function OrderSummary({ onClose, orderToUpdate }: OrderSummaryProps) {
  const router = useRouter();
  const { items, removeItem, updateQuantity, total, clearCart, updateAdditionalNotes } = useCart();
  const { createKitchenOrder, updateKitchenOrder } = useApi();
  const [dineIn, setDineIn] = useState(true);
  const [buzzerNumber, setBuzzerNumber] = useState(orderToUpdate?.custom_buzzer_number || '');
  const [remark, setRemark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentComplete, setPaymentComplete] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(orderToUpdate?.additional_discount_percentage || 0);
  const [discountError, setDiscountError] = useState<string>('');
  // const [receipt, setReceipt] = useState(true);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  // const [createdOrder, setCreatedOrder] = useState<{ // eslint-disable-line @typescript-eslint/no-unused-vars
  //   name: string;
  //   customer_name: string;
  //   items: Array<{
  //     item_code: string;
  //     qty: number;
  //     rate: number;
  //   }>;
  // } | null>(null);
//   const shippingFee = 3.99;

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };
// TODO: Add logic to check if the items are in stock
// TODO: Add logic to change outstanding amount to 0 if paid

useEffect(() => {
  if (orderToUpdate) {
    console.log('orderToUpdate', orderToUpdate);
  }
}, [orderToUpdate]);
 // ! Current item naming convention is item_code
 // ! Not all items are based on Item Price
 // ! Status is always To Deliver and Bill will change to Overdue after 1 day
 // ! stock will be deducted when Sales Order converted to Sales Invoice
// console.log('items', items); // ! console log
  const handleConfirm = async () => {
    const payload: SalesOrderPayload = {
      customer: 'Guest',
      delivery_date: getCurrentDate(), // TODO: Change to actual delivery date past 12am
      custom_order_time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' }).replace(' ', ''),
      items: items.map((item) => (
        { item_code: item.name,
          qty: item.quantity,
          ...(item.additional_notes && { additional_notes: item.additional_notes })
        })),
      status: 'To Deliver and Bill',
      custom_kitchen_status: 'preparing',
      custom_remarks: remark,
      custom_payment_mode: paymentMethod,
      custom_order_complete: 0,
      custom_payment_complete: paymentComplete,
      docstatus: 0,
      ...(discount > 0 && { additional_discount_percentage: discount }),
    };
  
    console.log('payload', JSON.stringify(payload, null, 2));
    const response = orderToUpdate ? await updateKitchenOrder(orderToUpdate.name, payload) : await createKitchenOrder(payload);
    if (response.ok) {
      // eslint-disable-next-line 
      orderToUpdate ? toast.success('Order updated successfully') : toast.success('Order created successfully');
      setShowReceiptModal(true);
      clearCart();
      router.push('/orders');
      // onClose();
    } else {
      toast.error('Failed to create order');
    }
  };

  const handleReceiptModalClose = () => {
    setShowReceiptModal(false);
    // clearCart();
    onClose();
  };

  const handleReceiptSkip = () => {
    // Generate receipt without email
    // if (createdOrder) {
    //   generateReceipt({ order: createdOrder });
    // }
    handleReceiptModalClose();
  };

  return (
    <>
      <div className="bg-white border-solid border p-4 rounded-lg shadow-md h-[calc(100vh-7rem)] sticky top-4 relative">
      {/* Scrollable content */}
      <div className="overflow-y-auto h-[calc(100%-8rem)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              {items.length} items
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            // console.log('item', item),
            <div key={`${item.itemVariant}-${item.name}`} className="flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="font-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.type}</p>
                </div>
                <div className="flex items-center border rounded-md">
                  {item.quantity > 1 ?
                  <button
                    onClick={() => updateQuantity(item.itemVariant, item.name, Math.max(0, item.quantity - 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-50"
                  >
                    −
                  </button> : 
                  <button
                  onClick={() => removeItem(item.itemVariant, item.name)}
                  className="px-3 py-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                    />
                  </svg>
                </button>} 
                  <span className="px-3 py-1 min-w-[2rem] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.itemVariant, item.name, item.quantity + 1)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center border rounded-md">
                  <input type="text" value={item.additional_notes} 
                  onChange={(e) => updateAdditionalNotes(item.itemVariant, item.name, e.target.value)} 
                  className="w-full p-1 border rounded-md text-xs" 
                  placeholder="Add special instructions" 
                  onBlur={() => updateAdditionalNotes(item.itemVariant, item.name, item.additional_notes || '')}
                  />
                </div>
                <div className="text-right">
                  <p className="text-sm">${item.price.toFixed(2)}ea</p>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Options */}
        <div className="space-y-4 mb-20">
          {/* Dine In/Takeaway */}
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={dineIn}
                onChange={() => setDineIn(true)}
                className="text-purple-600"
              />
              <span>Dine in</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!dineIn}
                onChange={() => setDineIn(false)}
                className="text-purple-600"
              />
              <span>Takeaway</span>
            </label>
          </div>

          {/* Buzzer Number */}
          <div>
            <label className="block text-sm mb-1">Buzzer/table number</label>
            <input
              type="text"
              value={buzzerNumber}
              onChange={(e) => setBuzzerNumber(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
              placeholder="Enter buzzer/table number"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm mb-1">Remark</label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
              placeholder="Add special instructions"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="Cash">Cash</option>
              <option value="Debit/Credit Card">Debit/Credit Card</option>
              <option value="PayNow">PayNow</option>
              <option value="NETS">NETS</option>
              <option value="CDC">CDC</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm mb-1">Payment status</label>
            <select
              value={paymentComplete}
              onChange={(e) => setPaymentComplete(Number(e.target.value))}
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="0">Pending</option>
              <option value="1">Paid</option>
            </select>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm mb-1">Discount (%)</label>
            <input 
              type="number" 
              max={100} 
              min={0} 
              value={discount} 
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value > 100) {
                  setDiscountError('Discount percentage cannot exceed 100%');
                  setDiscount(100);
                  return;
                }
                setDiscountError('');
                setDiscount(value);
              }} 
              className="w-full p-2 border rounded-md text-sm" 
            />
            <p className="text-xs text-gray-400">Please enter percentage between 0 to 100</p>
            {discountError && <p className="text-xs text-red-500">{discountError}</p>}
          </div>

          {/* <div className='text-black text-sm mb-4'>
                    <span className='mr-2'>Receipt:</span>
                    <input type="radio" value="" checked={receipt} name="inline-radio-group" className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onChange={() => setReceipt(true)} />
                    <label className="mx-2 text-sm font-medium text-black">Yes</label>
                    <input type="radio" value="" checked={!receipt} name="inline-radio-group" className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onChange={() => setReceipt(false)} />
                    <label className="mx-2 text-sm font-medium text-black">No</label>
                </div> */}
        </div>
      </div>

      {/* Fixed bottom section */}
      <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t">
        <div className="space-y-2 mb-4">
          {/* <div className="flex justify-between text-sm">
            <span>Express shipping</span>
            <span>${shippingFee.toFixed(2)}</span>
          </div> */}
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium">${(total).toFixed(2)}</span>
          </div>
        </div>
        {discount > 0 && <div className="flex justify-between text-sm">
            <span>Less {discount}% discount</span>
            <span className="font-medium">${(total * (1 - discount / 100)).toFixed(2)}</span>
          </div>}
          {orderToUpdate ? (
            <button 
              onClick={handleConfirm}
              className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700"
            >
              Update
            </button>
          ) : (
        <button 
          onClick={handleConfirm}
          className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700"
        >
          Confirm
        </button>
        )}
      </div>
    </div>


      {showReceiptModal ? (
        <SendReceiptModal
          isOpen={showReceiptModal}
          onClose={handleReceiptModalClose}
          // order={createdOrder}
          onSkip={handleReceiptSkip}
        />
      ) : null}
    </>
  );
}
