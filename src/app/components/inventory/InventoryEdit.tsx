'use client'
import { useState } from 'react';
import { ItemWithPrice, StockReconciliationPayload } from '@/app/context/types/ERPNext';
import { useApi } from '@/app/context/ApiContext';
import toast from 'react-hot-toast';

type InventoryDetailsProps = {
  item?: ItemWithPrice;
  onClose: () => void;
  onUpdate?: () => Promise<void>;
};

export default function InventoryDetails({ item, onClose, onUpdate }: InventoryDetailsProps) {
  const { stockReconciliation } = useApi();
  const [quantity, setQuantity] = useState(item?.actual_qty || 0);
  const [price, setPrice] = useState(item?.price?.price_list_rate || 0);
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload: StockReconciliationPayload = {
        purpose: "Stock Reconciliation",
        items: [{
          item_code: item.name,
          warehouse: "Stores - R",
          qty: quantity
        }],
        docstatus: 1
      };

      await stockReconciliation(payload);
      toast.success('Inventory updated successfully');
      
      if (onUpdate) {
        await onUpdate();
      }
      
      onClose();
    } catch (error) {
      toast.error('Failed to update inventory');
      console.error('Error updating inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[315px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col">
      {/* Header */}
      <div className="flex flex-col justify-between items-center p-2 border-b">
        <div className='flex justify-between w-full'>
          <span className='text-base text-black p-2 font-semibold'>{item.item_name}</span>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-black">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 justify-between w-full">
          <span className="text-sm text-gray-500 p-2">Item Code: {item.name}</span>
          <span className="text-lg font-semibold text-gray-700 p-2">${price.toFixed(2)}</span>
        </div>
      </div>

      {/* Item Details - Scrollable section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-black">Basic Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs">
                <p className="text-gray-500">Item Group</p>
                <p className="text-black">{item.item_group}</p>
              </div>
              <div className="text-xs">
                <p className="text-gray-500">Stock UOM</p>
                <p className="text-black">{item.stock_uom}</p>
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-black">Stock Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs">
                <p className="text-gray-500">Available Quantity</p>
                <div className="flex items-center mt-1 text-black">
                  <button 
                    className="p-1 border rounded-l hover:bg-gray-100"
                    onClick={() => setQuantity(prev => Math.max(0, prev - 1))}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 text-center border-y p-1"
                  />
                  <button 
                    className="p-1 border rounded-r hover:bg-gray-100"
                    onClick={() => setQuantity(prev => prev + 1)}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="text-xs">
                <p className="text-gray-500">Reorder Level</p>
                <p className="text-black">{item.reorder_level || 0}</p>
              </div>
            </div>
          </div>

          {/* Price Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-black">Price Information</h3>
            <div className="text-xs">
              <p className="text-gray-500">Price</p>
              <div className="flex items-center mt-1">
                <span className="text-black mr-2">$</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-24 border rounded p-1 text-black"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t bg-white p-3">
        <div className="space-y-3">
          <button 
            className={`w-full py-2 bg-purple-600 text-white text-sm rounded-lg 
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'}`}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            className="w-full py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 