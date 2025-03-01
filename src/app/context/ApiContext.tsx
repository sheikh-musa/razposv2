"use client"
import { createContext, useContext, ReactNode } from 'react';
import { ItemDetailed, ItemTemplate, ItemAttributePayload, ItemTemplatePayload, ItemVariantPayload, ItemPricePayload, ItemBasic } from './types/ERPNext';

interface ApiContextType {
    fetchItems: (includeDeleted?: boolean, templatesOnly?: boolean) => Promise<ItemTemplate[]>;
    fetchItemDetails: (itemName: string, fetchVariants?: boolean) => Promise<ItemDetailed[]>;
    disableItem: (itemName: string) => Promise<Response>;
    undoDisableItem: (itemName: string) => Promise<Response>;
    createItemAttribute: (payload: ItemAttributePayload) => Promise<Response>;
    createItemTemplate: (payload: ItemTemplatePayload) => Promise<Response>;
    createItemVariant: (payload: ItemVariantPayload) => Promise<Response>;
    createItemPrice: (payload: ItemPricePayload) => Promise<Response>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
    const fetchItems = async (includeDeleted: boolean = false, templatesOnly: boolean = false) => {
        try {
            const filters = templatesOnly 
                ? '[["has_variants","=",1]]&fields=["name","item_name"]'
                : includeDeleted 
                    ? '[["has_variants","=",0],["is_purchase_item","=",1],["disabled","=",1]]'
                : '[["has_variants","=",0],["is_purchase_item","=",1],["disabled","=",0]]';
                
            const response = await fetch(
                `http://localhost:8080/api/resource/Item?filters=${filters}`,
                {
                    headers: {
                        'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`
                    }
                } 
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching items:', error);
            throw error;
        }
    };

    const fetchItemDetails = async (itemName: string, fetchVariants: boolean = false): Promise<ItemDetailed[]> => {
        try {
            if (fetchVariants) {
                // 1. First fetch basic variant information
                const variantsResponse = await fetch(
                    `http://localhost:8080/api/resource/Item?filters=[["variant_of","=","${itemName}"],["is_purchase_item","=",1]]`,
                    {
                        headers: {
                            'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`
                        }
                    }
                );

                if (!variantsResponse.ok) {
                    throw new Error('Failed to fetch variants');
                }
                const variantsData = await variantsResponse.json();
                // console.log('variantsData :', variantsData)
                // 2. For each variant, fetch its complete details and stock information
                const variantsWithDetails = await Promise.all(
                    variantsData.data.map(async (variant: ItemTemplate) => {
                        // Fetch detailed item information
                        const itemResponse = await fetch(
                            `http://localhost:8080/api/resource/Item/${variant.name}`,
                            {
                                headers: {
                                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`
                                }
                            }
                        );

                        if (!itemResponse.ok) {
                            throw new Error(`Failed to fetch details for variant ${variant.name}`);
                        }

                        const itemData = await itemResponse.json();

                        // Fetch stock information
                        const stockResponse = await fetch(
                            `http://localhost:8080/api/resource/Bin?filters=[["item_code","=","${variant.name}"]]&fields=["item_code","actual_qty","warehouse","valuation_rate"]`,
                            {
                                headers: {
                                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`
                                }
                            }
                        );

                        if (!stockResponse.ok) {
                            throw new Error(`Failed to fetch stock for variant ${variant.name}`);
                        }

                        const stockData = await stockResponse.json();
                        const stockInfo = stockData.data[0] || {
                            actual_qty: 0,
                            valuation_rate: 0,
                            warehouse: 'N/A'
                        };

                        // Combine item and stock information
                        return {
                            ...itemData.data,
                            actual_qty: stockInfo.actual_qty,
                            valuation_rate: stockInfo.valuation_rate,
                            warehouse: stockInfo.warehouse
                        };
                    })
                );

                return variantsWithDetails;
            }

            // For single item details (non-variant case)
            const itemResponse = await fetch(`http://localhost:8080/api/resource/Item/${itemName}`, {
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`
                }
            });
            
            if (!itemResponse.ok) {
                throw new Error('Failed to fetch item details');
            }

            const itemData = await itemResponse.json();
            
            // Fetch stock information
            const stockResponse = await fetch(
                `http://localhost:8080/api/resource/Bin?filters=[["item_code","=","${itemName}"]]&fields=["item_code","actual_qty","warehouse","valuation_rate"]`, 
                {
                    headers: {
                        'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`
                    }
                }
            );

            if (!stockResponse.ok) {
                throw new Error('Failed to fetch stock information');
            }

            const stockData = await stockResponse.json();
            
            const stockInfo = stockData.data[0] || { 
                actual_qty: 0, 
                valuation_rate: 0,
                warehouse: 'N/A'
            };

            return [
                {
                    ...itemData.data,
                    actual_qty: stockInfo.actual_qty,
                    valuation_rate: stockInfo.valuation_rate,
                    warehouse: stockInfo.warehouse
                }
            ];

        } catch (error) {
            console.error('Error fetching item details:', error);
            throw error;
        }
    };

    const disableItem = async (itemName: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/resource/Item/${itemName}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    disabled: 1
                })
            });

            if (!response.ok) {
                throw new Error('Failed to disable item');
            }

            return response;
        } catch (error) {
            console.error('Error disabling item:', error);
            throw error;
        }
    };
    const undoDisableItem = async (itemName: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/resource/Item/${itemName}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    disabled: 0
                })
            });

            if (!response.ok) {
                throw new Error('Failed to restore item');
            }

            return response;
        } catch (error) {
            console.error('Error restoring item:', error);
            throw error;
        }
    };

    const createItemAttribute = async (payload: ItemAttributePayload) => {
        try {
            const response = await fetch('http://localhost:8080/api/resource/Item Attribute', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to create item attribute');
            }

            return response;
        } catch (error) {
            console.error('Error creating item attribute:', error);
            throw error;
        }
    };

    const createItemTemplate = async (payload: ItemTemplatePayload) => {
        try {
            const response = await fetch('http://localhost:8080/api/resource/Item', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to create item template');
            }

            return response;
        } catch (error) {
            console.error('Error creating item template:', error);
            throw error;
        }
    };

    const createItemVariant = async (payload: ItemVariantPayload) => {
        try {
            const response = await fetch('http://localhost:8080/api/resource/Item', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to create item variant');
            }

            return response;
        } catch (error) {
            console.error('Error creating item variant:', error);
            throw error;
        }
    };

    const createItemPrice = async (payload: ItemPricePayload) => {
        try {
            const response = await fetch('http://localhost:8080/api/resource/Item Price', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to create item price');
            }

            return response;
        } catch (error) {
            console.error('Error creating item price:', error);
            throw error;
        }
    } 

    return (
        <ApiContext.Provider value={{ 
            fetchItems, 
            fetchItemDetails,
            disableItem,
            undoDisableItem,
            createItemAttribute,
            createItemTemplate,
            createItemVariant,
            createItemPrice
        }}>
            {children}
        </ApiContext.Provider>
    );
}

export function useApi() {
    const context = useContext(ApiContext);
    if (context === undefined) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
} 