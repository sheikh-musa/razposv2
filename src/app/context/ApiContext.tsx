"use client"
import { createContext, useContext, ReactNode } from 'react';
import { ItemDetailed, ItemTemplate, ItemAttributePayload, ItemTemplatePayload, ItemVariantPayload, ItemPricePayload, ItemPrice, StockReconciliationPayload, StockEntryPayload, SalesOrderPayload, SalesOrders, SalesInvoicePayload, PaymentEntryPayload, SalesOrderUpdatePayload, RevenueEntry, PaymentUpdatePayload, SalesInvoice } from './types/ERPNext';
import { mockRevenueData } from './MockData';

interface ApiContextType {
    fetchItems: (includeDeleted?: boolean, templatesOnly?: boolean) => Promise<ItemTemplate[]>;
    fetchItemDetails: (itemName: string, fetchVariants?: boolean) => Promise<ItemDetailed[]>;
    disableItem: (itemName: string) => Promise<Response>;
    undoDisableItem: (itemName: string) => Promise<Response>;
    createItemAttribute: (payload: ItemAttributePayload) => Promise<Response>;
    createItemTemplate: (payload: ItemTemplatePayload) => Promise<Response>;
    createItemVariant: (payload: ItemVariantPayload) => Promise<Response>;
    createItemPrice: (payload: ItemPricePayload) => Promise<Response>;
    fetchItemPrice: (itemName: string) => Promise<ItemPrice[]>;
    createStockEntry: (payload: StockEntryPayload) => Promise<Response>;
    fetchStockEntry: (itemName: string) => Promise<Response>;
    stockReconciliation: (payload: StockReconciliationPayload) => Promise<Response>;
    createKitchenOrder: (payload: SalesOrderPayload) => Promise<Response>;
    fetchKitchenOrderNames: () => Promise<SalesOrders[]>;
    fetchKitchenOrderDetails: (orderId: string) => Promise<SalesOrders[]>;
    updateKitchenOrder: (orderName: string, payload: SalesOrderUpdatePayload) => Promise<Response>;
    createSalesInvoice: (payload: SalesInvoicePayload) => Promise<Response>;
    createPaymentEntry: (payload: PaymentEntryPayload) => Promise<Response>;
    getRevenue: () => Promise<RevenueEntry[]>;
    updateKitchenOrderPayment: (orderName: string, payload: PaymentUpdatePayload) => Promise<Response>;
    getRevenueByPaymentMode: (paymentMode: string) => Promise<RevenueEntry[]>;
    getAllPaidSalesInvoice: () => Promise<SalesInvoice[]>;
    getSalesInvoiceByName: (invoiceName: string) => Promise<Response>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
    const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';

    //* -------------------------------------------------------------------------- */
    //*                          API calls for fetching Items                      */
    //* -------------------------------------------------------------------------- */

