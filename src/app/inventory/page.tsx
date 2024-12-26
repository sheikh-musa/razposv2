"use client"
import React, { useEffect, useState } from 'react'

type Variant = {
    id: number;
    name: string;
    price: number;
    stock: number;
};
  
type Product = {
    id: number;
    type: string;
    variants: Variant[];
};
  
export default function Inventory() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        fetch("/api/products")
          .then((res) => res.json())
          .then((data) => setProducts(data));
    }, []);

    return (
        <div className="p-6 bg-white min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-black">Inventory</h1>
                <div className="flex gap-4">
                    <button className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600">
                        Add Inventory
                    </button>
                    <button className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 text-black">
                        Export
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow text-black">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                                <input type="checkbox" className="rounded" />
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Item Name</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Price (SGD)</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => 
                            product.variants.map((variant) => (
                                <tr key={`${product.id}-${variant.id}`} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="rounded" />
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.type} - {variant.name}
                                    </td>
                                    <td className="px-6 py-4">{variant.stock}</td>
                                    <td className="px-6 py-4">${variant.price.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button className="text-gray-500 hover:text-gray-700">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                            <button className="text-gray-500 hover:text-gray-700">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
