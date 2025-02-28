type InventoryTableProps = {
    currentItems: ItemDetailed[];
    selectedItems: { name: string; item_name: string; }[];
    handleCheckboxChange: (name: string, itemName: string, checked: boolean) => void;
    handleSelectAll: (checked: boolean) => void;
    handleDelete: (name: string, itemName: string) => void;
    handleRestore?: (name: string, itemName: string) => void;
    showDeletedItems: boolean;
};

export default function InventoryTable({ 
    currentItems, 
    selectedItems, 
    handleCheckboxChange, 
    handleSelectAll,
    handleDelete,
    handleRestore,
    showDeletedItems
}: InventoryTableProps) {
    return (
        <div className="bg-white rounded-lg shadow text-black">
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
                                    checked={selectedItems.some(
                                        selected => selected.name === item.name
                                    )}
                                    onChange={(e) => handleCheckboxChange(
                                        item.name,
                                        item.item_name,
                                        e.target.checked
                                    )}
                                />
                            </td>
                            <td className="px-6 py-4">{item.item_name}</td>
                            <td className="px-6 py-4">{item.actual_qty}</td>
                            <td className="px-6 py-4">${item.valuation_rate.toFixed(2)}</td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    {showDeletedItems ? (
                                        <button 
                                            onClick={() => handleRestore?.(item.name, item.item_name)}
                                            className="text-gray-500 hover:text-gray-700"
                                            title="Restore Item"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleDelete(item.name, item.item_name)}
                                            className="text-gray-500 hover:text-gray-700"
                                            title="Delete Item"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                    <button className="text-gray-500 hover:text-gray-700">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
