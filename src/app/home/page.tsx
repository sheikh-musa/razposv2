'use client'
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Transaction from './transaction/page';

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

type DailySale = {
  date: string;
  totalSales: number;
};

type MonthlySale = {
  month: number;
  totalSales: number;
  dailySales: DailySale[];
};

export default function Home() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('12 months');
  const [salesData, setSalesData] = useState<{ name: string; value: number }[]>([]);
  const [currentRevenue, setCurrentRevenue] = useState(0);
  const [lastRevenue, setLastRevenue] = useState(0);
  const [percentageIncrease, setPercentageIncrease] = useState(0);
  // const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch('/api/sales')
      .then(res => res.json())
      .then(data => {
        // Process data based on selected range
        const processedData = processDataForRange(data, selectedRange);
        setSalesData(processedData as { name: string; value: number }[]);
        
        // Calculate current and previous period revenues
        calculateRevenues(data, selectedRange);
      });
  }, [selectedRange]);

  const processDataForRange = (data: MonthlySale[], range: TimeRange) => {
    switch (range) {
      case '12 months':
        return data.map(month => ({
          name: new Date(2024, month.month - 1).toLocaleString('default', { month: 'short' }),
          value: month.totalSales
        }));
      case '30 days':
        const last30Days = data[data.length - 1].dailySales.slice(-30);
        return last30Days.map((day: DailySale) => ({
          name: new Date(day.date).getDate().toString(),
          value: day.totalSales
        }));
      case '7 days':
        const last7Days = data[data.length - 1].dailySales.slice(-7);
        return last7Days.map((day: DailySale) => ({
          name: new Date(day.date).getDate().toString(),
          value: day.totalSales
        }));
      case '24 hours':
        return Array.from({ length: 24 }, (_, i) => ({
          name: `${i}:00`,
          value: Math.floor(Math.random() * 1000) + 500
        }));
      default:
        return data;
    }
  };

  const calculateRevenues = (data: MonthlySale[], range: TimeRange) => {
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

      <div className="flex flex-row w-full gap-4">
        {/* Left side - Graph */}
        <div>
          {/* Total Income */}
          <div className="mb-6">
            <h3 className="text-gray-600 text-sm mb-1">Total Income</h3>
            {/* <div className="flex items-baseline gap-2"> */}
              <span className="text-2xl font-bold text-black">${currentRevenue.toLocaleString()}</span>
              <span className="text-green-500 text-xs ml-1">↑ 7.4%</span>
            {/* </div> */}
          </div>
        </div>
        <div className='flex-1'>
          {/* Graph */}
          <div className="bg-white text-gray-600 rounded-lg h-[240px] pt-10 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={salesData}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                  fontSize={12}
                  tick={{ fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                  fontSize={12}
                  tick={{ fill: '#666' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        
          </div>
        {/* Right side - Stats */}
        <div className="w-64 flex flex-col pl-3 h-4/6">
          <div className="space-y-6">
            {/* Stats content */}
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
          <div className="flex gap-2 mt-10">
              <button className="px-3 py-2 text-xs text-gray-600 border border-gray-400 rounded-md">Download</button>
              <button className="px-3 py-2 text-xs bg-purple-600 text-white rounded-md">View all</button>
          </div>
        </div>
      </div>

      {/* Transaction History and Recent Activity */}
      <div className="grid grid-cols-3 -mt-6">
        <div>
          <Transaction />
          {/* Add transaction list here */}
        </div>
        <div className='col-span-2'>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-md text-gray-500 font-semibold">Recent activity</h2>
            
          </div>
          {/* Add activity list here */}
        </div>
      </div>
    </div>
  );
}
