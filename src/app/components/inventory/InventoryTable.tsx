import { ItemWithPrice } from "@/app/context/types/ERPNext";

type InventoryTableProps = {
  currentItems: ItemWithPrice[];
  selectedItems: { name: string; item_name: string }[];
  handleCheckboxChange: (name: string, itemName: string, checked: boolean) => void;
  handleSelectAll: (checked: boolean) => void;
  handleDelete: (name: string, itemName: string) => void;
  handleRestore?: (name: string, itemName: string) => void;
  showDeletedItems: boolean;
  onEditItem: (item: ItemWithPrice) => void;
};

export default function InventoryTable({
  currentItems,
  selectedItems,
  handleCheckboxChange,
  handleSelectAll,
  handleDelete,
  handleRestore,
  showDeletedItems,
  onEditItem,
}: InventoryTableProps) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg shadow text-black">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Item Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Price (SGD)</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.name} className="border-b hover:bg-gray-50 text-sm">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selectedItems.some((selected) => selected.name === item.name)}
                    onChange={(e) => handleCheckboxChange(item.name, item.item_name, e.target.checked)}
                  />
                </td>
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">{item.actual_qty}</td>
                <td className="px-6 py-4">${item.price?.price_list_rate.toFixed(2) || 0}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {showDeletedItems ? (
                      <button
                        onClick={() => handleRestore?.(item.name, item.item_name)}
                        className="text-gray-500 hover:text-gray-700"
                        title="Restore Item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDelete(item.name, item.item_name)}
                        className="text-gray-500 hover:text-gray-700"
                        title="Delete Item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                    <button className="text-gray-500 hover:text-gray-700" onClick={() => onEditItem(item)}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {/* Select All Header for Mobile */}
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between text-black">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <input
              type="checkbox"
              className="rounded"
              checked={selectedItems.length === currentItems.length && currentItems.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            Select All ({currentItems.length} items)
          </label>
          <span className="text-xs text-gray-500">{selectedItems.length} selected</span>
        </div>

        {/* Item Cards */}
        {currentItems.map((item) => (
          <div key={item.name} className="bg-white rounded-lg shadow text-black">
            <div className="p-4">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    className="rounded mt-1"
                    checked={selectedItems.some((selected) => selected.name === item.name)}
                    onChange={(e) => handleCheckboxChange(item.name, item.item_name, e.target.checked)}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.item_name}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-3">
                  {showDeletedItems ? (
                    <button
                      onClick={() => handleRestore?.(item.name, item.item_name)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-md"
                      title="Restore Item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDelete(item.name, item.item_name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete Item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-md" onClick={() => onEditItem(item)} title="Edit Item">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Card Details */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stock</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{item.actual_qty}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Price (SGD)</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">${item.price?.price_list_rate.toFixed(2) || 0}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
