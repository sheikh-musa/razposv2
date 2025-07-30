"use client"

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useApi } from "@/app/context/ApiContext";
import { ItemAttributeValue, StockEntryItem } from "@/app/context/types/ERPNext";
import { StockEntryPayload } from "@/app/context/types/ERPNext";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { ItemTemplate } from "@/app/context/types/ERPNext";

export default function AddExistingInventory() {
    const router = useRouter();
    const { getItemAttribute, updateItemAttribute, createItemVariant, createItemPrice, createStockEntry, getCompanyName, fetchItems, fetchItemDetails } = useApi();
    const [templates, setTemplates] = useState<ItemTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [existingVariants, setExistingVariants] = useState<Array<{name: string, item_code: string, item_name: string}>>([]);
    const [variants, setVariants] = useState([{ name: '', inventory: 0, price: 0 }]);
    const [loading, setLoading] = useState(false);
    const [fetchingTemplates, setFetchingTemplates] = useState(true);
    const [itemAttributeValues, setItemAttributeValues] = useState<ItemAttributeValue[]>([]);
    const stockItems: StockEntryItem[] = [];
    const capitalizeFirstLetter = (string: string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const fetchTemplates = async () => {
        try {
            setFetchingTemplates(true);
            const items = await fetchItems(false, true);
            console.log('Templates fetched:', items);

            if (items && Array.isArray(items)) {
                setTemplates(items);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error('Failed to fetch templates');
        } finally {
            setFetchingTemplates(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTemplateChange = async (templateCode: string) => {
        setSelectedTemplate(templateCode);
        
        if (templateCode) {
            try {
                // Fetch variants for the selected template
                const templateVariants = await fetchItemDetails(templateCode, true);

                const attributeResponse = await getItemAttribute(templateCode);
                //@ts-expect-error - attributeResponse is an array of ItemAttributeValue
                const attributeValues = attributeResponse.map((item: ItemAttributeValue) => ({
                    attribute_value: item.attribute_value,
                    abbr: item.abbr
                }));
                
                setItemAttributeValues(attributeValues);
                console.log('Item attribute values:', attributeValues);
                
                if (templateVariants && Array.isArray(templateVariants)) {
                    setExistingVariants(templateVariants);
                } else {
                    setExistingVariants([]);
                }
            } catch (error) {
                console.error('Error fetching template variants:', error);
                setExistingVariants([]);
                setItemAttributeValues([]);
            }
        } else {
            setExistingVariants([]);
            setItemAttributeValues([]);
        }
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
        if (!selectedTemplate) {
            toast.error('Please select a template');
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

            // Get the selected template details
            const template = templates.find(t => t.item_name === selectedTemplate);
            if (!template) {
                throw new Error('Selected template not found');
            }

            // * -----------------------  1. Update Item Attribute with new variants  ----------------------- */  
            // Filter out empty variant names and create new attribute values
            const newVariants = variants
                .filter(variant => variant.name.trim() !== '')
                .map(variant => ({
                    attribute_value: variant.name,
                    abbr: variant.name
                }));

            console.log('New variants:', newVariants);
            console.log('Existing item attribute values:', itemAttributeValues);
            
            // Combine existing attribute values with new ones
            const updateAttributeValues = {"item_attribute_values": [...itemAttributeValues, ...newVariants]};
            
            console.log('Updated item attribute values:', updateAttributeValues);
            
            const itemAttributeResponse = await updateItemAttribute(selectedTemplate, updateAttributeValues);
            if (!itemAttributeResponse.ok) {
                throw new Error('Failed to update item attribute');
            }

            // * -----------------------  2. Create Variants ---------------------- */  
            const validVariants = variants.filter(variant => variant.name.trim() !== '');
            await Promise.all(
                validVariants.map(async variant => {
                    const variantPayload = {
                        variant_of: selectedTemplate,
                        item_code: selectedTemplate + " - " + variant.name,
                        item_name: variant.name,
                        item_group: "Consumable",
                        stock_uom: "Nos",
                        opening_qty: variant.inventory,
                        attributes: [
                            {
                                attribute: `${template.name} - variant`,
                                attribute_value: variant.name
                            }
                        ]
                    };
                    const itemPricePayload = {
                        item_code: selectedTemplate + " - " + variant.name,
                        item_name: variant.name,
                        stock_uom: "Nos",
                        price_list: "Standard Selling",
                        selling: 1,
                        currency: "SGD",
                        price_list_rate: variant.price
                    }
                    
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
                        item_code: selectedTemplate + " - " + variant.name,
                        qty: variant.inventory,
                        t_warehouse: `Stores - ${companyNameString}`,
                        uom: "Nos"
                    })
                    
                })
            );

            // * -----------------------  3. Create Stock Entry ---------------------- */
            const stockEntryPayload: StockEntryPayload = {
                stock_entry_type: "Material Receipt",
                items: stockItems,
                docstatus: 1
            }

            const stockEntryResponse = await createStockEntry(stockEntryPayload);
            if (!stockEntryResponse.ok) {
                throw new Error(`Failed to create stock entry for variants`);
            }

            toast.success('Variants added to template successfully');
            router.push('/inventory');

        } catch (error) {
            console.error('Error adding variants to template:', error);
            toast.error('Failed to add variants to template');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="z-50"><Toaster /></div>
            <div className="p-6 bg-white min-h-screen">

                <div className="max-w-2xl">
                    <div className="mb-6">
                        <label className="block text-sm text-gray-700 mb-2 ">
                            Please select the template you want to add variants to <span className="text-red-500">*</span>
                        </label>
                        {fetchingTemplates ? (
                            <div className="w-full p-2 border rounded-md border-slate-400 text-gray-500">
                                Loading templates...
                            </div>
                        ) : (
                            <select
                                value={selectedTemplate}
                                onChange={(e) => handleTemplateChange(e.target.value)}
                                className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 border-slate-400 text-black"
                            >
                                <option value="">Select a template</option>
                                {templates.map((template, index) => (
                                    <option key={index} value={template.item_name}>
                                        {template.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Show existing variants if template is selected */}
                    {selectedTemplate && existingVariants.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm text-gray-700 mb-2">
                                Existing variants for this template:
                            </label>
                            <div className="bg-gray-50 p-3 rounded-md">
                                <h1 className="text-sm text-gray-600 mb-1">
                                    {existingVariants.length} variant(s) found for <span className="font-bold text-black">{selectedTemplate}</span>
                                </h1>
                                {existingVariants.map((variant, index) => (
                                    <div key={index} className="text-sm text-gray-600 mb-1">
                                        • {variant.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm text-gray-700 mb-2">
                            Add new variants:
                        </label>
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
                            disabled={loading || !selectedTemplate}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Adding...' : 'Add variants'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
} 