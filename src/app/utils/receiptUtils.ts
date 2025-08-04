import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';

export interface ReceiptItem {
  item_code?: string;
  qty?: number;
  rate?: number;
}

export interface ReceiptOrder {
  name: string;
  customer_name: string;
  items?: ReceiptItem[];
  custom_payment_mode?: string;
  custom_payment_complete?: boolean;
}

export interface GenerateReceiptOptions {
  order: ReceiptOrder;
  companyName?: string;
  companyAddress?: string;
  taxRate?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Generate a PDF receipt for an order
 * 
 * Usage examples:
 * 
 * // Basic usage
 * await generateReceipt({ order });
 * 
 * // With custom company info
 * await generateReceipt({
 *   order,
 *   companyName: 'My Company',
 *   companyAddress: '123 Main St, City, State',
 *   taxRate: 0.08
 * });
 * 
 * // With success/error callbacks
 * await generateReceipt({
 *   order,
 *   onSuccess: () => console.log('Receipt generated!'),
 *   onError: (error) => console.error('Failed:', error)
 * });
 */
export const generateReceipt = async (options: GenerateReceiptOptions): Promise<void> => {
  const {
    order,
    companyName = 'RAZPOS',
    companyAddress = '200, Jurong West Street 61, #01-355\nSingapore 640200',
    taxRate = 0.07,
    onSuccess,
    onError
  } = options;

  try {
    // Create PDF document
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica');
    
    // Company logo
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

    // Company info
    doc.text("From", 120, 80);
    doc.text(`${companyName}`, 120, 90);
    doc.text(`${companyAddress}`, 120, 95);

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
      theme: 'plain',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        fontStyle: 'bold',
        fontSize: 10,
        cellPadding: 2,
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      },
      margin: { left: 15, right: 15 },
      tableWidth: 'auto',
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
    const subtotal = order.items?.reduce((sum: number, item: ReceiptItem) => 
      sum + ((item.qty || 0) * (item.rate || 0)), 0) || 0;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // Totals section
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', 140, finalY);
    doc.text(`$${subtotal.toFixed(2)}`, 170, finalY);
    
    doc.text(`GST (${(taxRate * 100).toFixed(0)}%):`, 140, finalY + 10);
    doc.text(`$${tax.toFixed(2)}`, 170, finalY + 10);
    
    doc.setFontSize(12);
    doc.text('Total:', 140, finalY + 20);
    doc.text(`$${total.toFixed(2)}`, 170, finalY + 20);
    
    // Payment info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('Powered by Razpos', 15, finalY + 35);
    
    // Footer
    doc.setFontSize(8);
    doc.text('Thank you for your business!', 105, finalY + 60, { align: 'center' });
    doc.text('For any queries, please contact us', 105, finalY + 70, { align: 'center' });
    
    // Save PDF
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    
    toast.success('Receipt generated successfully!');
    onSuccess?.();
    
  } catch (error) {
    console.error('Error generating receipt:', error);
    toast.error('Failed to generate receipt');
    onError?.(error as Error);
  }
};

// Helper function to get company name (you can customize this based on your needs)
export const getCompanyName = async (): Promise<string> => {
  // This could be fetched from your API or configuration
  return 'RAZPOS';
}; 