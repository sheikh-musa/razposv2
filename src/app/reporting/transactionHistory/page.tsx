'use client'
import { useState, useEffect } from 'react';
import OrderDetails from '../../components/transactionHistory/OrderDetails';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { SalesHistoryOrder, TransactionHistoryItem } from '@/app/context/types/ERPNext';
import { useApi } from '@/app/context/ApiContext';

export default function TransactionHistory() {
  const { getCompletedSalesOrderItems, getCompletedSalesOrder } = useApi();
  const [orders, setOrders] = useState<SalesHistoryOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<SalesHistoryOrder[]>([]);
  const [timeRange, setTimeRange] = useState('All');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesHistoryOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const fetchOrders = async () => {
    try {
      const data = await getCompletedSalesOrder() as unknown as { name: string }[];
      const orders = await Promise.all(data.map(async (order) => {
        const orderDetails = await getCompletedSalesOrderItems(order.name) as unknown as SalesHistoryOrder;
        //@ts-expect-error creation is not a property of SalesHistoryOrder
        const date = new Date(orderDetails.creation).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        //@ts-expect-error creation is not a property of SalesHistoryOrder
        const time = new Date(orderDetails.creation).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });

        return {
          name: orderDetails.name,
          total: orderDetails.total,
          date: date,
          time: time,
          custom_payment_mode: orderDetails.custom_payment_mode,
          total_qty: orderDetails.total_qty,
          items: orderDetails.items.map((item: TransactionHistoryItem) => ({
            item_code: item.item_code,
            item_name: item.item_name,
            name: item.name,
            qty: item.qty,
            rate: item.rate,
            amount: item.amount
          }))
        } as SalesHistoryOrder;
      }));

      setOrders(orders);
      setFilteredOrders(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter orders by date
  const filterOrdersByDate = (date: Date | null) => {
    if (!date || !orders.length) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter(order => {
      const orderDate = new Date(order.date);
      return (
        orderDate.getFullYear() === date.getFullYear() &&
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getDate() === date.getDate()
      );
    });

    setFilteredOrders(filtered);
    setSelectedDate(date);
    setTimeRange('');
  };

  // Filter orders by time range
  const filterOrdersByTimeRange = (range: string) => {
    if (!orders.length) {
      setFilteredOrders(orders);
      return;
    }

    const now = new Date();
    let filtered: SalesHistoryOrder[] = [];

    switch (range) {
      case 'All':
        filtered = orders;
        break;
      case 'Today':
        filtered = orders.filter(order => {
          const orderDate = new Date(order.date);
          return (
            orderDate.getFullYear() === now.getFullYear() &&
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getDate() === now.getDate()
          );
        });
        break;
      case '7 days':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        console.log(sevenDaysAgo);
        filtered = orders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate >= sevenDaysAgo;
        });
        break;
      case '30 days':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = orders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate >= thirtyDaysAgo;
        });
        break;
      case '6 months':
        const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
        filtered = orders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate >= sixMonthsAgo;
        });
        break;
      default:
        filtered = orders;
    }

    setFilteredOrders(filtered);
    setTimeRange(range);
    setSelectedDate(null);
  };

  // Get current orders for pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const paginatedOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
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
            {paginatedOrders.map((order, index) => (
              <tr key={index} className="border-b text-sm">
                <td className="p-3">
                  <div>
                    <div className="font-sm text-black">Order #{order.name}</div>
                  </div>
                </td>
                <td className="p-3 text-gray-600">${order.total}</td>
                <td className="p-2 text-gray-600">
                  <div>{order.date}</div>
                  <div className="text-sm text-gray-500">{order.time}</div>
                </td>
                <td className="p-2 w-[100px]">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.custom_payment_mode === 'Credit Card' ? 'bg-blue-100 text-blue-600' : 
                    order.custom_payment_mode === 'Cash' ? 'bg-green-100 text-green-600' :
                    order.custom_payment_mode === 'PayNow' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {order.custom_payment_mode}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    {order.items.map((item, itemIndex) => (
                      <span 
                        key={itemIndex} 
                        className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs"
                      >
                        {item.item_code} ({item.item_name}) × {item.qty}
                      </span>
                    ))}
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