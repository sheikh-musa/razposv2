'use client';

import { useApi } from "@/app/context/ApiContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SalesOrders } from "../../context/types/ERPNext";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";

export default function OrderSummary() {
  const searchParams = useSearchParams();
  const order = searchParams?.get('order') || '';
  const { fetchKitchenOrderDetails } = useApi();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<SalesOrders | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);


  useEffect(() => {
    if (order) {
      fetchOrderDetails();
    }
    else {
      toast.error('No order found');
      router.push('/');
    }
    
    // eslint-disable-next-line
  }, [order]);

  const fetchOrderDetails = async () => {
    const orderDetails = await fetchKitchenOrderDetails(order);
    
    if (!orderDetails) {
      toast.error('Invalid order. Order is not found');
      router.push('/tickets');
    }
    else {
      // @ts-expect-error - docstatus is not defined in the type
      if (orderDetails.docstatus === 0) {
        // @ts-expect-error - docstatus is not defined in the type
        setOrderDetails(orderDetails);
      }
      else {
        toast.error('Invalid order. Order is already completed');
        router.push('/tickets');
      }
    }
  }

  return (
    <div className="flex flex-col min-h-full text-black font-sans p-4 lg:p-0" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-bold" style={{ color: "var(--color-fg-primary)" }}>
          Order summary
        </h1>
      </div>
    {orderDetails && (
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">{orderDetails.customer}</h2>
        <p className="mb-4">{orderDetails.items.map((item) => item.item_code).join(', ')}</p>
        {/* Payment Button */}
        <button
          onClick={() => setIsPaymentOpen(true)}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Process Payment
        </button>
      </div>
    )}

    {/* Payment Slideout */}
    <SlideoutMenu isOpen={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
      <SlideoutMenu.Content>
        <SlideoutMenu.Header onClose={() => setIsPaymentOpen(false)}>
          <h2 className="text-xl text-black font-semibold">Payment Details</h2>
        </SlideoutMenu.Header>
        
        <div className="flex-1 p-6 text-black">
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Order Summary</h3>
              <div className="space-y-2">
                {orderDetails?.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.item_code}</span>
                    {/* <span>${item.price_list_rate || 0}</span> */}
                  </div>
                ))}
                <hr className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${orderDetails?.total || 0}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <h3 className="font-medium">Payment Information</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile">Mobile Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount Received</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Change</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        <SlideoutMenu.Footer>
          <div className="flex gap-3">
            <button
              onClick={() => setIsPaymentOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle payment processing
                toast.success('Payment processed successfully!');
                setIsPaymentOpen(false);
              }}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Complete Payment
            </button>
          </div>
        </SlideoutMenu.Footer>
      </SlideoutMenu.Content>
    </SlideoutMenu>
  </div>
  );
}