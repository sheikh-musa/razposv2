'use client';

import { useApi } from "@/app/context/ApiContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast"; 
import { SalesOrders, SalesInvoicePayload, PaymentEntryPayload } from "../../context/types/ERPNext";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import SendReceiptModal from "@/app/components/modals/order/SendReceiptModal";
import { Button } from "@/components/base/buttons/button"
import Link from "next/link";
import { useStripeTerminal } from "@/app/context/PaymentContext"
import QRCode from "qrcode";
import Image from "next/image";

export default function OrderSummary() {
  const searchParams = useSearchParams();
  const order = searchParams?.get('order') || '';
  const isCustomerView = searchParams?.get('view') === 'customer';
  const { fetchKitchenOrderDetails, createSalesInvoice, createPaymentEntry, getCompanyName, completeOpenTicket } = useApi();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<SalesOrders | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [showSendReceiptModal, setShowSendReceiptModal] = useState(false);
  const [splitPaymentEnabled, setSplitPaymentEnabled] = useState(false);
  const [multiplePaymentMode, setMultiplePaymentMode] = useState(1);
  const [paymentMethods, setPaymentMethods] = useState<Array<{
    method: string;
    amount: number;
  }>>([{ method: 'Cash', amount: 0 }]);
  const [discountEnabled, setDiscountEnabled] = useState<boolean>(false);
  const [discount, setDiscount] = useState(0);
  const [orderNetTotal, setOrderNetTotal] = useState(orderDetails?.net_total || 0);
  const { processPayment, connectToReader, isReaderConnected, readerStatus } = useStripeTerminal();
  const [status, setStatus] = useState("Idle");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [payNowIntentId, setPayNowIntentId] = useState<string | null>(null);
  const [testSimulationUrl, setTestSimulationUrl] = useState<string | null>(null);

  useEffect(() => {
    if (readerStatus) {
      setStatus(readerStatus);
    }
  }, [readerStatus]);

  // Calculate orderNetTotal based on discount
  useEffect(() => {
    if (orderDetails?.net_total) {
      const originalTotal = orderDetails.net_total;
      const discountAmount = (originalTotal * discount) / 100;
      const discountedTotal = originalTotal - discountAmount;
      setOrderNetTotal(discountedTotal);
    }
  }, [discount, orderDetails?.net_total]);


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
      paymentMethods[index] || { method: 'Cash', amount: 0 }
    );
    setPaymentMethods(newPaymentMethods);
  }, [multiplePaymentMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
        let interval: NodeJS.Timeout;
        console.log(payNowIntentId)
        if (payNowIntentId) {
            interval = setInterval(async () => {
                const res = await fetch(`/api/payment/paynow/status?id=${payNowIntentId}`);
                const data = await res.json();
                console.log("paynow status", data)
                
                if (data.status === "succeeded") {
                    setStatus("PayNow Payment Received!");
                    clearInterval(interval);
                    setQrCodeUrl(null);
                    setTestSimulationUrl(null);
                    setPayNowIntentId(null);
                    
                    // Trigger ERPNext sync
                    // await finalizeOrder("SAL-ORD-2024-001", 15.00, "PayNow", payNowIntentId);
                }
            }, 2000); // Check every 2 seconds
            setTimeout(() => {
                clearInterval(interval);
                setStatus("PayNow Payment Timeout. Please try again.");
                setQrCodeUrl(null);
                setTestSimulationUrl(null);
                setPayNowIntentId(null);
            }, 2 * 60 * 1000); // Timeout after 2 minutes
        }
        return () => clearInterval(interval);
    }, [payNowIntentId]);

  const updatePaymentMethod = (index: number, field: 'method' | 'amount', value: string | number) => {
    setPaymentMethods(prev => 
      prev.map((payment, i) => i === index ? { ...payment, [field]: value }
          : payment
      )
    );
  };

  const calculateTotalReceived = () => {
    return paymentMethods.reduce((total, payment) => total + payment.amount, 0);
  };

  const calculateChange = () => {
    if (!orderDetails) return 0;
    return calculateTotalReceived() - orderNetTotal;
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
  // ---------------------------------------------------------
    // 1. CARD PAYMENT (PayWave / Credit / Debit)
    // ---------------------------------------------------------
    const handleCardPayment = async (amount: number) => {
        try {
          console.log('Initiating card payment for amount:', amount);
            setStatus("Please Tap, Insert, or Swipe Card on Terminal...");
            setQrCodeUrl(null); // Clear any QR codes
            
            // This triggers the physical reader
            const result = await processPayment(amount);

            if (result.status === "succeeded") {
                setStatus("Card Payment Successful!");
                
                // Update payment method with the amount BEFORE calling handleCompletePayment
                const index = paymentMethods.findIndex(pm => pm.method === 'Debit/Credit Card' || pm.method === 'NETS');
                
                if (index !== -1) {
                    // Update the state and wait for next render
                    setPaymentMethods(prev => 
                      prev.map((payment, i) => i === index ? { ...payment, amount: amount } : payment)
                    );
                    paymentMethods[index].amount = amount; // Update the amount for the card payment method
                    console.log('Updated paymentMethods:', paymentMethods); // Log the updated payment methods
                    // Wait a tick for state to update, then complete payment
                    handleCompletePayment();
                } else {
                  toast.error('Payment method not found');
                }
            }
        } catch (error) {
            console.error(error);
            setStatus("Card Payment Failed");
        }
    };
  // ---------------------------------------------------------
  // 2. PAYNOW PAYMENT (QR Code)
  // ---------------------------------------------------------
  const handlePayNowPayment = async (amount: number) => {
        try {
            setStatus("Generating PayNow QR...");
            
            // A. Call our new API to get the PayNow Intent
            const res = await fetch('/api/payment/paynow', {
                method: 'POST',
                body: JSON.stringify({ amount }),
            });
            const data = await res.json();
            
            // B. Generate QR Code Image from the "next_action" data
            // Note: Stripe PayNow intents usually return a 'next_action' with a hosted instructions URL,
            // but often it's easier to use the Stripe Elements or just render the data if provided.
            // *Simpler approach for custom POS*: Use the 'next_action.paynow_display_qr_code.data' string 
            // from the retrieved intent (handled below via Stripe.js or manually).
            
            // For simplicity in this example, we assume we fetch the intent and get the "hosted_instructions_url" or raw data.
            // However, a cleaner way without the full Stripe Elements UI is to just display the QR string:
            
            // Let's assume the API returns the clientSecret. We use Stripe.js to retrieve the full intent to get the QR string.
            // (Simulated here for clarity - in production, your API should return the QR string directly)
            console.log("paynow intent:", data)
            setPayNowIntentId(data.id);
            // 2. Display QR Code (for real usage/production)
            if (data.qrCodeData) {
                const url = await QRCode.toDataURL(data.qrCodeData);
                setQrCodeUrl(url);
            }

            // 3. Set Simulation URL (for development testing)
            if (data.hostedUrl) {
                setTestSimulationUrl(data.hostedUrl);
            }
            setStatus("Waiting for Customer to Scan PayNow...");
            
            // In a real app, your API would return the `next_action.paynow_display_qr_code.data` 
            // string. We turn that into an image:
            // const qrCodeData = data.next_action?.paynow_display_qr_code?.data;
            // const url = await QRCode.toDataURL(qrCodeData);
            // setQrCodeUrl(url);

            // Start Polling for success
        } catch (error) {
            console.error(error);
            setStatus("PayNow Generation Failed");
        }
    };
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
      const completeOpenTicketResponse = await completeOpenTicket(orderDetails.name, discount, paymentMethods.map(payment => payment.method).toString()); // ! sent payment modes
      const completeOpenTicketData = await completeOpenTicketResponse.json();
      console.log('completeOpenTicketData', completeOpenTicketData); // ! console log
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
                additional_discount_percentage: discount,
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
          // router.push('/tickets');
          
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
              className="grid grid-cols-12 items-center gap-2 w-full mb-2 text-medium"
            >
              <p className="col-span-6 text-sm text-gray-500 font-medium truncate">
                {item.item_code}
              </p>
              <p className="col-span-2 text-sm text-gray-500">Qty: {item.qty}</p>
              <div className="col-span-4 text-right">
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
          {!isCustomerView && (
          <div className="flex justify-end gap-2 w-full">
            <Link
              href={{
                pathname: `/tickets/ordersummary/editorder`,
                query: { object: JSON.stringify(orderDetails) },
              }}
            >
              <Button
                className="mt-2 px-6 py-3 secondary text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                size="md"
              >
                Customize
              </Button>
            </Link>
            {/* Payment Button */}
            <Button
              onClick={() => setIsPaymentOpen(true)}
              className="mt-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Process Payment
            </Button>
          </div>
          )}
        </div>
      )}

      

      {/* Payment Slideout */}
      {!isCustomerView && (
      <SlideoutMenu isOpen={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <SlideoutMenu.Content>
          <SlideoutMenu.Header onClose={() => setIsPaymentOpen(false)}>
            <h2 className="text-xl text-black font-semibold">
              Payment Details
            </h2>
          </SlideoutMenu.Header>

          <div className="flex-1 p-4 text-black">
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
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Original Total</span>
                      <span>
                        ${orderDetails?.net_total?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-red-600 mb-2">
                      <span>Discount ({discount}%)</span>
                      <span>
                        -$
                        {(
                          ((orderDetails?.net_total || 0) * discount) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${orderNetTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <h3 className="font-medium">Payment Information</h3>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
                      Discount (%):
                    </label>
                  <label className="text-slate-600 text-sm cursor-pointer">No</label>

                  <div className="relative inline-block w-11 h-5">
                    <input id="switch-component-on" type="checkbox"
                    className="peer appearance-none w-11 h-5 bg-purple-100 rounded-full checked:bg-purple-500 cursor-pointer transition-colors duration-300"
                    checked={discountEnabled}
                    onChange={() => 
                      (setDiscountEnabled(!discountEnabled),
                       setDiscount(0))}
                    />
                    <label
                      className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800 cursor-pointer"
                    ></label>
                  </div>
                  <label className="text-slate-600 text-sm cursor-pointer">Yes</label>
                </div>
                {discountEnabled && (
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                    value={discount || ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      // Clamp the value between 0 and 100
                      const clampedValue = Math.min(Math.max(value, 0), 100);
                      setDiscount(clampedValue);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                )}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">
                    Split payment
                  </label>
                  <label className="text-slate-600 text-sm cursor-pointer">No</label>
                  <div className="relative inline-block w-11 h-5">
                    <input id="switch-component-on" type="checkbox"
                    className="peer appearance-none w-11 h-5 bg-purple-100 rounded-full checked:bg-purple-500 cursor-pointer transition-colors duration-300"
                    checked={splitPaymentEnabled}
                    onChange={() => setSplitPaymentEnabled(!splitPaymentEnabled)}
                    />
                    <label
                      className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800 cursor-pointer"
                    ></label>
                  </div>
                  <label className="text-slate-600 text-sm cursor-pointer">Yes</label>
                </div>
                {splitPaymentEnabled && (
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
                )}

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
                        min="0"
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
              <p>Status: {status}</p>
              {paymentMethods.some(pm => pm.method === 'Debit/Credit Card' || pm.method === 'NETS') && !isReaderConnected && <button onClick={() => { connectToReader(); }} >Connect Terminal</button>}
              <div className="flex gap-4 justify-center">
                {/* Card Button */}
                {paymentMethods.some(pm => pm.method === 'Debit/Credit Card' || pm.method === 'NETS') && 
                  <button 
                    onClick={() => { handleCardPayment(orderDetails?.net_total || 0);}}
                    className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700"
                >
                    Pay by Card / PayWave
                </button>}

                {/* PayNow Button */}
                {paymentMethods.some(pm => pm.method === 'Paynow') && 
                <button 
                    onClick={() => handlePayNowPayment(orderDetails?.net_total || 0)}
                    className="bg-purple-600 text-white px-6 py-3 rounded shadow hover:bg-purple-700"
                >
                    Generate PayNow QR
                </button>
                }
            </div>

            {/* Display QR Code if active */}
            {qrCodeUrl && (
                <div className="mt-6 flex flex-col items-center">
                    <p className="mb-2 font-semibold">Scan with Banking App</p>
                    {/* <img src={qrCodeUrl} alt="PayNow QR" width={200} height={200} /> */}
                    <Image src={qrCodeUrl} alt="PayNow QR" width={200} height={200} />
                </div>
            )}
            {/* TEST MODE: Simulation Button */}
            {testSimulationUrl && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center max-w-md">
                    <p className="text-sm font-bold text-yellow-800 mb-2">DEV MODE: Simulate Customer Scan</p>
                    <a 
                        href={testSimulationUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-block bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600"
                    >
                        Open Stripe Test Page &rarr;
                    </a>
                    <p className="text-xs text-gray-500 mt-2">
                        Click the link above, then click <strong>Authorize Test Payment</strong>. 
                        This page will automatically detect the payment.
                    </p>
                </div>
            )}
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
                color="primary"
                size="md"
                onClick={() => {
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
      )}

      {showSendReceiptModal && !isCustomerView && (
        <SendReceiptModal
          isOpen={showSendReceiptModal}
          onClose={() => { setShowSendReceiptModal(false); router.back(); }}
          order={orderDetails}
          onSkip={() => { setShowSendReceiptModal(false); router.back(); }}
        />
      )}
    </div>
  );
}