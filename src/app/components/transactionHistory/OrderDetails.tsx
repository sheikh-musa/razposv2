'use client'
import { useState } from 'react';
import { SalesHistoryOrder } from '@/app/context/types/ERPNext';


type OrderDetailsProps = {
  order: SalesHistoryOrder;
  onClose: () => void;
};

export default function OrderDetails({ order, onClose }: OrderDetailsProps) {
  const [paymentMethod, setPaymentMethod] = useState(order?.custom_payment_mode || 'Cash');
  // const [paymentStatus, setPaymentStatus] = useState(order?.custom_payment_complete ? 'Paid' : 'Unpaid');

  if (!order) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[315px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col">
      {/* Header */}
      <div className="flex flex-col justify-between items-center p-2 border-b">
        <div className='flex justify-between w-full'>
          <span className='text-base text-black p-2 font-semibold'>Order #{order.name}</span>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-black">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 justify-between w-full">
          <span className="text-sm text-gray-500 p-2">• {order.total_qty} items
          </span>
          <span className="text-lg font-semibold text-gray-700 p-2">${order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Order Items - Make this section scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {order.items.map((item, index) => (
            item.item_code && (
                <div key={index}>
                  <div className="flex items-start mb-2 h-8">
                    <div className='w-1/3'>
                      <h3 className="font-semibold text-sm text-black">{item.item_code}</h3>
                      <p className="text-xs text-gray-600">{item.item_name}</p>
                    </div>
                    <div className='flex h-full items-center justify-center w-1/3'>
                    <div className='border rounded-md'>
                    <button className="p-1 hover:bg-gray-200 text-black border-r">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-center text-black text-sm mx-1">{item.qty}</span>
                    <button className="p-1 hover:bg-gray-200 text-black border-l">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    </div>
                    </div>
                    <div className="text-right w-1/3">
                      <p className="text-sm text-black">${item.rate.toFixed(2)}/ea</p>
                      <button className="ml-auto text-black">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    </div>
                  </div>
                      <div className="items-center bg-gray-50 rounded-lg py-2 text-end">
                      <p className="text-sm text-gray-600 font-semibold">${(item.rate * item.qty).toFixed(2)}</p>
                      </div>
                </div>
              )
            )
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
           {/* <div>
            <label className="block text-xs text-gray-600 mb-1 font-semibold">Payment status</label>
            <select 
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full p-2 border rounded-lg text-black text-xs"
            >
              <option>Paid</option>
              <option>Unpaid</option>
            </select>
          </div> */}
          <button className="w-full py-3 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}