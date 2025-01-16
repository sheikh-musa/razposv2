'use client'
import { useState, useEffect } from 'react';
import OrderDetails from './orderDetails/page';

type Variant = {
  name: string;
  price: number;
  productId: number;
  orderQuantity: number;
};

type Product = {
  type: string;
  variants: Variant[];
};

type Order = {
  id: number;
  itemsType: number;
  variantType: number;
  product: Product[];
  totalPrice: number;
  date: string;
  time: string;
  completed: boolean;
  paymentBy: string;
  paymentReceived: boolean;
  remarks: string;
};

export default function TransactionHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [timeRange, setTimeRange] = useState('Today');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        const data = await response.json();
        // Filter only completed orders
        const completedOrders = data.filter((order: Order) => order.completed);
        setOrders(completedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-black">Transaction History</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-lg text-sm text-gray-600 border-gray-300 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg text-black">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Time Range Filters */}
      <div className="flex justify-between mb-8">
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${timeRange === 'Today' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}
            onClick={() => setTimeRange('Today')}
          >
            Today
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${timeRange === '7 days' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}
            onClick={() => setTimeRange('7 days')}
          >
            7 days
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${timeRange === '30 days' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}
            onClick={() => setTimeRange('30 days')}
          >
            30 days
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${timeRange === '6 months' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}
            onClick={() => setTimeRange('6 months')}
          >
            6 months
          </button>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-lg text-sm text-gray-600 border-gray-300 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Select dates
          </button>
          <button className="px-4 py-2 border rounded-lg text-sm text-gray-600 border-gray-300 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-xs text-gray-500">Transaction Order</th>
              <th className="text-left p-3 text-xs text-gray-500">Amount</th>
              <th className="text-left p-3 text-xs text-gray-500">Date & Time</th>
              <th className="text-left p-3 text-xs text-gray-500">Payment Type</th>
              <th className="text-left p-3 text-xs text-gray-500">Orders</th>
              <th className="text-left p-3 text-xs text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b text-sm">
                <td className="p-3">
                  <div>
                    <div className="font-sm text-black">Order #{order.id}</div>
                  </div>
                </td>
                <td className="p-3 text-gray-600">${order.totalPrice.toFixed(2)}</td>
                <td className="p-2 text-gray-600">
                  <div>{order.date}</div>
                  <div className="text-sm text-gray-500">{order.time}</div>
                </td>
                <td className="p-2 w-[100px]">
                   <span className={`px-2 py-1 rounded-full text-xs ${
                    order.paymentBy === 'Credit Card' ? 'bg-blue-100 text-blue-600' : 
                    order.paymentBy === 'Cash' ? 'bg-green-100 text-green-600' :
                    order.paymentBy === 'PayNow' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {order.paymentBy}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    {order.product.map((prod, prodIndex) => 
                      prod.variants.map((variant, varIndex) => (
                        variant.orderQuantity > 0 && (
                          <span 
                            key={`${prodIndex}-${varIndex}`} 
                            className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs"
                          >
                            {prod.type} ({variant.name}) × {variant.orderQuantity}
                          </span>
                        )
                      ))
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2 text-sm">
                    <button 
                      className="text-gray-600" 
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                    >
                      Open
                    </button>
                    <button className="text-purple-600">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button className="flex items-center gap-2 text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        <div className="flex gap-2">
          {[1, 2, 3, '...', 8, 9, 10].map((page, index) => (
            <button
              key={index}
              className={`w-8 h-8 rounded-lg ${
                page === 1 ? 'bg-purple-600 text-white' : 'text-gray-600'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 text-gray-600">
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {showOrderDetails && (
        <OrderDetails 
          order={selectedOrder} 
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}