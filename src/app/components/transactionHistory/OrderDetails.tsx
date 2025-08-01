'use client'
import { useState } from 'react';
import { SalesHistoryOrder, TransactionHistoryItem } from '@/app/context/types/ERPNext';
import { useApi } from '@/app/context/ApiContext';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


type OrderDetailsProps = {
  order: SalesHistoryOrder;
  onClose: () => void;
};

export default function OrderDetails({ order, onClose }: OrderDetailsProps) {
  const { getCompanyName } = useApi();
  const [loading, setLoading] = useState(false);
  // const [paymentMethod, setPaymentMethod] = useState(order?.custom_payment_mode || 'Cash');
  // const [paymentStatus, setPaymentStatus] = useState(order?.custom_payment_complete ? 'Paid' : 'Unpaid');

  if (!order) return null;

  const handleGenerateReceipt = async () => {
    try {
      setLoading(true);
      const companyName = await getCompanyName();
      
      // Create PDF document
      const doc = new jsPDF();
      
      // Set font
      doc.setFont('helvetica');
      
      // ! Company logo
      doc.setFontSize(20);
      doc.setFont('courier', 'bold');
      doc.text('RAZPOS', 15, 15, { align: 'left' });
      
      doc.setFontSize(15);
      doc.setFont('helvetica', 'normal');
      doc.text('Receipt', 15, 30, { align: 'left' });
      
      // Company info
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('Order ID:', 15, 40);
      doc.setTextColor(0, 0, 0);
      doc.text(`#${order.name}`, 50, 40);
      doc.setTextColor(128, 128, 128);
      doc.text('Receipt \nDate & Time', 15, 50);
      doc.setTextColor(0, 0, 0);
      doc.text(`${new Date().toLocaleTimeString()},`, 50, 50);
      doc.text(`${new Date().toLocaleDateString()}`, 67, 50);
      
      doc.setDrawColor(128, 128, 128);
      doc.line(15, 65, 200, 65);

      // Customer info
      doc.text("Billed To", 15, 80);
      doc.text('Customer Details:', 15, 90);
      doc.text(`${order.customer_name}`, 15, 95);
      // doc.text(`${order.contact_person || ''}`, 15, 100);

      // Company info
      doc.text("From", 120, 80);
      doc.text(`${companyName}`, 120, 90); // ! company name
      doc.text(`${`200, Jurong West Street 61, #01-355\nSingapore 640200`}`, 120, 95); // ! company address

      // Items table
      const tableData = order.items?.map(item => [
        item.item_code || 'N/A',
        item.qty || 0,
        `$${(item.rate || 0).toFixed(2)}`,
        `$${((item.qty || 0) * (item.rate || 0)).toFixed(2)}`
      ]) || [];
      
      // Add header row
      const tableHeaders = ['Item', 'Qty', 'Price', 'Total'];
      
      // Create table with full width
      autoTable(doc, {
        startY: 125,
        head: [tableHeaders],
        body: tableData,
        theme: 'plain', // Use plain theme for more control
        headStyles: {
          fillColor: [255, 255, 255],  // white color
          textColor: 0, // black text
          fontStyle: 'bold',
          fontSize: 10,
          cellPadding: 2,
          // lineColor: [220, 220, 220], // Gray line color
          // lineWidth: 0.1
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
          // lineColor: [220, 220, 220], // Gray line color for all cells
          // lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 'auto', halign: 'left' }, // Item name - auto width
          1: { cellWidth: 25, halign: 'center' }, // Qty
          2: { cellWidth: 35, halign: 'right' }, // Price
          3: { cellWidth: 35, halign: 'right' } // Total
        },
        margin: { left: 15, right: 15 }, // Full width margins
        tableWidth: 'auto', // Auto width to fill available space
        didDrawCell: function(data) {
          // Add gray line under header row
          if (data.row.index === 0) {
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            doc.line(data.cell.x, data.cell.y, 
                     data.cell.x + data.cell.width, data.cell.y);
                
          }
          
          // Add gray line under each item row
          if (data.row.index >= 1) {
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            doc.line(data.cell.x, data.cell.y + data.cell.height, 
                     data.cell.x + data.cell.width, data.cell.y + data.cell.height);
          }
        }
      });
      
      // Calculate totals
      const subtotal = order.items?.reduce((sum: number, item: TransactionHistoryItem) => 
        sum + ((item.qty || 0) * (item.rate || 0)), 0) || 0;
      const tax = subtotal * 0.07; // 7% GST
      const total = subtotal + tax;
      
      // Totals section
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Subtotal:', 140, finalY);
      doc.text(`$${subtotal.toFixed(2)}`, 170, finalY);
      
      doc.text('GST (7%):', 140, finalY + 10);
      doc.text(`$${tax.toFixed(2)}`, 170, finalY + 10);
      
      doc.setFontSize(12);
      doc.text('Total:', 140, finalY + 20);
      doc.text(`$${total.toFixed(2)}`, 170, finalY + 20);
      
      // Payment info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text('Powered by Razpos', 15, finalY + 35);
      // doc.text(`Payment Method: ${order.custom_payment_mode || 'Cash'}`, 15, finalY + 35);

      // doc.text(`Status: ${order.custom_payment_complete ? 'Paid' : 'Unpaid'}`, 15, finalY + 45);
      
      // Footer
      doc.setFontSize(8);
      doc.text('Thank you for your business!', 105, finalY + 60, { align: 'center' });
      doc.text('For any queries, please contact us', 105, finalY + 70, { align: 'center' });
      
      // Save PDF
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
      toast.success('Receipt generated successfully!');
      
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="z-50"><Toaster /></div>
      <div className="fixed inset-y-0 right-0 w-[315px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex flex-col justify-between items-center p-2 border-b">
          <div className='flex justify-between w-full'>
            <span className='text-base text-black p-2 font-semibold'>Order #{order.name}</span>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 justify-between w-full">
            <span className="text-sm text-gray-500 p-2">• {order.total_qty} items
            </span>
            <span className="text-lg font-semibold text-gray-700 p-2">${order.net_total.toFixed(2)}</span>
          </div>
        </div>

        {/* Order Items - Make this section scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {order.items.map((item, index) => (
              item.item_code && (
                  <div key={index}>
                    <div className="flex items-start mb-2 h-8">
                      <div className='w-1/3'>
                        <h3 className="font-semibold text-sm text-black">{item.item_code}</h3>
                        <p className="text-xs text-gray-600">{item.item_name}</p>
                      </div>
                      <div className='flex h-full items-center justify-center w-1/3'>
                      <div className='border rounded-md'>
                      <button className="p-1 hover:bg-gray-200 text-black border-r">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-center text-black text-sm mx-1">{item.qty}</span>
                      <button className="p-1 hover:bg-gray-200 text-black border-l">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      </div>
                      </div>
                      <div className="text-right w-1/3">
                        <p className="text-sm text-black">${item.rate.toFixed(2)}/ea</p>
                        <button className="ml-auto text-black">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      </div>
                    </div>
                        <div className="items-center bg-gray-50 rounded-lg py-2 text-end">
                        <p className="text-sm text-gray-600 font-semibold">${(item.rate * item.qty).toFixed(2)}</p>
                        </div>
                    </div>
                )
              )
            )}
          </div>
        </div>

        {/* Payment Section */}
        <div className="border-t bg-white p-3">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-semibold">Payment</label>
              <select 
                value={order.custom_payment_mode}
                className="w-full p-2 border rounded-lg text-xs text-black"
                disabled
              >
                <option>Cash</option>
                <option>Credit Card</option>
                <option>PayNow</option>
                <option>NETS</option>
                <option>CDC</option>
              </select>
            </div>
            <button 
              className="w-full py-1 bg-white border border-purple-600 text-purple-600 text-sm rounded-lg hover:bg-purple-100 disabled:bg-gray-100 disabled:text-gray-400" 
              onClick={handleGenerateReceipt}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Receipt'}
            </button>
            {/* <div>
              <label className="block text-xs text-gray-600 mb-1 font-semibold">Payment status</label>
              <select 
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full p-2 border rounded-lg text-black text-xs"
              >
                <option>Paid</option>
                <option>Unpaid</option>
              </select>
            </div> */}
            
            <button className="w-full py-3 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}