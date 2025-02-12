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
    fetchItems: () => Promise<ItemBasic[]>;
    fetchItemDetails: (itemName: string) => Promise<ItemDetailed>;
    disableItem: (itemName: string) => Promise<Response>;
    fetchDisabledItems: () => Promise<ItemBasic[]>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
    const fetchItems = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/resource/Item?filters=[["has_variants","=",0],["disabled","=",0]]', {
                headers: {
                    'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }

            const data = await response.json();
            
            if (data && Array.isArray(data.data)) {
                return data.data.map((item: any) => ({
                    name: item.name,
                    item_name: item.item_name || item.name,
                }));
            }
            
            throw new Error('Unexpected data structure from API');
        } catch (error) {
            console.error('Error fetching items:', error);
            throw error;
        }
    };

    const fetchItemDetails = async (itemName: string) => {
        try {
            // Fetch item details
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
            
            // Combine the stock information with item details
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
    const fetchDisabledItems = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/resource/Item?filters=[["disabled","=",1]]`, {
                headers: {
                    'Authorization': 'token cd5d3c21aa5851e:7481d281f6f0090'
            },
            method: 'GET'
        });
        const data = await response.json();
        return data.data.map((item: any) => ({
            name: item.name,
                item_name: item.item_name || item.name,
            }));
        } catch (error) {
            console.error('Error fetching disabled items:', error);
            throw error;
        }
    };

    return (
        <ApiContext.Provider value={{ 
            fetchItems, 
            fetchItemDetails,
            disableItem,
            fetchDisabledItems
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