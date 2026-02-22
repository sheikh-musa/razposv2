// src/app/api/payment/paynow/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-expect-error - This version includes the new Terminal API
  apiVersion: "2024-11-20.acacia",
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    // 1. Create a PaymentIntent specifically for PayNow
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "sgd",
      payment_method_types: ["paynow"],
    

   // Crucial: Tell Stripe to "confirm" it immediately
      confirm: true,
      
      // Crucial: Create a "PayNow" method on the fly
      payment_method_data: {
        type: "paynow",
      },
      
      // Required for "confirm: true" (even if we don't actually redirect)
      return_url: "http://localhost:3000/payment", 
    });

    // 2. Now 'next_action' will exist in the response
    const nextAction = paymentIntent.next_action;
    
    // 3. Extract the data
    const hostedUrl = nextAction?.paynow_display_qr_code?.hosted_instructions_url;
    
    // Note: Stripe API sometimes returns 'image_url_png' or 'data' depending on version
    // The raw string for qrcode library is usually in 'data'
    const qrCodeData = nextAction?.paynow_display_qr_code?.data;
    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret, 
      id: paymentIntent.id,
      hostedUrl: hostedUrl, // <--- Pass this to the frontend
      qrCodeData: qrCodeData
    }, { headers: corsHeaders });
    // eslint-disable-next-line
  } catch (error: any) { 
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}