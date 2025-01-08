'use client'
import React from 'react';
import { useCart } from '../../context/CartContext';

interface OrderSummaryProps {
  onClose: () => void;
}

export default function OrderSummary({ onClose }: OrderSummaryProps) {
  const { items, removeItem, updateQuantity, total } = useCart();

  return (
    <div className="bg-white border-solid border p-4 rounded-lg shadow-md h-[calc(100vh-8rem)] sticky top-4 relative">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-md font-bold mb-4">Order Summary</h2>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId}`} className="flex justify-between items-center">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">{item.type}</p>
              <p className="text-sm">${item.price.toFixed(2)} ea</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                  className="px-2 py-1 border-r hover:bg-gray-50"
                >
                  -
                </button>
                <span className="px-3 py-1">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                  className="px-2 py-1 border-l hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(item.productId, item.variantId)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <span>Total</span>
            <span className="font-bold">${total.toFixed(2)}</span>
          </div>
          <button className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
