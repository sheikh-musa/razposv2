"use client";
import React, { useEffect, useState } from "react";
import { useApi } from "../context/ApiContext";
import { SalesOrders } from "../context/types/ERPNext";
import KitchenOrderCard from "@/app/components/kitchen/KitchenOrderCard";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";

export default function Kitchen() {
  const { fetchKitchenOrderNames, fetchKitchenOrderDetails } = useApi();
  const [orders, setOrders] = useState<SalesOrders[]>([]);
  const [showOrders, setShowOrders] = useState(true);
  const [completedOrders, setCompletedOrders] = useState<SalesOrders[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemSummary, setItemSummary] = useState<Record<string, number>>({});
  // const [isDropdownOpen, setIsDropdownOpen] = useState<Record<string, boolean>>({});
  // const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  // const paymentOptions = ["Cash", "Paynow", "Credit Card"];
  /* eslint-disable */
  const loadOrders = async () => {
    try {
      setLoading(true);
      const orderNames = await fetchKitchenOrderNames();

      const ordersWithDetails = await Promise.all(
        orderNames.map(async (orders) => {
          const details = await fetchKitchenOrderDetails(orders.name);
          return details;
        })
      );

      const flattenedOrders = ordersWithDetails.flat();

      // Separate completed and incomplete orders
      const incompleteOrders = flattenedOrders.filter((order) => !order.custom_order_complete);
      const completedOrders = flattenedOrders.filter((order) => order.custom_order_complete === 1);
      console.log("completedOrders", completedOrders);
      console.log("incompleteOrders", incompleteOrders);
      setOrders(incompleteOrders);
      setCompletedOrders(completedOrders);

      // Calculate item summary
      const summary: Record<string, number> = {};
      incompleteOrders.forEach((order) => {
        order.items.forEach((item) => {
          const key = `${item.item_code}`;
          summary[key] = (summary[key] || 0) + item.qty;
        });
      });
      setItemSummary(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);
  /* eslint-enable */

  const handleItemComplete = async (orderName: string, itemCode: string, completed: boolean) => {
    // Add API call to update item completion status
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.name === orderName
          ? {
              ...order,
              items: order.items.map((item) => (item.item_code === itemCode ? { ...item, completed } : item)),
            }
          : order
      )
    );
  };

  if (loading) return <div className="flex flex-col justify-center items-center h-full"><Spinner className="text-purple-500" variant="circle" size="64"/>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col min-h-full text-black font-sans p-4 lg:p-0" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-bold" style={{ color: "var(--color-fg-primary)" }}>
          Kitchen
        </h1>
      </div>

      {/* Summary Section - Mobile: Vertical scroll, Desktop: Horizontal scroll */}
      <div className="mt-2 p-3 lg:pl-4 lg:py-2 rounded-md shadow-lg mb-4" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
        <h3 className="font-semibold mb-3" style={{ color: "var(--color-fg-primary)" }}>
          Summary item count
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:overflow-x-auto gap-2 lg:gap-0">
          {Object.entries(itemSummary).map(([key, count]) => (
            <div
              key={key}
              className="shadow-lg flex-shrink-0 flex flex-col lg:m-2 rounded-md p-3 lg:p-2 items-center lg:min-w-[150px] lg:w-[200px]"
              style={{ backgroundColor: "var(--color-bg-tertiary)" }}
            >
              <span className="font-semibold text-sm lg:text-base" style={{ color: "var(--color-fg-primary)" }}>
                {key}
              </span>
              <span className="text-lg lg:text-base font-bold lg:font-normal" style={{ color: "var(--color-fg-secondary)" }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Section - Mobile: Vertical layout, Desktop: Horizontal scroll */}
      <div className="mt-2 p-3 lg:pl-4 lg:py-2 rounded-md shadow-lg mb-4" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
        <button
          onClick={() => setShowOrders(!showOrders)}
          className="flex items-center gap-2 font-semibold w-full justify-between lg:justify-start"
          style={{ color: "var(--color-fg-primary)" }}
        >
          <h3 className="text-base lg:text-lg">Pending Orders ({orders.length})</h3>
          <svg
            className={`w-4 h-4 transition-transform ${showOrders ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showOrders && (
          <div className="mt-3 lg:mt-2">
            {/* Mobile: Vertical stack, Desktop: Horizontal scroll */}
            <div className="grid grid-cols-1 gap-4 lg:flex lg:overflow-x-auto lg:gap-0 lg:h-[550px]">
              {orders.map((order) => (
                <div key={order.name} className="lg:flex-shrink-0">
                  <KitchenOrderCard order={order} onItemComplete={handleItemComplete} onOrderComplete={loadOrders} />
                </div>
              ))}
            </div>
            {orders.length === 0 && <div className="text-center py-8 text-gray-500">No pending orders</div>}
          </div>
        )}
      </div>

      {/* Completed Orders Section - Mobile: Vertical layout, Desktop: Horizontal scroll */}
      <div className="mt-2 p-3 lg:pl-4 lg:py-2 rounded-md shadow-lg" style={{ backgroundColor: "var(--color-bg-secondary)" }}>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="flex items-center gap-2 font-semibold w-full justify-between lg:justify-start"
          style={{ color: "var(--color-fg-primary)" }}
        >
          <h3 className="text-base lg:text-lg">Completed Orders ({completedOrders.length})</h3>
          <svg
            className={`w-4 h-4 transition-transform ${showCompleted ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showCompleted && (
          <div className="mt-3 lg:mt-2">
            {/* Mobile: Vertical stack, Desktop: Horizontal scroll */}
            <div className="grid grid-cols-1 gap-4 lg:flex lg:overflow-x-auto lg:gap-0">
              {completedOrders.map((order) => (
                <div key={order.name} className="lg:flex-shrink-0">
                  <KitchenOrderCard order={order} onItemComplete={handleItemComplete} onOrderComplete={loadOrders} />
                </div>
              ))}
            </div>
            {completedOrders.length === 0 && <div className="text-center py-8 text-gray-500">No completed orders</div>}
          </div>
        )}
      </div>
    </div>
  );
}
