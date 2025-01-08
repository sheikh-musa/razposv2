'use client'
import React from 'react';

interface OrderSummaryProps {
  onClose: () => void;
}

export default function OrderSummary({ onClose }: OrderSummaryProps) {
  return (
    <div className="bg-white border-solid border p-4 rounded-lg shadow-md h-[calc(100vh-8rem)] sticky top-4 relative">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-md font-bold mb-4">Order Summary</h2>
      {/* Add your order summary content here */}
    </div>
  );
}
