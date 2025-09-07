import { NextResponse } from "next/server";
import { generateReceipt } from "@/app/utils/receiptUtils";

// Note: Use inline param typing for Next.js route handlers

// Function to fetch order data from ERPNext API
async function fetchOrderData(orderId: string) {
  try {
    console.log('Fetching order data for order:', orderId);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order/${orderId}`,
      {
        headers: {
          'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch order ${orderId}:`, response.status);
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    return null;
  }
}

export async function GET(request: Request, { params }: { params: { order: string } }) {
  try {
    const orderId = params.order;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Try to fetch real order data from ERPNext API
    const erpNextOrderData = await fetchOrderData(orderId);
    console.log('ERPNext Order Data:', erpNextOrderData);
    
    let orderData;
    
    // If we can't fetch real data, fall back to mock data
    if (!erpNextOrderData) {
      console.log(`Using mock data for order ${orderId}`);
      orderData = {
        name: orderId,
        customer_name: "Guest Customer",
        items: [
          {
            item_code: "ITEM-001",
            qty: 2,
            rate: 5.50
          },
          {
            item_code: "ITEM-002", 
            qty: 1,
            rate: 8.00
          }
        ],
        custom_payment_mode: "Cash",
        custom_payment_complete: true
      };
    } else {
      // Map ERPNext data to the format expected by generateReceipt
      orderData = {
        name: erpNextOrderData.name || orderId,
        customer_name: erpNextOrderData.customer || "Guest Customer",
        items: erpNextOrderData.items?.map((item: { item_code?: string; qty?: number; price_list_rate?: number }) => ({
          item_code: item.item_code || "N/A",
          qty: item.qty || 0,
          rate: item.price_list_rate || 0
        })) || [],
        custom_payment_mode: erpNextOrderData.custom_payment_mode || "Cash",
        custom_payment_complete: erpNextOrderData.custom_payment_complete || true
      };
    }
    
    console.log('Mapped Order Data:', orderData);

    // Generate the PDF receipt
    const pdfBlob = await generateReceipt({
      order: orderData,
      onSuccess: () => {
        console.log('Receipt generated successfully for order:', orderId);
      },
      onError: (error) => {
        console.error('Receipt generation failed for order:', orderId, error);
      }
    });
    console.log('PDF Blob:', pdfBlob);
    if (!pdfBlob) {
      return NextResponse.json(
        { error: "Failed to generate receipt" },
        { status: 500 }
      );
    }

    // Convert blob to buffer
    const buffer = await pdfBlob.arrayBuffer();
    
    // Return the PDF with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="receipt-${orderId}.pdf"`,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Add a POST method if you want to generate receipts with custom data
export async function POST(request: Request, { params }: { params: { order: string } }) {
  try {
    const orderId = params.order;
    const body = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Use the provided order data or fall back to mock data
    let orderData;
    
    if (body.order) {
      // If order data is provided, use it directly
      orderData = body.order;
    } else {
      // Fall back to mock data
      orderData = {
        name: orderId,
        customer_name: "Guest Customer",
        items: [
          {
            item_code: "ITEM-001",
            qty: 2,
            rate: 5.50
          }
        ],
        custom_payment_mode: "Cash",
        custom_payment_complete: true
      };
    }

    // Generate the PDF receipt
    const pdfBlob = await generateReceipt({
      order: orderData,
      onSuccess: () => {
        console.log('Receipt generated successfully for order:', orderId);
      },
      onError: (error) => {
        console.error('Receipt generation failed for order:', orderId, error);
      }
    });

    if (!pdfBlob) {
      return NextResponse.json(
        { error: "Failed to generate receipt" },
        { status: 500 }
      );
    }

    // Convert blob to buffer
    const buffer = await pdfBlob.arrayBuffer();
    
    // Return the PDF with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="receipt-${orderId}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}