'use client'
import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useApi } from '../../context/ApiContext';
import { SalesOrderPayload } from '../../context/types/ERPNext';
import toast from 'react-hot-toast';

interface OrderSummaryProps {
  onClose: () => void;
}

export default function OrderSummary({ onClose }: OrderSummaryProps) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { createKitchenOrder } = useApi();
  const [dineIn, setDineIn] = useState(true);
  const [buzzerNumber, setBuzzerNumber] = useState('');
  const [remark, setRemark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
//   const shippingFee = 3.99;

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  const handleConfirm = async () => {
    const payload: SalesOrderPayload = {
      customer: 'Guest',
      delivery_date: getCurrentDate(),
      items: items.map((item) => ({ item_code: item.name, qty: item.quantity })), // ! Current item naming convention is item_code
      status: 'To Deliver and Bill',
      custom_kitchen_status: 'preparing',
      custom_remarks: remark,
      custom_payment_mode: paymentMethod,
      docstatus: 1,
    };
    console.log('items', items);
    console.log('payload', payload);
    const response = await createKitchenOrder(payload);
    if (response.ok) {
      toast.success('Order created successfully');
      clearCart();
      onClose();
    } else {
      toast.error('Failed to create order');
    }
  };

  return (
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
            <div key={`${item.productId}-${item.variantId}`} className="flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="font-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.type}</p>
                </div>
                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                    />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center border rounded-md">
                  {item.quantity > 1 ?
                  <button
                    onClick={() => updateQuantity(item.productId, item.variantId, Math.max(0, item.quantity - 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-50"
                  >
                    −
                  </button> : 
                  <button
                  onClick={() => removeItem(item.productId, item.variantId)}
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
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-50"
                  >
                    +
                  </button>
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
            <label className="block text-sm mb-1">Buzzer</label>
            <input
              type="text"
              value={buzzerNumber}
              onChange={(e) => setBuzzerNumber(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
              placeholder="Enter buzzer number"
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
              <option value="Card">Card</option>
              <option value="PayNow">PayNow</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm mb-1">Payment status</label>
            <select
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
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
        <button 
          onClick={handleConfirm}
          className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
