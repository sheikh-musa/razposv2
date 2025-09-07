'use client'
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
// import { ReceiptOrder } from '../../../utils/receiptUtils';
import { useApi } from '../../../context/ApiContext';
import QRCodeGenerator from '@/app/utils/QRCodeGenerator';
import { generateReceipt } from '@/app/utils/receiptUtils';

interface SendReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line
  order: any; //! temporary fix
  onSkip?: () => void;
}

export default function SendReceiptModal({ isOpen, onClose, onSkip, order }: SendReceiptModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { sendEmail } = useApi();
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState<string>('');


  // Generate receipt data (PDF or HTML)
  const generateReceiptData = async () => {
    try {
      setIsLoading(true);
      
      const receipt = await generateReceipt({
        order,
        onSuccess: () => {
          // Optional: Add any additional success handling
        },
        onError: (error) => {
          console.error('Receipt generation failed:', error);
        }
      });
      if (receipt) {
        return receipt;
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError('');
  };

  const handleSendReceipt = async () => {
    if (!email.trim()) {
      setEmailError('Please enter an email address');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Generate receipt for email attachment
      await generateReceiptData();

      // Send email with receipt
      const response = await sendEmail({
        recipients: email,
        subject: `Receipt for Order ${order.name}`,
        content: 'Please find your receipt attached.',
        doctype: 'Sales Order',
        name: order.name,
        send_email: 1
      });
      
      if (response.ok) {
        toast.success('Receipt sent successfully!');
        onClose();
      } else {
        toast.error('Failed to send receipt');
      }
    } catch (error) {
      console.error('Error sending receipt:', error);
      toast.error('Failed to send receipt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const receipt = await generateReceiptData();
      if (receipt) {
        // Create URL and download
        const url = window.URL.createObjectURL(receipt);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${order.name}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };
  
  // Generate QR code data for receipt download
const generateQRData = async () => {
  if (!order) return '';
  
  try {
    const receipt = await generateReceiptData();
    if (receipt) {
      // Create URL from the blob directly
      const url = window.URL.createObjectURL(receipt);
      console.log('Generated blob URL for QR:', url);
      return url;
    }
  } catch (error) {
    console.error('Error generating QR data:', error);
  }
  
  // Fallback to API endpoint if blob generation fails
  const receiptUrl = `${window.location.origin}/api/receipt/${order.name}`;
  return receiptUrl;
};



  const handleSkip = () => {
    onSkip?.();
    onClose();
  };

  // Generate QR data when QR section is shown
  const handleShowQR = async () => {
    if (!showQR) {
      const data = await generateQRData();
      setQrData(data || '');
    }
    setShowQR(!showQR);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Send Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Enter your email address to receive a copy of your receipt, or skip to continue.
          </p>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email address"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>

          {/* QR Code Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">QR Code</label>
            <button
              onClick={handleShowQR}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              {showQR ? 'Hide' : 'Show'} QR Code
            </button>
          </div>
          
          {showQR && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <QRCodeGenerator 
                value={qrData} 
                size={150}
                className="mb-3"
              />
               <p className="text-xs text-gray-600 text-center mb-3">
                Scan to download receipt
              </p>
              <button
                onClick={handleDownloadReceipt}
                className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Download Receipt
              </button>
            </div>
          )}
        </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Skip
            </button>
            <button
              onClick={handleSendReceipt}
              disabled={isLoading || !email.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </div>
              ) : (
                'Send Receipt'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}