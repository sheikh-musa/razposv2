'use client'
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useApi } from '@/app/context/ApiContext';
import { generateReceipt } from '@/app/utils/receiptUtils';

export default function ReceiptPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('order') || '';
  const { fetchKitchenOrderDetails } = useApi();

  useEffect(() => {
    if (orderId) {
      console.log('Orderid:', orderId);
      generateReceiptData();
    }
    // eslint-disable-next-line
  }, [orderId]);

  const generateReceiptData = async () => {
    const rawOrder = await fetchKitchenOrderDetails(orderId); // returns SalesOrders[]
    console.log('Raw order:', rawOrder);
    const receiptOrder = {
      // @ts-expect-error - name is not defined in the type
      name: rawOrder.name,
      // @ts-expect-error - customer is not defined in the type
      customer_name: rawOrder.customer ?? 'Guest',
      // @ts-expect-error - items is not defined in the type
      items: (rawOrder.items ?? []).map(i => ({
        item_code: i.item_code,
        qty: i.qty,
        rate: i.price_list_rate ?? 0,
      })),
      // custom_payment_mode: rawOrder.custom_payment_mode,
      // custom_payment_complete: !!rawOrder.custom_payment_complete,
    };

    const receipt = await generateReceipt({
      order: receiptOrder,
      onSuccess: () => console.log('Receipt generated'),
      onError: (e) => console.error('Failed:', e),
    });
    console.log('Receipt:', receipt);
    if (receipt) {
    const url = window.URL.createObjectURL(receipt);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${orderId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

  return (
  <div>Receipt</div>
)};