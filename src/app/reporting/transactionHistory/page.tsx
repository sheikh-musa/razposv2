'use client'
import { useState, useEffect, useRef } from 'react';
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
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    amount: [0, 0],
    paymentTypes: [] as string[],
    items: [] as string[],
  });
  const [tempFilters, setTempFilters] = useState({
    amount: [0, 0],
    paymentTypes: [] as string[],
    items: [] as string[],
  });

  const [uniquePaymentTypes, setUniquePaymentTypes] = useState<string[]>([]);
  const [uniqueItemNames, setUniqueItemNames] = useState<string[]>([]);
  const [maxAmount, setMaxAmount] = useState(0);

  const datePickerContainerRef = useRef<HTMLDivElement>(null);
  const filterContainerRef = useRef<HTMLDivElement>(null);

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
          net_total: orderDetails.net_total,
          date: date,
          time: time,
          custom_payment_mode: orderDetails.custom_payment_mode,
          total_qty: orderDetails.total_qty,
          customer_name: orderDetails.customer_name,
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

      const uniquePayments = [...new Set(orders.map(o => o.custom_payment_mode).filter(Boolean))] as string[];
      const uniqueItems = [...new Set(orders.flatMap(o => o.items.map(i => i.item_name)))] as string[];
      const max = Math.ceil(Math.max(...orders.map(o => o.net_total), 0));

      setOrders(orders);
      setFilteredOrders(orders);
      setUniquePaymentTypes(uniquePayments);
      setUniqueItemNames(uniqueItems);
      setMaxAmount(max);

      const initialFilters = { amount: [0, max], paymentTypes: [], items: [] };
      setAdvancedFilters(initialFilters);
      setTempFilters(initialFilters);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerContainerRef.current && !datePickerContainerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let newFilteredOrders = [...orders];

    if (timeRange !== 'All' && timeRange !== '') {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'Today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case '7 days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30 days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '6 months':
          startDate = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      newFilteredOrders = newFilteredOrders.filter(order => new Date(order.date) >= startDate);
    }
    
    if (selectedDate) {
      newFilteredOrders = newFilteredOrders.filter(order => {
        const orderDate = new Date(order.date);
        return (
          orderDate.getFullYear() === selectedDate.getFullYear() &&
          orderDate.getMonth() === selectedDate.getMonth() &&
          orderDate.getDate() === selectedDate.getDate()
        );
      });
    }

    // Advanced filters
    newFilteredOrders = newFilteredOrders.filter(o => o.net_total >= advancedFilters.amount[0] && o.net_total <= advancedFilters.amount[1]);

    if (advancedFilters.paymentTypes.length > 0) {
      newFilteredOrders = newFilteredOrders.filter(o => advancedFilters.paymentTypes.includes(o.custom_payment_mode));
    }

    if (advancedFilters.items.length > 0) {
      newFilteredOrders = newFilteredOrders.filter(o => o.items.some(item => advancedFilters.items.includes(item.item_name)));
    }

    setFilteredOrders(newFilteredOrders);
    setCurrentPage(1);
  }, [orders, timeRange, selectedDate, advancedFilters]);

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    setSelectedDate(null);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setTimeRange('');
    setIsDatePickerOpen(false);
  };

  const handleApplyFilters = () => {
    setAdvancedFilters(tempFilters);
    setIsFilterOpen(false);
  };
  
  const handleResetFilters = () => {
    const initialFilters = { amount: [0, maxAmount], paymentTypes: [], items: [] };
    setTempFilters(initialFilters);
    setAdvancedFilters(initialFilters);
    setIsFilterOpen(false);
  };

  const handlePaymentTypeChange = (paymentType: string) => {
    setTempFilters(prev => {
      const newPaymentTypes = prev.paymentTypes.includes(paymentType)
        ? prev.paymentTypes.filter(p => p !== paymentType)
        : [...prev.paymentTypes, paymentType];
      return { ...prev, paymentTypes: newPaymentTypes };
    });
  };

  const handleItemChange = (item: string) => {
    setTempFilters(prev => {
      const newItems = prev.items.includes(item)
        ? prev.items.filter(i => i !== item)
        : [...prev.items, item];
      return { ...prev, items: newItems };
    });
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
              onClick={() => handleTimeRangeChange(range)}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative" ref={datePickerContainerRef}>
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
                  onChange={handleDateChange}
                  inline
                  maxDate={new Date()}
                  calendarClassName="border rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
          <div className="relative" ref={filterContainerRef}>
            <button 
              className="px-4 py-2 border rounded-lg text-sm text-gray-600 border-gray-300 flex items-center gap-2"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-20 p-4 text-black">
                <h3 className="font-semibold mb-2">Filters</h3>
                
                {/* Amount Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      value={tempFilters.amount[0]}
                      onChange={e => setTempFilters(f => ({...f, amount: [Number(e.target.value), f.amount[1]]}))}
                      className="w-full border-gray-300 rounded-md shadow-sm p-1"
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={tempFilters.amount[1]}
                      onChange={e => setTempFilters(f => ({...f, amount: [f.amount[0], Number(e.target.value)]}))}
                      className="w-full border-gray-300 rounded-md shadow-sm p-1"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Payment Type Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                  <div className="max-h-32 overflow-y-auto">
                    {uniquePaymentTypes.map(pt => (
                      <div key={pt} className="flex items-center">
                        <input 
                          type="checkbox"
                          id={`payment-${pt}`}
                          checked={tempFilters.paymentTypes.includes(pt)}
                          onChange={() => handlePaymentTypeChange(pt)}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor={`payment-${pt}`} className="ml-2 block text-sm text-gray-900">{pt}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Items Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
                  <div className="max-h-32 overflow-y-auto">
                  {uniqueItemNames.map(item => (
                      <div key={item} className="flex items-center">
                        <input 
                          type="checkbox"
                          id={`item-${item}`}
                          checked={tempFilters.items.includes(item)}
                          onChange={() => handleItemChange(item)}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor={`item-${item}`} className="ml-2 block text-sm text-gray-900">{item}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button onClick={handleResetFilters} className="px-4 py-2 text-sm rounded-lg border">Reset</button>
                  <button onClick={handleApplyFilters} className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white">Apply Filters</button>
                </div>
              </div>
            )}
          </div>
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
                    <div className="font-sm text-black">Order #{order.name.slice(14)}</div>
                  </div>
                </td>
                <td className="p-3 text-gray-600">${order.net_total.toFixed(2)}</td>
                <td className="p-2 text-gray-600">
                  <div>{order.date}</div>
                  <div className="text-sm text-gray-500">{order.time}</div>
                </td>
                <td className="p-1 w-[120px]">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.custom_payment_mode === 'Debit/Credit Card' ? 'bg-blue-100 text-blue-600' : 
                    order.custom_payment_mode === 'NETS' ? 'bg-green-100 text-green-600' :
                    order.custom_payment_mode === 'PayNow' ? 'bg-red-100 text-red-600' :
                    order.custom_payment_mode === 'Cash' ? 'bg-yellow-100 text-yellow-600' :
                    order.custom_payment_mode === 'CDC' ? 'bg-purple-100 text-purple-600' :
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
                         {item.item_name} ({item.item_code.split('-')[0]}) × {item.qty}
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