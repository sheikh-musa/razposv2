import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

export async function POST() {
  try {
    // This token allows the browser to connect to a physical reader
    const connectionToken = await stripe.terminal.connectionTokens.create();
    return NextResponse.json({ secret: connectionToken.secret });
  } catch (error) {
    console.error("Error creating connection token:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}