/* eslint-disable */
"use client";
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Area } from "recharts";
import { useApi } from "../../context/ApiContext";
import { RevenueEntry, MonthlyRevenue, RevenueByPaymentMode, SalesInvoice, SalesItemRevenue } from "../../context/types/ERPNext";
import { processRevenueData, processDataForChart } from "../../utils/revenueUtils";

// Add these type definitions at the top of the file
type SalesData = {
  month: number;
  totalSales: number;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded shadow">
        <p className="text-md text-black font-semibold">{`${label}`}</p>
        <p className="text-sm font-semibold text-purple-600">{`Revenue: $${payload[0].value}`}</p>
        <p className="text-sm font-semibold text-purple-600">{`Orders: ${dataPoint.orderCount}`}</p>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { getRevenue, getRevenueByPaymentMode, getAllPaidSalesInvoice, getSalesInvoiceByName } = useApi();
  const [salesData, setSalesData] = useState<{ name: string; value: number }[]>([]);
  // const [currentRevenue, setCurrentRevenue] = useState(0); // ! mock api data
  const [lastRevenue, setLastRevenue] = useState(0);
  const [percentageIncrease, setPercentageIncrease] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [revenueByPaymentMode, setRevenueByPaymentMode] = useState<RevenueByPaymentMode[]>([]);
  const [itemRevenue, setItemRevenue] = useState<SalesItemRevenue[]>([]);

  const paymentModeData = [
    { name: "Cash", color: "#7C3AED" },
    { name: "Debit/Credit Card", color: "#9461FB" },
    { name: "PayNow", color: "#B794FF" },
    { name: "NETS", color: "#D4B5FF" },
    { name: "CDC", color: "#EBD7FF" },
    { name: "Other", color: "#F3E8FF" },
  ];

  //! Payment methods data (mock api data)
  // const paymentMethodData = [
  //   { name: 'Cash', value: 35, color: '#7C3AED' },
  //   { name: 'Debit/Credit Card', value: 25, color: '#9461FB' },
  //   { name: 'PayNow', value: 20, color: '#B794FF' },
  //   { name: 'NETS', value: 15, color: '#D4B5FF' },
  //   { name: 'CDC', value: 5, color: '#EBD7FF' },
  // ];

  //! Monthly revenue by item (mock api data)
  // const itemRevenue = [
  //   { name: 'Croissant', value: 148.40, color: '#7C3AED' },
  //   { name: 'Baguette', value: 642.48, color: '#9461FB' },
  //   { name: 'Focaccia', value: 614.16, color: '#B794FF' },
  //   { name: 'Sour Dough', value: 290.00, color: '#D4B5FF' },
  //   { name: 'Pain Au Custard', value: 824.28, color: '#EBD7FF' },
  //   { name: 'Other', value: 48.44, color: '#F3E8FF' },
  // ];

  // Add useEffect for data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await fetch('/api/sales');
        // const data = await response.json();
        // setSalesData(data);

        getAllRevenues();
        getAllRevenueByPaymentModes();

        const salesInvoices: SalesInvoice[] = await getAllPaidSalesInvoice();
        const itemRevenue = await consolidateItemRevenue(salesInvoices);
        console.log("Consolidated Item Revenue:", itemRevenue);
        setItemRevenue(itemRevenue.slice(0, 6));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // // Update the process function with proper typingf
  // const processDataForChart = (data: SalesData[]) => {
  //   return data.map(month => ({
  //     name: new Date(2024, month.month - 1).toLocaleString('default', { month: 'short' }),
  //     value: month.totalSales
  //   }));
  // };

  const getAllRevenues = async () => {
    const revenue: RevenueEntry[] = await getRevenue();
    console.log("Revenue:", revenue);

    const totalRevenue = revenue.reduce((sum, item) => sum + item.paid_amount, 0);
    console.log("totalRevenue", totalRevenue); // ! console log
    setRevenue(totalRevenue);

    const monthlyRevenue = groupRevenueByMonth(revenue);
    console.log("Monthly Revenue:", monthlyRevenue);
    const chartData = processDataForChart(monthlyRevenue, "12 months");
    console.log("Chart Data:", chartData);
    setSalesData(chartData);

    // Get current and last month in YYYY-MM format
    const today = new Date();
    const currentMonth = today.toISOString().substring(0, 7);

    // Get last month
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth());
    const lastMonth = lastMonthDate.toISOString().substring(0, 7);
    // Find revenue for current and last month
    const currentMonthData = monthlyRevenue.find((m) => m.month === currentMonth);
    const lastMonthData = monthlyRevenue.find((m) => m.month === lastMonth);

    // Set the revenues
    // setCurrentRevenue(currentMonthData?.total || 0);
    setLastRevenue(lastMonthData?.total || 0);

    // Calculate percentage increase
    if (lastMonthData?.total && currentMonthData?.total) {
      const increase = ((currentMonthData.total - lastMonthData.total) / lastMonthData.total) * 100;
      setPercentageIncrease(increase);
    }
  };

  const groupRevenueByMonth = (revenue: RevenueEntry[]): MonthlyRevenue[] => {
    // Create a map to group entries by month
    const monthlyGroups = revenue.reduce((groups, entry) => {
      // Get YYYY-MM from the posting_date
      const month = entry.posting_date.substring(0, 7);

      if (!groups.has(month)) {
        groups.set(month, {
          month,
          total: 0,
          entries: [],
        });
      }

      const group = groups.get(month)!;
      group.entries.push(entry);
      group.total += entry.paid_amount;

      return groups;
    }, new Map<string, MonthlyRevenue>());

    // Convert map to array and sort by month
    return Array.from(monthlyGroups.values()).sort((a, b) => a.month.localeCompare(b.month));
  };

  const getAllRevenueByPaymentModes = async () => {
    // Get revenue by payment mode
    const paymentModes = paymentModeData.map((mode) => mode.name);
    let revenueByModes = [];

    for (const mode of paymentModes) {
      const revenueByMode = await getRevenueByPaymentMode(mode);
      // console.log('revenueByMode', revenueByMode); // ! console log
      const total = revenueByMode.reduce((sum, item) => sum + item.paid_amount, 0);
      revenueByModes.push({
        mode_of_payment: mode,
        total_amount: total,
      });
    }

    // Sort by total_amount in descending order and add colors
    revenueByModes = revenueByModes
      .sort((a, b) => b.total_amount - a.total_amount)
      .map((mode, index) => ({
        ...mode,
        color: paymentModeData[index].color,
      }));

    console.log("revenueByModes", revenueByModes); // ! console log
    setRevenueByPaymentMode(revenueByModes);
  };

  const consolidateItemRevenue = async (salesInvoices: SalesInvoice[]) => {
    const itemRevenueMap = new Map<string, number>();

    // Process each invoice
    for (const invoice of salesInvoices) {
      const invoiceDetails = await getSalesInvoiceByName(invoice.name);
      // console.log('invoiceDetails', invoiceDetails); // ! console log
      // @ts-ignore
      invoiceDetails.items.forEach((item) => {
        const currentTotal = itemRevenueMap.get(item.item_code) || 0;
        itemRevenueMap.set(item.item_code, currentTotal + item.amount);
      });
    }

    // Convert map to array and sort by amount
    const consolidatedRevenue: SalesItemRevenue[] = Array.from(itemRevenueMap)
      .map(([item_code, total_amount]) => ({
        item_code,
        total_amount,
      }))
      .sort((a, b) => b.total_amount - a.total_amount);

    return consolidatedRevenue;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-fg-primary)" }}>
          Analytics
        </h1>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full text-sm hover:bg-gray-100" style={{ color: "var(--color-fg-primary)" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <div className="flex items-center gap-2 px-4 py-2 border rounded-lg text-black border-gray-500 text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Select date
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Inventory
          </button>
          <button className="px-4 py-2 border rounded-lg text-black text-xs border-gray-500">Export</button>
          <button className="p-2 hover:bg-gray-100 rounded-md text-sm text-black">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Sales Graph Section */}
        <div className="col-span-2">
          <h2 className="text-sm text-gray-500 font-semibold mb-1">Sales over time</h2>
          <p className="text-gray-500 text-xs mb-2">Track your sales over time.</p>
          <div className="mb-2">
            <span className="text-2xl font-bold text-black">${revenue.toLocaleString()}</span>
            <span className="text-green-500 text-sm ml-2">↑ 7.4%</span>
          </div>

          <div className="flex gap-1">
            {/* Graph */}
            <div className="w-4/5">
              <div className="bg-white rounded-lg h-[240px] p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} fontSize={12} tick={{ fill: "#666" }} />
                    <YAxis axisLine={false} tickLine={false} dx={-10} fontSize={12} tick={{ fill: "#666" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={10} fill="url(#colorValue)" />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: "#8884d8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats */}
            <div className="w-auto space-y-6 justify-end">
              <div>
                <h3 className="text-gray-500 text-xs font-semibold mb-1">Current Revenue</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-black">${revenue.toLocaleString()}</span>
                  <span className="text-green-500 text-sm">↑ 9.2%</span>
                </div>
              </div>

              <div>
                <h3 className="text-gray-500 text-xs font-semibold mb-1">Last Month Revenue</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-black">${lastRevenue.toLocaleString()}</span>
                  <span className={`text-sm ${percentageIncrease >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {percentageIncrease >= 0 ? "↑" : "↓"} {Math.abs(percentageIncrease).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-gray-500 text-xs font-semibold mb-1">Difference (%)</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-black">{percentageIncrease.toFixed(0)}%</span>
                  <span className="text-green-500 text-sm">↑ 8.1%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Pie Chart */}
        <div className="bg-white border border-gray-300 p-2 rounded-lg">
          {/* Header with title and button */}
          <div className="flex justify-between items-center">
            <h2 className="text-sm text-gray-500 font-semibold ml-2">Payment Method</h2>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>

          {/* Content container */}
          <div className="flex flex-row justify-between">
            {/* Chart */}
            <div className="h-[200px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenueByPaymentMode} innerRadius={35} outerRadius={80} dataKey="total_amount">
                    {revenueByPaymentMode.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={paymentModeData[index].color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-col justify-center">
              {revenueByPaymentMode.slice(0, 5).map(
                (
                  entry: any // TODO: fix type error
                ) => (
                  <div key={entry.mode_of_payment} className="flex items-center gap-2 text-xs mb-2 text-gray-500">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span>{entry.mode_of_payment}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* View full report button */}
          <div className="w-full relative border">
            <button className="w-3/6 mt-4 text-gray-600 text-xs font-semibold absolute top-0 right-0 py-2 border border-gray-500 rounded-lg">
              View full report
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Revenue by Item */}
      <div className="mt-8">
        <div className="flex justify-between">
          <h2 className="text-md font-semibold mb-4 text-gray-500">Monthly revenue of item</h2>
          <div className="flex gap-4 mb-3">
            <button className="px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm">This month</button>
            <button className="px-4 py-2 text-gray-600 rounded-full text-sm">Last month</button>
            <button className="px-4 py-2 text-gray-600 rounded-full text-sm flex items-center gap-2">
              Custom
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
        <hr className="mb-6" />

        <div className="flex gap-8">
          {/* Radial Graph */}
          <div className="w-1/4">
            <div className="relative">
              <ResponsiveContainer width="100%" aspect={1}>
                <PieChart>
                  <Pie
                    data={itemRevenue}
                    innerRadius={80}
                    outerRadius={120}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="total_amount"
                    nameKey="item_code"
                  >
                    {itemRevenue
                      .filter((item, index) => index <= 5)
                      .map((item, index) => (
                        <Cell key={`cell-${index}`} fill={paymentModeData[index].color} strokeWidth={0.5} />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "black",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl text-black font-bold">${itemRevenue.reduce((sum, item) => sum + item.total_amount, 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Revenue Figures */}
          <div className="flex-1 grid grid-cols-3 gap-y-6 items-start content-start">
            {itemRevenue
              .filter((item, index) => index <= 5)
              .map((item, index) => (
                <div key={index} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: paymentModeData[index].color }}></div>
                    <span className="text-gray-600 text-sm">{item.item_code}</span>
                  </div>
                  <span className="text-base font-bold text-black">${item.total_amount.toFixed(2)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
