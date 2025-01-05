"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

export default function AddInventory() {
    const router = useRouter();
    const [itemName, setItemName] = useState('');
    const [variants, setVariants] = useState([{ name: '', inventory: 0, price: 0 }]);

    const handleAddVariant = () => {
        const lastVariant = variants[variants.length - 1];
        if (!lastVariant.name.trim()) {
            toast.error('Please fill in the previous variant name before adding a new one', {
                duration: 3000,
                position: 'top-center',
                style: {
                    background: '#F44336',
                    color: '#fff',
                }
            });
            return;
        }
        setVariants([...variants, { name: '', inventory: 0, price: 0 }]);
    };

    const handleCancel = () => {
        router.back();
    };

    const handleSubmit = async () => {
        // Add your submit logic here
        // After successful submission:
        router.push('/inventory');
    };

    return (
        <>
            <div className="z-50"><Toaster /></div>
            <div className="p-6 bg-white min-h-screen">
                <h1 className="text-2xl font-bold text-black mb-6">Add inventory</h1>
                
                <div className="max-w-2xl">
                    <div className="mb-6">
                        <label className="block text-sm text-gray-700 mb-2 ">
                            Item name <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 border-slate-400 text-black"
                            placeholder="Enter item name"
                        />
                    </div>

                    <div className="mb-6">
                        <div className="flex gap-4 mb-2">
                            <div className="flex-1">
                                <label className="block text-sm text-gray-700">
                                    Variations
                                </label>
                            </div>
                            <div className="w-40">
                                <label className="block text-sm text-gray-700">
                                    Inventory
                                </label>
                            </div>
                            <div className="w-40">
                                <label className="block text-sm text-gray-700">
                                    Price ($) SGD
                                </label>
                            </div>
                            <div className="w-[104px]"></div>
                        </div>

                        {variants.map((variant, index) => (
                            <div key={index} className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <input 
                                        type="text"
                                        value={variant.name}
                                        onChange={(e) => {
                                            const newVariants = [...variants];
                                            newVariants[index].name = e.target.value;
                                            setVariants(newVariants);
                                        }}
                                        className="w-full p-2 border rounded-md border-slate-400 text-black"
                                        placeholder="Variation name"
                                    />
                                </div>
                                
                                <div className="w-40">
                                    <div className="flex border rounded-md border-slate-400">
                                        <button 
                                            className="px-3 py-2 border-r border-slate-400"
                                            onClick={() => {
                                                const newVariants = [...variants];
                                                newVariants[index].inventory = Math.max(0, variant.inventory - 1);
                                                setVariants(newVariants);
                                            }}
                                        >
                                            -
                                        </button>
                                        <input 
                                            type="number"
                                            value={variant.inventory}
                                            onChange={(e) => {
                                                const newVariants = [...variants];
                                                newVariants[index].inventory = Math.max(0, parseInt(e.target.value) || 0);
                                                setVariants(newVariants);
                                            }}
                                            className="w-full p-2 text-center text-black"
                                            placeholder="0"
                                        />
                                        <button 
                                            className="px-3 py-2 border-l border-slate-400"
                                            onClick={() => {
                                                const newVariants = [...variants];
                                                newVariants[index].inventory = variant.inventory + 1;
                                                setVariants(newVariants);
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="w-40">
                                    <div className="flex border rounded-md border-slate-400">
                                        <button 
                                            className="px-3 py-2 border-r border-slate-400"
                                            onClick={() => {
                                                const newVariants = [...variants];
                                                newVariants[index].price = Math.max(0, variant.price - 1);
                                                setVariants(newVariants);
                                            }}
                                        >
                                            -
                                        </button>
                                        <input 
                                            type="number"
                                            value={variant.price}
                                            onChange={(e) => {
                                                const newVariants = [...variants];
                                                newVariants[index].price = Math.max(0, parseFloat(e.target.value) || 0);
                                                setVariants(newVariants);
                                            }}
                                            className="w-full p-2 text-center text-black"
                                            placeholder="0"
                                        />
                                        <button 
                                            className="px-3 py-2 border-l border-slate-400"
                                            onClick={() => {
                                                const newVariants = [...variants];
                                                newVariants[index].price = variant.price + 1;
                                                setVariants(newVariants);
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleAddVariant}
                                    className="text-black text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 border-slate-400"
                                >
                                    Add variant
                                </button>
                            </div>
                        ))}
                        
                        
                    </div>
                    <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-300"></hr>
                    <div className="flex justify-end gap-4">
                        <button 
                            onClick={handleCancel}
                            className="px-4 py-2 border border-black rounded-md hover:bg-gray-50 text-black"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                        >
                            Add item
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
} 