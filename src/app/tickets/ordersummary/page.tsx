'use client';

import { useApi } from "@/app/context/ApiContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast"; 
import { SalesOrders, SalesInvoicePayload, PaymentEntryPayload } from "../../context/types/ERPNext";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import SendReceiptModal from "@/app/components/modals/order/SendReceiptModal";
import { Button } from "@/components/base/buttons/button"

export default function OrderSummary() {
  const searchParams = useSearchParams();
  const order = searchParams?.get('order') || '';
  const { fetchKitchenOrderDetails, createSalesInvoice, createPaymentEntry, getCompanyName, completeOpenTicket } = useApi();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<SalesOrders | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [showSendReceiptModal, setShowSendReceiptModal] = useState(false);
  const [multiplePaymentMode, setMultiplePaymentMode] = useState(1);
  const [paymentMethods, setPaymentMethods] = useState<Array<{
    method: string;
    amount: number;
  }>>([{ method: 'cash', amount: 0 }]);


  // Update payment methods when multiplePaymentMode changes
  useEffect(() => {
    if (order) {
      fetchOrderDetails();
    }
    else {
      toast.error('No order found');
      router.push('/');
    }
    const newPaymentMethods = Array.from({ length: multiplePaymentMode }, (_, index) => 
      paymentMethods[index] || { method: 'cash', amount: 0 }
    );
    setPaymentMethods(newPaymentMethods);
  }, [multiplePaymentMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const updatePaymentMethod = (index: number, field: 'method' | 'amount', value: string | number) => {
    setPaymentMethods(prev => 
      prev.map((payment, i) => 
        i === index 
          ? { ...payment, [field]: value }
          : payment
      )
    );
  };

  const calculateTotalReceived = () => {
    return paymentMethods.reduce((total, payment) => total + payment.amount, 0);
  };

  const calculateChange = () => {
    if (!orderDetails) return 0;
    return calculateTotalReceived() - orderDetails.net_total;
  };

  const fetchOrderDetails = async () => {
    const orderDetails = await fetchKitchenOrderDetails(order);
    console.log(orderDetails);
    
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
  const handleCompletePayment = async () => {
    if (!orderDetails) {
      toast.error('No order details available');
      return;
    }
    if (calculateChange() < 0) {
      toast.error('Payment not completed. Please check payment amount');
      return;
    }

    try {
      console.log('handleCompletePayment'); // ! console log
      await completeOpenTicket(orderDetails.name); // ! sent payment modes
      const companyName = await getCompanyName();
      //@ts-expect-error company name is a string
      const companyNameString = companyName.charAt(0);
            
      const invoicePayload: SalesInvoicePayload = {
              
                customer: orderDetails.customer,
                items: orderDetails.items.map(item => ({
                    item_code: item.item_code,
                    qty: item.qty,
                    warehouse: `Stores - ${companyNameString}`,
                    income_account: `Sales Income - ${companyNameString}`,
                    sales_order: orderDetails.name,
                })),
                additional_discount_percentage: orderDetails.additional_discount_percentage,
                update_stock: 1,
                disable_rounded_total: 1,
                docstatus: 1
            };
            console.log('invoicePayload', invoicePayload);
            const salesInvoiceResponse = await createSalesInvoice(invoicePayload);
            const salesInvoiceData = await salesInvoiceResponse.json();

            console.log('salesInvoiceData', salesInvoiceData); // ! CONSOLE LOG
            
            // Get the invoice name from the response
            const invoiceName = salesInvoiceData.data?.name;
            
            if (!invoiceName) {
              toast.error('Failed to create sales invoice');
              return;
            }
            
            let remainingOutstanding = orderDetails.net_total;
            
            for (const payment of paymentMethods) {
            // For split payments, allocated_amount should be the minimum of payment amount and remaining outstanding
            const allocatedAmount =  Number(Math.min(payment.amount, remainingOutstanding).toFixed(2));
            console.log('amt: ',allocatedAmount);
            
            const paymentPayload: PaymentEntryPayload = {
                payment_type: "Receive",
                party_type: "Customer",
                party: orderDetails.customer,
                paid_to: `Petty Cash - ${companyNameString}`, // ! if Bank Account - R, then reference no. needed regardless of mode of payment
                received_amount: allocatedAmount,
                paid_amount: allocatedAmount,
                references: [{
                    reference_doctype: "Sales Invoice",
                    reference_name: invoiceName,
                    total_amount: orderDetails.net_total,
                    outstanding_amount: remainingOutstanding,
                    allocated_amount: allocatedAmount,
                }],
                mode_of_payment: payment.method,
                docstatus: 1
            };
            console.log('paymentPayload', paymentPayload); // ! console log
            const paymentEntryResponse = await createPaymentEntry(paymentPayload);
            const paymentEntryData = await paymentEntryResponse.json();
            console.log('paymentEntryData', paymentEntryData); // ! CONSOLE LOG
            
            // Update remaining outstanding amount for next payment
            remainingOutstanding -= allocatedAmount;
            }
            //! not necessary as Sales Order will automatically update
          //   const updatePayload: SalesOrderUpdatePayload = {
          //     custom_order_complete: 1,
          //     custom_payment_complete: 0
          // };
          toast.success('Payment processed successfully!');
          setShowSendReceiptModal(true);
          setIsPaymentOpen(false);
          router.push('/tickets');
          
    } catch (error) {
      console.error('Error completing payment:', error);
      toast.error('Failed to complete payment. Please try again.');
    }
  }

  return (
    <div
      className="flex flex-col min-h-full text-black font-sans p-4 lg:p-0"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="mb-4 lg:mb-6">
        <h1
          className="text-xl lg:text-2xl font-bold"
          style={{ color: "var(--color-fg-primary)" }}
        >
          Order summary
        </h1>
      </div>
      {orderDetails && (
        <div>
          <div className="flex items-center gap-2 justify-between w-full">
            <h2 className="text-xl font-semibold">
              Order: {orderDetails.name}
            </h2>
            <span className="text-md text-gray-500 p-2">
              • {orderDetails.total_qty} items
            </span>
          </div>
          <hr className="my-2" />
          {orderDetails.items.map((item) => (
            <div
              key={item.item_code}
              className="flex items-center gap-2 justify-between w-full mb-2 text-medium"
            >
              <p className="text-sm text-gray-500 font-medium">
                {item.item_code}
              </p>
              <p className="text-sm text-gray-500">Qty: {item.qty}</p>
              <div>
                {/* eslint-disable-next-line */}
                <p className="text-sm text-gray-500">
                  {item.price_list_rate?.toFixed(2)} ea
                </p>
                <p className="text-sm text-gray-500">
                  ${(item.price_list_rate ?? 0 * item.qty).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          <hr className="my-2" />
          <p className="text-lg text-black flex items-center gap-2 w-full justify-end">
            {orderDetails.additional_discount_percentage ? "" : "Total:"} $
            {orderDetails.total.toFixed(2)}
          </p>
          {orderDetails.additional_discount_percentage ? (
            <div className="text-lg text-black flex flex-col items-end w-full justify-end">
              <p className="align">
                Less {orderDetails.additional_discount_percentage}% discount:{" "}
                {orderDetails.discount_amount}
              </p>
              <p>Total: ${orderDetails.net_total}</p>
            </div>
          ) : (
            <></>
          )}
          <div className="flex justify-end gap-2 w-full">
            {/* Payment Button */}
            <Button
              onClick={() => setIsPaymentOpen(true)}
              className="mt-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Process Payment
            </Button>
          </div>
        </div>
      )}

      {/* Payment Slideout */}
      <SlideoutMenu isOpen={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <SlideoutMenu.Content>
          <SlideoutMenu.Header onClose={() => setIsPaymentOpen(false)}>
            <h2 className="text-xl text-black font-semibold">
              Payment Details
            </h2>
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
                    <span>${orderDetails?.net_total.toFixed(2) || 0}</span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <h3 className="font-medium">Payment Information</h3>
                <label className="block text-sm font-medium mb-2">
                  Split payment
                </label>
                <div className="flex items-center gap-2 w-1/6 text-sm">
                  {multiplePaymentMode === 1 ? (
                    <button
                      disabled
                      className="p-3 border border-gray-300 rounded-lg cursor-not-allowed disabled:opacity-50"
                    >
                      -
                    </button>
                  ) : (
                    <button
                      className="p-3 border border-gray-300 rounded-lg"
                      onClick={() =>
                        setMultiplePaymentMode(multiplePaymentMode - 1)
                      }
                    >
                      -
                    </button>
                  )}
                  <span className="text-sm font-medium border border-gray-300 rounded-lg p-3">
                    {multiplePaymentMode}
                  </span>
                  {multiplePaymentMode === 2 ? (
                    <button
                      disabled
                      className="p-3 border border-gray-300 rounded-lg cursor-not-allowed disabled:opacity-50"
                    >
                      +
                    </button>
                  ) : (
                    <button
                      className="p-3 border border-gray-300 rounded-lg"
                      onClick={() =>
                        setMultiplePaymentMode(multiplePaymentMode + 1)
                      }
                    >
                      +
                    </button>
                  )}
                </div>

                {/* Render payment method components based on multiplePaymentMode */}
                {paymentMethods.map((payment, index) => (
                  <div
                    key={index}
                    className="flex flex-row gap-2 w-full text-sm"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Payment Method{" "}
                        {multiplePaymentMode > 1 ? `#${index + 1}` : ""}
                      </label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        value={payment.method}
                        onChange={(e) =>
                          updatePaymentMethod(index, "method", e.target.value)
                        }
                      >
                        <option value="Cash">Cash</option>
                        <option value="Debit/Credit Card">
                          Debit/Credit Card
                        </option>
                        <option value="NETS">NETS</option>
                        <option value="Paynow">PayNow</option>
                        <option value="CDC">CDC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Amount Received{" "}
                        {multiplePaymentMode > 1 ? `#${index + 1}` : ""}
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={payment.amount || ""}
                        onChange={(e) =>
                          updatePaymentMethod(
                            index,
                            "amount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Total Received
                  </label>
                  <input
                    type="number"
                    value={calculateTotalReceived()}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Change
                  </label>
                  <input
                    type="number"
                    value={calculateChange().toFixed(2)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          <SlideoutMenu.Footer>
            <div className="flex gap-3">
              {/* <button
              onClick={() => {
                setIsPaymentOpen(false);
                setShowSendReceiptModal(false);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black"
            >
              Cancel
            </button> */}

              <Button
                color="primary" size="md" onClick={() => {
                  setIsPaymentOpen(false);
                  setShowSendReceiptModal(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Handle payment processing
                  handleCompletePayment();
                }}
                size="md"
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                // className=" bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Complete Payment
              </Button>
            </div>
          </SlideoutMenu.Footer>
        </SlideoutMenu.Content>
      </SlideoutMenu>

      {showSendReceiptModal && (
        <SendReceiptModal
          isOpen={showSendReceiptModal}
          onClose={() => setShowSendReceiptModal(false)}
          order={orderDetails}
          onSkip={() => setShowSendReceiptModal(false)}
        />
      )}
    </div>
  );
}