'use client'
import { useState, useEffect } from 'react';
import OrderDetails from '../../components/transactionHistory/OrderDetails';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { SalesHistoryOrder} from '@/app/context/types/ERPNext';
import { useApi } from '@/app/context/ApiContext';

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
  const { getCompletedSalesOrderItems, getCompletedSalesOrder } = useApi();
  const [orders, setOrders] = useState<SalesHistoryOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [timeRange, setTimeRange] = useState('All');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 8;

  // Calculate pagination values
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1, '...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...', totalPages);
      }
    }
    return pages;
  };
/* eslint-disable */
  useEffect(() => {
    // const fetchOrders = async () => {
    //   try {
    //     const response = await fetch('/api/orders');
    //     const data = await response.json();
    //     const completedOrders = data.filter((order: Order) => order.completed);
    //     setOrders(completedOrders);
    //     filterOrdersByTimeRange('All', completedOrders); // Changed from 'Today' to 'All'
    //   } catch (error) {
    //     console.error('Error fetching orders:', error);
    //   }
    // };

    fetchOrders();
  }, []);
/* eslint-enable */

const fetchOrders = async () => {
  try {
    const data = await getCompletedSalesOrder();
    const orders = await Promise.all(data.map(async (order) => { 
      const items = await getCompletedSalesOrderItems(order.name);
      return items
    }));
    setOrders(orders);
    console.log(orders);
    // setOrders(orders as unknown as SalesHistoryOrder[]);

    
    // const completedOrders = data.filter((order: TransactionHistoryType) => order.custom_order_complete);
    // console.log(completedOrders);
    // setOrders(completedOrders);
    // filterOrdersByTimeRange('All', completedOrders); // Changed from 'Today' to 'All'
    // const completedOrders = data.filter((order: TransactionHistory) => order.custom_order_complete);
    // console.log(completedOrders);
    // setOrders(completedOrders);
    // filterOrdersByTimeRange('All', completedOrders); // Changed from 'Today' to 'All'
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

  const filterOrdersByTimeRange = (range: string, ordersList = orders) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (range === 'All') {
      setFilteredOrders(ordersList);
      setTimeRange(range);
      setSelectedDate(null);
      setCurrentPage(1);
      return;
    }

    const filtered = ordersList.filter(order => {
      const orderDate = new Date(order.date);
      
      switch (range) {
        case 'Today':
          return orderDate.toDateString() === today.toDateString();
        
        case '7 days': {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          return orderDate >= sevenDaysAgo;
        }
        
        case '30 days': {
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(today.getDate() - 30);
          return orderDate >= thirtyDaysAgo;
        }
        
        case '6 months': {
          const sixMonthsAgo = new Date(today);
          sixMonthsAgo.setMonth(today.getMonth() - 6);
          return orderDate >= sixMonthsAgo;
        }
        
        default:
          return true;
      }
    });

    setFilteredOrders(filtered);
    setTimeRange(range);
    setSelectedDate(null); // Reset date picker when changing time range
  };

  const filterOrdersByDate = (date: Date | null) => {
    if (!date) return;
    
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.toDateString() === date.toDateString();
    });

    setFilteredOrders(filtered);
    setSelectedDate(date);
    setTimeRange(''); // Reset time range when picking specific date
  };

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
          {['All', 'Today', '7 days', '30 days', '6 months'].map((range) => (
            <button 
              key={range}
              className={`px-4 py-2 rounded-lg text-sm ${
                timeRange === range ? 'bg-purple-100 text-purple-600' : 'text-gray-600'
              }`}
              onClick={() => filterOrdersByTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button 
              className="px-4 py-2 border rounded-lg text-sm text-gray-600 border-gray-300 flex items-center gap-2"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {selectedDate ? selectedDate.toLocaleDateString() : 'Select dates'}
            </button>
            {isDatePickerOpen && (
              <div className="absolute right-0 mt-1 z-10">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    filterOrdersByDate(date);
                    setIsDatePickerOpen(false);
                  }}
                  inline
                  maxDate={new Date()}
                  calendarClassName="border rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
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
                    <div className="font-sm text-black">Order #{order.name}</div>
                  </div>
                </td>
                <td className="p-3 text-gray-600">${order.total.toFixed(2)}</td>
                <td className="p-2 text-gray-600">
                  <div>{order.creation}</div>
                  <div className="text-sm text-gray-500">{order.creation}</div>
                </td>
                <td className="p-2 w-[100px]">
                   <span className={`px-2 py-1 rounded-full text-xs ${
                    // order.paymentBy === 'Credit Card' ? 'bg-blue-100 text-blue-600' : 
                    // order.paymentBy === 'Cash' ? 'bg-green-100 text-green-600' :
                    // order.paymentBy === 'PayNow' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {order.custom_payment_mode}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    {order.items.map((item: any, prodIndex: any) => 
                      console.log(item),
                      // item.map((variant: any, varIndex: any) => (
                      //   console.log(item),
                      //   variant.qty > 0 && (
                      //     <span 
                      //       key={`${prodIndex}-${varIndex}`} 
                      //       className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs"
                      //     >
                      //       {variant.item_code} ({variant.item_name}) × {variant.qty}
                      //     </span>
                      //   )
                      // ))
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
        <button 
          className="flex items-center gap-2 text-gray-600"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        <div className="flex gap-2">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              className={`w-8 h-8 rounded-lg ${
                page === currentPage ? 'bg-purple-600 text-white' : 'text-gray-600'
              }`}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
        <button 
          className="flex items-center gap-2 text-gray-600"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {showOrderDetails && selectedOrder && (
        <OrderDetails 
          order={selectedOrder} // Now selectedOrder is guaranteed to be Order type
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}