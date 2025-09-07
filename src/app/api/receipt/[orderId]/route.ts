import { NextRequest, NextResponse } from 'next/server';
import { generateReceipt } from '@/app/utils/receiptUtils';
import { useApi } from '@/app/context/ApiContext';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    console.log('Generating receipt for order:', orderId);
    const order = await useApi().fetchKitchenOrderDetails(orderId);
    // Generate the receipt for this order
    const receiptData = await generateReceipt
    ({ order,
        onSuccess: () => {
            console.log('Receipt generated successfully!');
        },
        onError: (error) => {
            console.error('Error generating receipt:', error);
        }
     });
    
    if (receiptData === null || receiptData === undefined) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // Return the PDF as a response
    return new NextResponse(receiptData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${orderId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 });
  }
}