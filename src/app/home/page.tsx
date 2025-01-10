'use client'
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

type TimeRange = '12 months' | '30 days' | '7 days' | '24 hours';
type Transaction = {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  amount: number;
  timestamp: string;
  type: string;
};

export default function Home() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('12 months');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [currentRevenue, setCurrentRevenue] = useState(0);
  const [lastRevenue, setLastRevenue] = useState(0);
  const [percentageIncrease, setPercentageIncrease] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch('/api/sales')
      .then(res => res.json())
      .then(data => {
        // Process data based on selected range
        const processedData = processDataForRange(data, selectedRange);
        setSalesData(processedData);
        
        // Calculate current and previous period revenues
        calculateRevenues(data, selectedRange);
      });
  }, [selectedRange]);

  const processDataForRange = (data: any[], range: TimeRange) => {
    // Process data based on selected time range
    // This is a simplified example
    switch (range) {
      case '12 months':
        return data.map(month => ({
          name: new Date(2024, month.month - 1).toLocaleString('default', { month: 'short' }),
          value: month.totalSales
        }));
      // Add other cases for different time ranges
      default:
        return data;
    }
  };

  const calculateRevenues = (data: any[], range: TimeRange) => {
    // Calculate revenues based on time range
    // This is a simplified example
    if (range === '12 months') {
      const currentMonth = data[data.length - 1].totalSales;
      const lastMonth = data[data.length - 2].totalSales;
      setCurrentRevenue(currentMonth);
      setLastRevenue(lastMonth);
      setPercentageIncrease(((currentMonth - lastMonth) / lastMonth) * 100);
    }
  };

  return (
    <div className="p-3 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl text-black font-bold mb-4">Welcome back, User</h1>
        <div className="flex bg-gray-100 rounded-lg border border-gray-300 w-fit">
          {(['12 months', '30 days', '7 days', '24 hours'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-4 py-2 rounded-lg ${
                selectedRange === range
                  ? 'bg-white text-black text-xs shadow-sm'
                  : 'text-gray-600 text-xs hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left side - Graph */}
        <div className="flex flex-row w-full">
          {/* Total Income */}
          <div className="mb-6">
            <h3 className="text-gray-600 text-sm mb-1">Total Income</h3>
            {/* <div className="flex items-baseline gap-2"> */}
              <span className="text-2xl font-bold text-black">${currentRevenue.toLocaleString()}</span>
              <span className="text-green-500 text-xs">↑ 7.4%</span>
            {/* </div> */}
          </div>

          {/* Graph */}
          <div className="bg-white text-gray-600 rounded-lg h-[240px] p-4 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right side - Stats */}
        <div className="w-64 space-y-6">
          <div>
            <h3 className="text-gray-600 text-sm mb-1">Current Revenue</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-black">${currentRevenue.toLocaleString()}</span>
              <span className="text-green-500 text-sm">↑ 9.2%</span>
            </div>
          </div>

          <div>
            <h3 className="text-gray-600 text-sm mb-1">Last Month Revenue</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-black">${lastRevenue.toLocaleString()}</span>
              <span className="text-green-500 text-sm">↑ 6.6%</span>
            </div>
          </div>

          <div>
            <h3 className="text-gray-600 text-sm mb-1">Percentage increase</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-black">{percentageIncrease.toFixed(0)}%</span>
              <span className="text-green-500 text-sm">↑ 8.1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History and Recent Activity */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transaction history</h2>
          </div>
          {/* Add transaction list here */}
        </div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent activity</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm border rounded-md">Download</button>
              <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md">View all</button>
            </div>
          </div>
          {/* Add activity list here */}
        </div>
      </div>
    </div>
  );
}