    const fetchItems = async (includeDeleted: boolean = false, templatesOnly: boolean = false) => {
        try {
            const filters = templatesOnly 
                ? '[["has_variants","=",1]]&fields=["name","item_name"]'
                : includeDeleted 
                    ? '[["has_variants","=",0],["is_purchase_item","=",1],["disabled","=",1]]'
                : '[["has_variants","=",0],["is_purchase_item","=",1],["disabled","=",0]]';
                
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item?limit_page_length=1000&filters=${filters}`,
                {
                    credentials: 'include',
                    headers: {
                        'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
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
                    `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item?limit_page_length=1000&filters=[["variant_of","=","${itemName}"],["is_purchase_item","=",1]]`,
                    {
                        credentials: 'include',
                        headers: {
                            'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
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
                            `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item/${variant.name}`,
                            {
                                credentials: 'include',
                                headers: {
                                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        if (!itemResponse.ok) {
                            throw new Error(`Failed to fetch details for variant ${variant.name}`);
                        }

                        const itemData = await itemResponse.json();

                        // Fetch stock information
                        const stockResponse = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Bin?filters=[["item_code","=","${variant.name}"]]&fields=["item_code","actual_qty","warehouse","valuation_rate"]`,
                            {
                                credentials: 'include',
                                headers: {
                                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
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
            const itemResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item/${itemName}`, {
                credentials: 'include',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!itemResponse.ok) {
                throw new Error('Failed to fetch item details');
            }

            const itemData = await itemResponse.json();
            
            // Fetch stock information
            const stockResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Bin?filters=[["item_code","=","${itemName}"]]&fields=["item_code","actual_qty","warehouse","valuation_rate"]`, 
                {
                    credentials: 'include',
                    headers: {
                        'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item/${itemName}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Accept': 'application/json',
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item/${itemName}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Accept': 'application/json',
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

    //* -------------------------------------------------------------------------- */
    //*                          API calls for creating Items                      */
    //* -------------------------------------------------------------------------- */

    const createItemAttribute = async (payload: ItemAttributePayload) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item Attribute`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Accept': 'application/json',
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Accept': 'application/json',
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
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

    //* -------------------------------------------------------------------------- */
    //*                             API calls for Item Price                       */
    //* -------------------------------------------------------------------------- */

    const createItemPrice = async (payload: ItemPricePayload) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item Price`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
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
    const fetchItemPrice = async (itemName: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item Price?filters=[["item_code","=","${itemName}"]]&fields=["item_name","price_list_rate","selling"]`, {
            credentials: 'include',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch item price');
        }
        const data = await response.json();
        return data.data;
    }

    //* -------------------------------------------------------------------------- */
    //*                             API calls for Stock                            */
    //* -------------------------------------------------------------------------- */
    const createStockEntry = async (payload: StockEntryPayload) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Stock Entry`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('Failed to create stock entry');
        }
        return response;
    }

    const fetchStockEntry = async (itemName: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Bin?filters=[["item_code","=","${itemName}"]]&fields=["*"]`, {
            credentials: 'include',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch stock entry');
        }
        const data = await response.json();
        return data.data;
    }
   
    const stockReconciliation = async (payload: StockReconciliationPayload) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Stock Reconciliation`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('Failed to reconcile stock');
        }
        return response;
    }

    //* -------------------------------------------------------------------------- */
    //*                             API calls for Kitchen                          */
    //* -------------------------------------------------------------------------- */

    const fetchKitchenOrderNames = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order?limit_page_length=1000`, {
            credentials: 'include',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch kitchen orders');
        }
        const data = await response.json();
        return data.data;
    }

    const fetchKitchenOrderDetails = async (orderId: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order/${orderId}`, {
            credentials: 'include',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch kitchen order details');
        }
        const data = await response.json();
        return data.data;
    }

    const createKitchenOrder = async (payload: SalesOrderPayload) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('Failed to create kitchen order');
        }
        return response;
    }

    const updateKitchenOrder = async (orderName: string, payload: SalesOrderUpdatePayload) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order/${orderName}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        return response;
    }

    const updateKitchenOrderPayment = async (orderName: string, payload: PaymentUpdatePayload) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order/${orderName}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        return response;
    }

    //* -------------------------------------------------------------------------- */
    //*                             API calls for Payment                          */
    //* -------------------------------------------------------------------------- */

    const getAllPaidSalesInvoice = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Invoice?filters=[["status", "=", "Paid"]]&fields=["name", "posting_date"]&limit_page_length=1000`, {
            credentials: 'include',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch sales invoice');
        }
        const data = await response.json();
        return data.data;
    }

    const getSalesInvoiceByName = async (invoiceName: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Invoice/${invoiceName}`, {
            credentials: 'include',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch sales invoice');
        }
        const data = await response.json();
        return data.data;
    }

    const createSalesInvoice = async (payload: SalesInvoicePayload) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Invoice`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create sales invoice');
            }
    
            return response;
        } catch (error) {
            console.error('Error creating sales invoice:', error);
            throw error;
        }
    }

    const createPaymentEntry = async (payload: PaymentEntryPayload) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Payment Entry`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('Failed to create payment entry');
        }
        return response;
    }
    //* -------------------------------------------------------------------------- */
    //*                             Get revenue from Payment Entry                 */
    //* -------------------------------------------------------------------------- */

    const getRevenue = async () => {
        try {
            if (isStaging) {
                return mockRevenueData;
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Payment Entry?limit_page_length=1000&fields=["paid_amount", "posting_date"]`, {
                credentials: 'include',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
        if (!response.ok) {
            throw new Error('Failed to fetch revenue');
        }
        const data = await response.json();
        return data.data;
        } catch (error) {
            console.error('Error fetching revenue:', error);
            throw error;
        }
    }
    
    const getRevenueByPaymentMode = async (paymentMode: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Payment Entry?limit_page_length=1000&fields=["paid_amount", "posting_date", "mode_of_payment"]&filters=[["mode_of_payment","=","${paymentMode}"]]`, {
            credentials: 'include',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch revenue by payment mode');
        }
        const data = await response.json();
        return data.data;
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
            createItemPrice,
            fetchItemPrice,
            createStockEntry,
            fetchStockEntry,
            stockReconciliation,
            createKitchenOrder,
            fetchKitchenOrderNames,
            fetchKitchenOrderDetails,
            updateKitchenOrder,
            createSalesInvoice,
            createPaymentEntry,
            getRevenue,
            updateKitchenOrderPayment,
            getRevenueByPaymentMode,
            getAllPaidSalesInvoice,
            getSalesInvoiceByName
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