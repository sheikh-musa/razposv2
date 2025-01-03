"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';

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
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [showOptions, setShowOptions] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{productId: number, variantId: number} | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch("/api/products")
          .then((res) => res.json())
          .then((data) => setProducts(data));
    }, []);

    const handleDelete = (productId: number, variantId: number) => {
        setProductToDelete({ productId, variantId });
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (productToDelete) {
            // Delete from local state
            setProducts(prevProducts => 
                prevProducts.map(product => {
                    if (product.id === productToDelete.productId) {
                        return {
                            ...product,
                            variants: product.variants.filter(v => v.id !== productToDelete.variantId)
                        };
                    }
                    return product;
                }).filter(product => product.variants.length > 0)
            );

            // Optional: Update the backend
            // fetch(`/api/products/${productToDelete.productId}/variants/${productToDelete.variantId}`, {
            //     method: 'DELETE',
            // });

            setShowDeleteModal(false);
            setProductToDelete(null);
        }
    };

    const filteredProducts = products.map(product => ({
        ...product,
        variants: product.variants.filter(variant => 
            `${product.type} - ${variant.name}`.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(product => product.variants.length > 0);

    return (
        <div className="p-6 bg-white min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-black">Inventory</h1>
                <div className="flex items-center gap-2 text-black text-sm">
                    {/* Search Bar */}
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border text-black rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Filters Button */}
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                    </button>

                    {/* Add Inventory Button */}
                    <button 
                        onClick={() => router.push('/inventory/add')}
                        className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Inventory
                    </button>

                    {/* Export Button */}
                    <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Export
                    </button>

                    {/* More Options (Hamburger) Button */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowOptions(!showOptions)} 
                            className="p-2 hover:bg-gray-100 rounded-md"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showOptions && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                <button 
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                                    onClick={() => {
                                        // Handle edit
                                        setShowOptions(false);
                                    }}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Edit
                                </button>
                                <button 
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                                    onClick={() => {
                                        // Handle delete
                                        setShowOptions(false);
                                    }}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
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
                        {filteredProducts.map((product) => 
                            product.variants.map((variant) => (
                                <tr key={`${product.id}-${variant.id}`} className="border-b hover:bg-gray-50 text-sm">
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
                                            <button 
                                                onClick={() => handleDelete(product.id, variant.id)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
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
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-black text-lg font-medium text-center mb-2">Confirm</h3>
                        <p className="text-gray-500 text-center mb-6">Are you sure you want to delete this item?</p>
                        <p className="text-gray-500 text-center text-sm mb-6">This action cannot be undone</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="text-black flex-1 px-4 py-2 border border-slate-500 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
