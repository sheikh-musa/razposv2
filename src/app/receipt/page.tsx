'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { generateReceipt } from '../utils/receiptUtils';
import { toast } from 'react-hot-toast';

export default function ReceiptPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const [receiptData, setReceiptData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateReceiptData = async () => {
      try {
        console.log('generating receipt', orderId);
        const receipt = await generateReceipt({
          order: { name: orderId, customer_name: 'John Doe' },
          onSuccess: () => {
            toast.success('Receipt generated successfully!');
          },
          onError: (error: Error) => {
            console.error('Error generating receipt:', error);
          }
        });
        
        setReceiptData(receipt);
      } catch (error) {
        console.error('Error generating receipt:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      generateReceiptData();
    }
  }, [orderId]);

  const handleDownload = () => {
    if (receiptData) {
      const blob = new Blob([receiptData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${orderId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-black">
        <div className="text-lg">Generating receipt...</div>
      </div>
    );
  }

  if (!receiptData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-500">Failed to generate receipt</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Receipt</h1>
          <p className="text-gray-600">Order: {orderId}</p>
        </div>
        
        <div className="text-center">
          <p className="mb-4">Your receipt is ready for download</p>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}