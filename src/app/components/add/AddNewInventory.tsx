"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApi } from "@/app/context/ApiContext";
import { ItemCategory, StockEntryItem } from "@/app/context/types/ERPNext";
import { StockEntryPayload } from "@/app/context/types/ERPNext";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import NewCategoryModal from "./NewCategoryModal";
// import { Select } from "@/components/base/select/select";


export default function AddNewInventoryTemplate() {
    const router = useRouter();
    const { createItemAttribute, createItemTemplate, createItemVariant, createItemPrice, createStockEntry, getCompanyName, getItemCategories } = useApi();
    const [itemName, setItemName] = useState('');
    const [variants, setVariants] = useState([{ name: '', inventory: 0, price: 0 }]);
    const [loading, setLoading] = useState(false);
    const stockItems: StockEntryItem[] = [];
    const [itemCategory, setItemCategory] = useState('');
    const [itemCategories, setItemCategories] = useState<ItemCategory[]>([]);
    const [newCategoryModal, setNewCategoryModal] = useState(false);
    const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
    };

    useEffect(() => {
        fetchItemCategories();
        console.log('itemCategory :', itemCategory);
        if (itemCategory === "Add new category...") {
            setNewCategoryModal(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemCategory]);

    const fetchItemCategories = async () => {
        const categories = await getItemCategories();
        setItemCategories(categories);
    };

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

    const handleRemoveVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleCancel = () => {
        router.back();
    };

    const handleSubmit = async () => {
    // Validation checks
    if (!itemName.trim()) {
        toast.error('Please enter an item name');
        return;
    }

    if (!itemCategory.trim()) {
        toast.error('Please select an item category');
        return;
    }

    const hasVariantName = variants.some(variant => variant.name.trim() !== '');
    if (!hasVariantName) {
        toast.error('Please add at least one variant name');
        return;
    }

    try {
        setLoading(true);
        const companyName = await getCompanyName();
        // @ts-expect-error - companyName is a string
        const companyNameString = companyName.charAt(0);

        // * -----------------------  1. Create Item Attribute ---------------------- */
        const attributePayload = {
            attribute_name: `${itemName} - variant`,
            numeric_values: 0,
            item_attribute_values: variants
                .filter(variant => variant.name.trim() !== '')
                .map(variant => ({
                    attribute_value: variant.name,
                    abbr: variant.name
                }))
        };
        
        const attributeResponse = await createItemAttribute(attributePayload);
        if (!attributeResponse.ok) {
            throw new Error('Failed to create item attribute');
        }

        // * -----------------------  2. Create Item Template ---------------------- */
        const templatePayload = {
            item_code: itemName,
            item_name: itemName,
            item_group: "Consumable",
            has_variants: 1,
            variant_based_on: "Item Attribute",
            attributes: [
                {
                    attribute: `${itemName} - variant`
                }
            ]
        };

        const templateResponse = await createItemTemplate(templatePayload);
        if (!templateResponse.ok) {
            throw new Error('Failed to create item template');
        }

        // * -----------------------  3. Create Variants ---------------------- */  
        const validVariants = variants.filter(variant => variant.name.trim() !== '');
        await Promise.all(
            validVariants.map(async variant => {
                const variantPayload = {
                    variant_of: itemName,
                    item_code: itemName + " - " + variant.name,
                    item_name: variant.name,
                    item_group: "Consumable",
                    stock_uom: "Nos",
                    opening_qty: variant.inventory,
                    attributes: [
                        {
                            attribute: `${itemName} - variant`,
                            attribute_value: variant.name
                        }
                    ]
                };
                const itemPricePayload = {
                    item_code: itemName + " - " + variant.name,
                    item_name: variant.name,
                    stock_uom: "Nos",
                    price_list: "Standard Selling",
                    selling: 1,
                    currency: "SGD",
                    price_list_rate: variant.price
                }
                // console.log('variantPayload :', variantPayload)
                const variantResponse = await createItemVariant(variantPayload);
                if (!variantResponse.ok) {
                    throw new Error(`Failed to create variant: ${variant.name}`);
                }
                
                const itemPriceResponse = await createItemPrice(itemPricePayload);
                if (!itemPriceResponse.ok) {
                    throw new Error(`Failed to create item price: ${variant.name}`);
                }

                
                // Collect all variant items first
                stockItems.push({
                    item_code: itemName + " - " + variant.name,
                    qty: variant.inventory,
                    t_warehouse: `Stores - ${companyNameString}`,
                    uom: "Nos"
                })
                
            })
        );
        // * -----------------------  4. Create Stock Entry ---------------------- */
        const stockEntryPayload: StockEntryPayload = {
            stock_entry_type: "Material Receipt",
            items: stockItems,
            docstatus: 1
        }

        const stockEntryResponse = await createStockEntry(stockEntryPayload);
        if (!stockEntryResponse.ok) {
            throw new Error(`Failed to create stock entry for variants`);
        }

        toast.success('Item and variants created successfully');
        router.push('/inventory');

    } catch (error) {
        console.error('Error creating item:', error);
        toast.error('Failed to create item and variants');
    } finally {
        setLoading(false);
    }
};

return (
    <>
        <div className="z-50"><Toaster /></div>
        <div className="p-6 bg-white min-h-screen">
            {newCategoryModal && 
            <NewCategoryModal isOpen={newCategoryModal} onClose={() => setNewCategoryModal(false)} onCreate={(categoryName) => {
                setItemCategory(categoryName);
                setNewCategoryModal(false);
            }} />}
            <div className="max-w-2xl text-sm">
                <div className="mb-6">
                    <label className="block text-sm text-gray-700 mb-2 ">
                        Item name <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(capitalizeFirstLetter(e.target.value))}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 border-slate-400 text-black"
                        placeholder="Enter item name"
                    />
                </div>
                <div className="mb-6 text-sm">
                    <label className="block text-sm text-gray-700 mb-2 ">
                        Item category <span className="text-red-500">*</span>
                    </label>
                    <select

                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value)}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 border-slate-400 text-black"
                    >
                        {[...itemCategories,{"name": "Add new category..."} ].map((category) => (
                            <option key={category.name} value={category.name}>{category.name}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-6">   
                    <div className="space-y-4 mt-4 text-black">
                        {variants.map((variant, index) => (
                            <div key={index} className="flex gap-4 items-start">
                                <div className="flex-1">
                                <label className="block text-sm text-gray-700">
                                Variations
                            </label>
                                    <input
                                        type="text"
                                        value={variant.name}
                                        onChange={(e) => {
                                            const newVariants = [...variants];
                                            newVariants[index].name = capitalizeFirstLetter(e.target.value);
                                            setVariants(newVariants);
                                        }}
                                        placeholder="Variant name"
                                        className="w-full p-2 border rounded-md text-sm"
                                    />
                                </div>
                                <div className="w-32">

                            <label className="block text-sm text-gray-700">
                                Inventory
                            </label>

                                    <input
                                        type="number"
                                        value={variant.inventory}
                                        onChange={(e) => {
                                            const newVariants = [...variants];
                                            newVariants[index].inventory = Math.max(0, parseInt(e.target.value) || 0);
                                            setVariants(newVariants);
                                        }}
                                        placeholder="Stock"
                                        className="w-full p-2 border rounded-md text-sm"
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-sm text-gray-700">
                                    Price ($) SGD
                                    </label>
                                    <input
                                        type="number"
                                        value={variant.price}
                                        onChange={(e) => {
                                            const newVariants = [...variants];
                                            newVariants[index].price = Math.max(0, parseFloat(e.target.value) || 0);
                                            setVariants(newVariants);
                                        }}
                                        placeholder="Price"
                                        className="w-full p-2 border rounded-md text-sm"
                                    />
                                </div>
                                <div className='mt-5'>
                                {index === variants.length - 1 ? (
                                    <button 
                                        onClick={handleAddVariant}
                                        className="text-black text-sm px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 border-slate-400 flex items-center gap-2"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add variant
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleRemoveVariant(index)}
                                        className="text-red-600 text-sm px-3 py-2 border border-red-200 rounded-md hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Remove variant
                                    </button>
                                )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-300"></hr>
                <div className="flex justify-end gap-4">
                    <button 
                        onClick={handleCancel}
                        className="px-4 py-2 border border-black rounded-md hover:bg-gray-50 text-black text-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                    >
                        {loading ? 'Adding...' : 'Add item'}
                    </button>
                </div>
            </div>
        </div>
    </>
);
} 