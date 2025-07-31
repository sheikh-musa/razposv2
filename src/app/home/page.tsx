/* eslint-disable */
"use client";
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { useApi } from "@/app/context/ApiContext";
import TransactionHistory from "../components/home/TransactionHistory";
import RecentActivity from "../components/home/RecentActivity";
import { processRevenueData, processDataForChart } from "../utils/revenueUtils";
import { MonthlyRevenue, RevenueEntry, RecentActivity as RecentActivityType } from "../context/types/ERPNext";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

type TimeRange = "12 months" | "30 days" | "7 days" | "24 hours";

export default function Home() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("12 months");
  const [salesData, setSalesData] = useState<{ name: string; value: number }[]>([]);
  const [currentRevenue, setCurrentRevenue] = useState(0);
  const [lastRevenue, setLastRevenue] = useState(0);
  const [percentageIncrease, setPercentageIncrease] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activityLog, setActivityLog] = useState<RecentActivityType[]>([]);
  const { getRevenue, getActivityLog, getCompanyName } = useApi();
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    fetchCompanyName();
    fetchRevenue();
    fetchActivityLog();
    const chartData = processDataForChart(monthlyRevenue, selectedRange);
    setSalesData(chartData);
  }, [selectedRange]);

  const fetchRevenue = async () => {
    try {
      const revenue = await getRevenue();
      const {
        totalRevenue,
        currentMonthRevenue,
        lastMonthRevenue,
        percentageIncrease: increase,
        monthlyRevenue: monthly,
      } = processRevenueData(revenue);

      setTotalRevenue(totalRevenue);
      setCurrentRevenue(currentMonthRevenue);
      setLastRevenue(lastMonthRevenue);
      setPercentageIncrease(increase);
      setMonthlyRevenue(monthly);

      // Process data for chart
      const chartData = processDataForChart(monthly, selectedRange);

      setSalesData(chartData);
    } catch (error) {
      console.error("Error fetching revenue:", error);
    }
  };

  const fetchCompanyName = async () => {
    const company = await getCompanyName();
    // @ts-ignore
    setCompanyName(company);
  };

  const fetchActivityLog = async () => {
    const activityLog = await getActivityLog();
    console.log("activityLog", activityLog);
    setActivityLog(activityLog);
  };
  return (
    <div className="p-4 lg:p-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold mb-4" style={{ color: "var(--color-fg-primary)" }}>
          Welcome back, User {companyName ? `(${companyName})` : ""}
        </h1>
        <div
          className="flex rounded-lg border w-full lg:w-fit overflow-x-auto"
          style={{ backgroundColor: "var(--color-bg-secondary)", borderColor: "var(--color-border-primary)" }}
        >
          {(["12 months", "30 days", "7 days"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-4 py-2 rounded-lg text-xs whitespace-nowrap flex-1 lg:flex-none ${
                selectedRange === range ? "shadow-sm" : "hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: selectedRange === range ? "var(--color-bg-primary)" : "transparent",
                color: selectedRange === range ? "var(--color-fg-primary)" : "var(--color-fg-secondary)",
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex flex-col lg:flex-row w-full gap-4 mb-8 border-b border-gray-300 pb-3">
        {/* Total Income - Mobile: Full width, Desktop: Left side */}
        <div className="order-1 lg:order-1">
          <div className="mb-6">
            <h3 className="text-gray-600 text-sm mb-1">Total Income</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-xl lg:text-2xl font-bold text-black">${totalRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Graph - Mobile: Full width, Desktop: Center */}
        <div className="flex-1 order-3 lg:order-2">
          <div className="bg-white text-gray-600 rounded-lg h-[200px] lg:h-[240px] pt-4 lg:pt-10 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} fontSize={10} tick={{ fill: "#666" }} />
                <YAxis axisLine={false} tickLine={false} dx={-10} fontSize={10} tick={{ fill: "#666" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  content={({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
                    if (!active || !payload || !payload.length) return null;

                    const value = payload[0].value as number;
                    return (
                      <div className="bg-white p-2 rounded-lg shadow-md">
                        <p className="text-sm text-black font-semibold">{label}</p>
                        <p className="text-xs font-semibold text-purple-600">
                          Revenue: ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs font-semibold text-purple-600">Orders: {payload[0].payload.orderCount}</p>
                      </div>
                    );
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#8884d8" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats - Mobile: Grid 2 columns, Desktop: Right side */}
        <div className="order-2 lg:order-3 w-full lg:w-64">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:space-y-6 lg:gap-0 lg:flex lg:flex-col lg:pl-3">
            {/* Current Revenue */}
            <div>
              <h3 className="text-gray-600 text-sm mb-1">Current Revenue</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-lg lg:text-2xl font-bold text-black">${currentRevenue.toFixed(2)}</span>
                <span className={`text-xs lg:text-sm ${percentageIncrease >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {percentageIncrease >= 0 ? "↑" : "↓"} {Math.abs(percentageIncrease).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Last Month Revenue */}
            <div>
              <h3 className="text-gray-600 text-sm mb-1">Last Month Revenue</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-lg lg:text-2xl font-bold text-black">${lastRevenue.toFixed(2)}</span>
                <span className={`text-xs lg:text-sm ${percentageIncrease >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {percentageIncrease >= 0 ? "↑" : "↓"} {Math.abs(percentageIncrease).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Percentage Change - Hidden on mobile in grid, shown as third item */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-gray-600 text-sm mb-1">Percentage {percentageIncrease >= 0 ? "increase" : "decrease"}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-lg lg:text-2xl font-bold text-black">{percentageIncrease.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History and Recent Activity - Mobile: Stack vertically, Desktop: Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:-mt-6 lg:h-[300px]">
        <div className="lg:h-2/3">
          <h3 className="text-lg font-semibold mb-4 lg:hidden" style={{ color: "var(--color-fg-primary)" }}>
            Transaction History
          </h3>
          <TransactionHistory />
        </div>
        <div className="lg:col-span-2 lg:h-2/3">
          <h3 className="text-lg font-semibold mb-4 lg:hidden" style={{ color: "var(--color-fg-primary)" }}>
            Recent Activity
          </h3>
          <RecentActivity activityLog={activityLog} />
        </div>
      </div>
    </div>
  );
}
