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
  const { stockReconciliation, updateItemPrice, getCompanyName } = useApi();
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(item?.price?.price_list_rate || 0);
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleSave = async () => {
    if (quantity === 0 && price === item.price?.price_list_rate) {
      toast.error('No changes to save');
      return;
    }
    try {
      setLoading(true);
      if (quantity > 0) {
        let companyName = await getCompanyName();
        // @ts-expect-error - companyName is a string
        companyName = companyName.charAt(0);
      const payload: StockReconciliationPayload = {
        purpose: "Stock Reconciliation",
        items: [{
          item_code: item.name,
          warehouse: `Stores - ${companyName}`,
          qty: quantity + item.actual_qty,
          valuation_rate: price
        }],
        docstatus: 1
      };

        await stockReconciliation(payload);
      }
      if (price !== item.price?.price_list_rate) {
          await updateItemPrice(item.price?.name || '', price);
      }
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
        <div className="w-full h-48 relative rounded-lg overflow-hidden hover:scale-105 transition-all duration-300"
        style={{
          cursor: 'pointer',
          backgroundImage: `url(${item.image ? `${process.env.NEXT_PUBLIC_API_URL}/${item.image}` : "https://thumb.ac-illust.com/b1/b170870007dfa419295d949814474ab2_t.jpeg"})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        >
          {/* <SafeImage
            src={item.image ? `${process.env.NEXT_PUBLIC_API_URL}/${item.image}` : ""}
            alt={item.item_name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          /> */}
        <div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">  
          <button className="p-2 hover:bg-gray-100 rounded-full"
          onClick={() => {console.log('delete')}}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
            d="M16 6V5.2C16 4.0799 16 3.51984 15.782 3.09202C15.5903 2.71569 15.2843 2.40973 14.908 2.21799C14.4802 2 13.9201 2 12.8 2H11.2C10.0799 2 9.51984 2 9.09202 2.21799C8.71569 2.40973 8.40973 2.71569 8.21799 3.09202C8 3.51984 8 4.0799 8 5.2V6M10 11.5V16.5M14 11.5V16.5M3 6H21M19 6V17.2C19 18.8802 19 19.7202 18.673 20.362C18.3854 20.9265 17.9265 21.3854 17.362 21.673C16.7202 22 15.8802 22 14.2 22H9.8C8.11984 22 7.27976 22 6.63803 21.673C6.07354 21.3854 5.6146 20.9265 5.32698 20.362C5 19.7202 5 18.8802 5 17.2V6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            />
            </svg>
          </button>

          <button className="p-2 hover:bg-gray-100 rounded-full"
          onClick={() => {console.log('edit')}}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 3.99998H6.8C5.11984 3.99998 4.27976 3.99998 3.63803 4.32696C3.07354 4.61458 2.6146 5.07353 2.32698 5.63801C2 6.27975 2 7.11983 2 8.79998V17.2C2 18.8801 2 19.7202 2.32698 20.362C2.6146 20.9264 3.07354 21.3854 3.63803 21.673C4.27976 22 5.11984 22 6.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9264 19.673 20.362C20 19.7202 20 18.8801 20 17.2V13M7.99997 16H9.67452C10.1637 16 10.4083 16 10.6385 15.9447C10.8425 15.8957 11.0376 15.8149 11.2166 15.7053C11.4184 15.5816 11.5914 15.4086 11.9373 15.0627L21.5 5.49998C22.3284 4.67156 22.3284 3.32841 21.5 2.49998C20.6716 1.67156 19.3284 1.67155 18.5 2.49998L8.93723 12.0627C8.59133 12.4086 8.41838 12.5816 8.29469 12.7834C8.18504 12.9624 8.10423 13.1574 8.05523 13.3615C7.99997 13.5917 7.99997 13.8363 7.99997 14.3255V16Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            />
            </svg>
          </button>
        </div>
        </div>
        <div className="flex items-center gap-2 justify-between w-full">
          <span className="text-sm text-gray-500 p-2">Item Code: {item.name}</span>
          <span className="text-lg font-semibold text-gray-700 p-2">${item.price?.price_list_rate.toFixed(2)}</span>
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
            <div className="grid grid-cols-2 gap-2 w-full">
              <div className="text-xs">
                <p className="text-gray-500">Current quantity: {item.actual_qty}</p>
                <div className="flex items-center mt-1 text-black w-full">
                  <p className="text-gray-500 mr-2 whitespace-nowrap">Add quantity:</p>
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
                  <p className="text-gray-500 mt-2">New quantity: {item.actual_qty + quantity}</p>
              </div>
              {/* <div className="text-xs"> */}
                {/* <p className="text-gray-500">Reorder Level</p>
                <p className="text-black">{item.reorder_level || 0}</p> */}
              {/* </div> */} 
              {/* //! mock field */}
            </div>
          </div>

          {/* Price Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-black">Price Information</h3>
            <div className="text-xs">
              <p className="text-gray-500">Current price: ${item.price?.price_list_rate.toFixed(2)}</p>
              <div className="flex items-center mt-1">
              <p className="text-gray-500 mr-2">Update price:</p>
                <span className="text-black mr-1">$</span>
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