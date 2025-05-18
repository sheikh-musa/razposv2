// "use client"
// import { useEffect, useState } from 'react';

// type ItemBasic = {
//     name: string;
//     item_name: string;
// };

// type ItemDetailed = {
//     name: string;
//     item_name: string;
//     item_code: string;
//     description: string;
//     stock_uom: string;
//     valuation_rate: number;
//     item_group: string;
//     opening_stock: number;
//     actual_qty: number;
//     warehouse: string;
//     // Add more fields as needed
// };

// type StockInfo = {
//     actual_qty: number;
//     valuation_rate: number;
//     warehouse: string;
// };

// export default function TestPage() {
//     const [items, setItems] = useState<ItemBasic[]>([]);
//     const [selectedItem, setSelectedItem] = useState<ItemDetailed | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         fetchItems();
//     }, []);

//     const fetchItems = async () => {
//         try {
//             const response = await fetch('http://localhost:8080/api/resource/Item?filters=[["has_variants","=",0],["disabled","=",0]]', {
//                 headers: {
//                     'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090'  // Replace with your actual API credentials
//                 }
//             });
            
//             if (!response.ok) {
//                 throw new Error('Failed to fetch items');
//             }

//             const data = await response.json();
//             console.log('API Response:', data); // Debug log

//             // ERPNext returns data in this structure
//             if (data && Array.isArray(data.data)) {
//                 const formattedItems = data.data.map((item: any) => ({
//                     name: item.name,
//                     item_name: item.item_name || item.name, // Fallback to name if item_name is not available
//                 }));
//                 setItems(formattedItems);
//             } else {
//                 console.error('Unexpected data structure:', data);
//                 setError('Unexpected data structure from API');
//             }
//             setLoading(false);
//         } catch (err) {
//             console.error('Error fetching items:', err); // Debug log
//             setError(err instanceof Error ? err.message : 'An error occurred');
//             setLoading(false);
//         }
//     };

//     const fetchItemDetails = async (itemName: string) => {
//         try {
//             // Fetch item details
//             const itemResponse = await fetch(`http://localhost:8080/api/resource/Item/${itemName}`, {
//                 headers: {
//                     'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090'
//                 }
//             });
            
//             if (!itemResponse.ok) {
//                 throw new Error('Failed to fetch item details');
//             }

//             const itemData = await itemResponse.json();

//             // Fetch stock information
//             const stockResponse = await fetch(
//                 `http://localhost:8080/api/resource/Bin?filters=[["item_code","=","${itemName}"]]&fields=["item_code","actual_qty","warehouse","valuation_rate"]`, 
//                 {
//                     headers: {
//                         'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090'
//                     }
//                 }
//             );

//             if (!stockResponse.ok) {
//                 throw new Error('Failed to fetch stock information');
//             }

//             const stockData = await stockResponse.json();
            
//             // Combine the stock information with item details
//             const stockInfo = stockData.data[0] || { 
//                 actual_qty: 0, 
//                 valuation_rate: 0,
//                 warehouse: 'N/A'
//             };

//             // Merge item details with stock information
//             setSelectedItem({
//                 ...itemData.data,
//                 actual_qty: stockInfo.actual_qty,
//                 valuation_rate: stockInfo.valuation_rate,
//                 warehouse: stockInfo.warehouse
//             });

//         } catch (err) {
//             console.error('Error fetching item details:', err);
//             setError(err instanceof Error ? err.message : 'An error occurred');
//         }
//     };

//     if (loading) {
//         return (
//             <div className="p-6">
//                 <div className="animate-pulse">
//                     <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
//                     <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
//                     <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="p-6">
//                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//                     <p>{error}</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="p-6 text-black">
//             <h1 className="text-2xl font-bold mb-6">ERPNext Items Test</h1>
            
//             {/* Debug output */}
//             <div className="mb-4 p-4 bg-gray-100 rounded">
//                 <p>Items count: {items.length}</p>
//                 <p>Raw items data:</p>
//                 <pre className="text-xs overflow-auto">
//                     {JSON.stringify(items, null, 2)}
//                 </pre>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Items List */}
//                 <div className="bg-white rounded-lg shadow p-4">
//                     <h2 className="text-lg font-semibold mb-4">Items List</h2>
//                     <div className="space-y-2">
//                         {items.map((item) => (
//                             <button
//                                 key={item.name}
//                                 onClick={() => {
//                                     fetchItemDetails(item.name)
//                                 }}
//                                 className="w-full text-left p-2 hover:bg-gray-50 rounded-md transition-colors"
//                             >
//                                 <p className="font-medium">Name: {item.item_name || 'No name'}</p>
//                                 {/* <p className="text-sm text-gray-500">Code: {item.item_code || 'No code'}</p> */}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Item Details */}
//                 {selectedItem && (
//                     <div className="bg-white rounded-lg shadow p-4">
//                         <h2 className="text-lg font-semibold mb-4">Item Details</h2>
//                         <div className="space-y-4">
//                             <div>
//                                 <p className="text-sm text-gray-500">Name</p>
//                                 <p className="font-medium">{selectedItem.item_name}</p>
//                             </div>
//                             <div>
//                                 <p className="text-sm text-gray-500">Code</p>
//                                 <p className="font-medium">{selectedItem.item_code}</p>
//                             </div>
//                             <div>
//                                 <p className="text-sm text-gray-500">Description</p>
//                                 <p className="font-medium">{selectedItem.description || 'No description'}</p>
//                             </div>
//                             <div>
//                                 <p className="text-sm text-gray-500">Unit of Measure</p>
//                                 <p className="font-medium">{selectedItem.stock_uom}</p>
//                             </div>
//                             <div>
//                                 <p className="text-sm text-gray-500">Current Stock</p>
//                                 <p className="font-medium">{selectedItem.actual_qty || 0} {selectedItem.stock_uom}</p>
//                             </div>
//                             <div>
//                                 <p className="text-sm text-gray-500">Valuation Rate</p>
//                                 <p className="font-medium">${selectedItem.valuation_rate?.toFixed(2) || '0.00'}</p>
//                             </div>
//                             <div>
//                                 <p className="text-sm text-gray-500">Item Group</p>
//                                 <p className="font-medium">{selectedItem.item_group}</p>
//                             </div>
//                             <div>
//                                 <p className="text-sm text-gray-500">Warehouse</p>
//                                 <p className="font-medium">{selectedItem.warehouse || 'N/A'}</p>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Debug Section */}
//             <div className="mt-8">
//                 <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
//                 <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
//                     {JSON.stringify({ items, selectedItem }, null, 2)}
//                 </pre>
//             </div>
//         </div>
//     );
// } 