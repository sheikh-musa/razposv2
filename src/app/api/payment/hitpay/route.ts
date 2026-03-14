// src/app/api/payment/hitpay/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, orderName, payment_methods } = await req.json();

    // Determine environment (Sandbox vs Prod)
    const HITPAY_API_URL = "https://api.sandbox.hit-pay.com/v1/payment-requests";
    const API_KEY = process.env.HITPAY_API_KEY!;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

    const payload = {
      amount: amount,
      currency: "SGD",
      reference_number: orderName, // Pass your ERPNext Order ID
      // Where HitPay should send the user back after paying
      redirect_url: `${BASE_URL}/tickets/ordersummary?order=${orderName}&isOpen=true`, 
      purpose: `Order ${orderName}`,
      "payment_methods[]": payment_methods
    };

    const response = await fetch(HITPAY_API_URL, {
      method: "POST",
      headers: {
        "X-BUSINESS-API-KEY": API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
      },
      // HitPay expects URL Encoded data for this endpoint, not JSON
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: new URLSearchParams(payload as any).toString(),
    });
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "HitPay Error");
    }

    // Return the generated HitPay URL to the frontend
    return NextResponse.json({ url: data.url, id: data.id });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}