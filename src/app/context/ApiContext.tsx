"use client"
import { createContext, useContext, ReactNode } from 'react';

type ItemBasic = {
    name: string;
    item_name: string;
};

type ItemDetailed = {
    name: string;
    item_name: string;
    item_code: string;
    description: string;
    stock_uom: string;
    valuation_rate: number;
    item_group: string;
    opening_stock: number;
    actual_qty: number;
    warehouse: string;
};

interface ApiContextType {
    fetchItems: (includeDeleted?: boolean, templatesOnly?: boolean) => Promise<ItemBasic[]>;
    fetchItemDetails: (itemName: string, fetchVariants?: boolean) => Promise<ItemDetailed>;
    disableItem: (itemName: string) => Promise<Response>;
    undoDisableItem: (itemName: string) => Promise<Response>;
    createItemAttribute: (payload: any) => Promise<Response>;
    createItemTemplate: (payload: any) => Promise<Response>;
    createItemVariant: (payload: any) => Promise<Response>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
    const fetchItems = async (includeDeleted: boolean = false, templatesOnly: boolean = false) => {
        try {
            const filters = templatesOnly 
                ? '[["has_variants","=",1]]'
                : includeDeleted 
                    ? '[["has_variants","=",0],["is_purchase_item","=",1],["disabled","=",1]]'
                : '[["has_variants","=",0],["is_purchase_item","=",1],["disabled","=",0]]';
                
            const response = await fetch(
                `http://localhost:8080/api/resource/Item?filters=${filters}`,
                {
                    headers: {
                        'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090'
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

    const fetchItemDetails = async (itemName: string, fetchVariants: boolean = false) => {
        try {
            if (fetchVariants) {
                // 1. First fetch basic variant information
                const variantsResponse = await fetch(
                    `http://localhost:8080/api/resource/Item?filters=[["variant_of","=","${itemName}"],["is_purchase_item","=",1]]`,
                    {
                        headers: {
                            'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090'
                        }
                    }
                );
                if (!variantsResponse.ok) {
                    throw new Error('Failed to fetch variants');
                }
                const variantsData = await variantsResponse.json();
                console.log('variantsData :', variantsData)
                // 2. For each variant, fetch its complete details and stock information
                const variantsWithDetails = await Promise.all(
                    variantsData.data.map(async (variant: any) => {
                        // Fetch detailed item information
                        const itemResponse = await fetch(
                            `http://localhost:8080/api/resource/Item/${variant.name}`,
                            {
                                headers: {
                                    'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090'
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
                                    'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090'
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
                    'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090'
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
                        'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090'
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

            return {
                ...itemData.data,
                actual_qty: stockInfo.actual_qty,
                valuation_rate: stockInfo.valuation_rate,
                warehouse: stockInfo.warehouse
            };

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
                    'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090',
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
                    'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090',
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

    const createItemAttribute = async (payload: any) => {
        try {
            const response = await fetch('http://localhost:8080/api/resource/Item Attribute', {
                method: 'POST',
                headers: {
                    'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090',
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

    const createItemTemplate = async (payload: any) => {
        try {
            const response = await fetch('http://localhost:8080/api/resource/Item', {
                method: 'POST',
                headers: {
                    'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090',
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

    const createItemVariant = async (payload: any) => {
        try {
            const response = await fetch('http://localhost:8080/api/resource/Item', {
                method: 'POST',
                headers: {
                    'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090',
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

    return (
        <ApiContext.Provider value={{ 
            fetchItems, 
            fetchItemDetails,
            disableItem,
            undoDisableItem,
            createItemAttribute,
            createItemTemplate,
            createItemVariant
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