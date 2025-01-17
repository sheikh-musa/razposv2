'use client'
import { useState } from 'react';

type OrderDetailsProps = {
  order?: Order;
  onClose: () => void;
};

export default function OrderDetails({ order, onClose }: OrderDetailsProps) {
  const [paymentMethod, setPaymentMethod] = useState(order?.paymentBy || 'Cash');
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentReceived ? 'Paid' : 'Unpaid');

  if (!order) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[315px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col">
      {/* Header */}
      <div className="flex flex-col justify-between items-center p-2 border-b">
        <div className='flex justify-between w-full'>
          <span className='text-base text-black p-2 font-semibold'>Order #{order.id}</span>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-black">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 justify-between w-full">
          <span className="text-sm text-gray-500 p-2">• {order.product.reduce((acc, prod) => 
            acc + prod.variants.reduce((sum, variant) => sum + variant.orderQuantity, 0), 0)} items
          </span>
          <span className="text-lg font-semibold text-gray-700 p-2">${order.totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Order Items - Make this section scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {order.product.map((prod, prodIndex) => 
            prod.variants.map((variant, varIndex) => (
              variant.orderQuantity > 0 && (
                <div key={`${prodIndex}-${varIndex}`}>
                  <div className="flex justify-between items-start mb-2 h-8">
                    <div>
                      <h3 className="font-semibold text-sm text-black">{prod.type}</h3>
                      <p className="text-xs text-gray-600">{variant.name}</p>
                    </div>
                    <div className='flex h-full items-center border rounded-md'>
                    <button className="p-1 hover:bg-gray-200 text-black border-r">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-center text-black text-sm mx-1">{variant.orderQuantity}</span>
                    <button className="p-1 hover:bg-gray-200 text-black border-l">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-black">${variant.price.toFixed(2)}/ea</p>
                      <button className="ml-auto text-black">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                      </svg>
                    </button>
                    </div>
                  </div>
                      <div className="items-center bg-gray-50 rounded-lg py-2 text-end">
                      <p className="text-sm text-gray-600">${(variant.price * variant.orderQuantity).toFixed(2)}</p>
                      </div>
                </div>
              )
            ))
          )}
        </div>
      </div>

      {/* Payment Section */}
      <div className="border-t bg-white p-3">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1 font-semibold">Payment</label>
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border rounded-lg text-xs text-black"
            >
              <option>Cash</option>
              <option>Credit Card</option>
              <option>PayNow</option>
              <option>E-payment</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1 font-semibold">Payment status</label>
            <select 
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full p-2 border rounded-lg text-black text-xs"
            >
              <option>Paid</option>
              <option>Unpaid</option>
            </select>
          </div>
          <button className="w-full py-3 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}