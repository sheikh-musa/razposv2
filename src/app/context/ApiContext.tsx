"use client"
import { createContext, useContext, ReactNode } from 'react';
import { ItemDetailed,ItemTemplate, ItemAttributePayload, ItemTemplatePayload, ItemVariantPayload, ItemPricePayload, ItemPrice, StockReconciliationPayload, StockEntryPayload, SalesOrderPayload, SalesOrders, SalesInvoicePayload, PaymentEntryPayload, SalesOrderUpdatePayload, RevenueEntry, PaymentUpdatePayload, SalesInvoice, RecentActivity, SalesHistoryOrder, CompletedSalesOrder, ItemAttributeUpdatePayload, EmailPayload, ItemCategory } from './types/ERPNext';
// import { mockRevenueData } from './MockData';

interface ApiContextType {
    fetchItems: (includeDeleted?: boolean, templatesOnly?: boolean) => Promise<ItemTemplate[]>;
    fetchItemDetails: (itemName: string, fetchVariants?: boolean) => Promise<ItemDetailed[]>;
    disableItem: (itemName: string) => Promise<Response>;
    undoDisableItem: (itemName: string) => Promise<Response>;
    getItemAttribute: (itemName: string) => Promise<Response>;
    createItemAttribute: (payload: ItemAttributePayload) => Promise<Response>;
    updateItemAttribute: (itemName: string, payload: ItemAttributeUpdatePayload) => Promise<Response>;
    createItemTemplate: (payload: ItemTemplatePayload) => Promise<Response>;
    createItemVariant: (payload: ItemVariantPayload) => Promise<Response>;
    createItemCategory: (categoryName: string) => Promise<Response>;
    getItemCategories: () => Promise<ItemCategory[]>;
    updateItemCategory: (itemName: string, categoryName: string) => Promise<Response>;
    createItemPrice: (payload: ItemPricePayload) => Promise<Response>;
    fetchItemPrice: (itemName: string) => Promise<ItemPrice[]>;
    createStockEntry: (payload: StockEntryPayload) => Promise<Response>;
    fetchStockEntry: (itemName: string) => Promise<Response>;
    stockReconciliation: (payload: StockReconciliationPayload) => Promise<Response>;
    createKitchenOrder: (payload: SalesOrderPayload) => Promise<Response>;
    fetchKitchenOrderNames: () => Promise<SalesOrders[]>;
    fetchKitchenOrderDetails: (orderId: string) => Promise<SalesOrders[]>;
    updateKitchenOrder: (orderName: string, payload: SalesOrderPayload) => Promise<Response>;
    completeKitchenOrder: (orderName: string, payload: SalesOrderUpdatePayload) => Promise<Response>;
    updateKitchenOrderItem: (SalesOrderItemName: string, customItemDone: number) => Promise<Response>;
    fetchOpenTickets: () => Promise<SalesOrders[]>;
    completeOpenTicket: (orderName: string, discount: number, paymentMethod: string) => Promise<Response>;
    deleteOpenTicket: (orderName: string) => Promise<Response>;
    createSalesInvoice: (payload: SalesInvoicePayload) => Promise<Response>;
    createPaymentEntry: (payload: PaymentEntryPayload) => Promise<Response>;
    getRevenue: () => Promise<RevenueEntry[]>;
    updateKitchenOrderPayment: (orderName: string, payload: PaymentUpdatePayload) => Promise<Response>;
    getRevenueByPaymentMode: (paymentMode: string) => Promise<RevenueEntry[]>;
    getAllPaidSalesInvoice: () => Promise<SalesInvoice[]>;
    getSalesInvoiceByName: (invoiceName: string) => Promise<Response>;
    getActivityLog: () => Promise<RecentActivity[]>;
    getCompletedSalesOrder: () => Promise<CompletedSalesOrder[]>;
    getCompletedSalesOrderItems: (orderName: string) => Promise<SalesHistoryOrder[]>;
    getCompanyName: () => Promise<Response>;
    updateItemPrice: (itemName: string, price: number) => Promise<Response>;
    initializeCustomFields: () => Promise<void>;
    checkGuestCustomerExists: () => Promise<boolean>;
    createGuestCustomer: () => Promise<Response>;
    initializeModeOfPayment: () => Promise<void>;
    sendEmail: (payload: EmailPayload) => Promise<Response>;
    uploadReceipt: (file: File, docname: string) => Promise<Response>;
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
                ? '[["has_variants","=",1]]&fields=["name","item_name","item_group"]'
                : includeDeleted 
                    ? '[["has_variants","=",0],["is_purchase_item","=",1],["disabled","=",1]]'
                : '[["has_variants","=",0],["is_purchase_item","=",1],["disabled","=",0]]';
                
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item?limit_page_length=1000&filters=${filters}`,
                {
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
                const errorData = await response.json();
                console.error('Error details:', errorData);
                throw new Error(`Failed to disable item: ${JSON.stringify(errorData)}`);
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
                const errorData = await response.json();
                console.error('Error details:', errorData);
                throw new Error(`Failed to restore item: ${JSON.stringify(errorData)}`);
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

    const getItemAttribute = async (itemName: string): Promise<Response> => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item Attribute/${itemName} - variant`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to fetch item attribute: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        return data.data.item_attribute_values;
    }

    const createItemAttribute = async (payload: ItemAttributePayload) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item Attribute`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error details:', errorData);
                throw new Error(`Failed to create item attribute: ${JSON.stringify(errorData)}`);
            }

            return response;
        } catch (error) {
            console.error('Error creating item attribute:', error);
            throw error;
        }
    };

    const updateItemAttribute = async (itemName: string, payload: ItemAttributeUpdatePayload) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item Attribute/${itemName} - variant`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to update item attribute: ${JSON.stringify(errorData)}`);
        }
        return response;
    }

    const createItemTemplate = async (payload: ItemTemplatePayload) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error details:', errorData);
                throw new Error(`Failed to create item template: ${JSON.stringify(errorData)}`);
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
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error details:', errorData);
                throw new Error(`Failed to create item variant: ${JSON.stringify(errorData)}`);
            }

            return response;
        } catch (error) {
            console.error('Error creating item variant:', error);
            throw error;
        }
    };

    const createCategoryHead = async() => {
        try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item Group`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "Food",
                item_group_name: "Food",
                parent_item_group: "All Item Groups",
                is_group: 1
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.log('Error details:', errorData);
        }
            return response;
        } catch (error) {
            console.error('Error creating item category:', error);
            throw error;
        }
    }

    const getItemCategories = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item Group?filters=[["parent_item_group", "=", "Food"]]`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error details:', errorData);
                throw new Error(`Failed to fetch item category: ${JSON.stringify(errorData)}`);
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching item category:', error);
            throw error;
        }
        }

    const createItemCategory = async (categoryName: string) => {
        try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item Group`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: categoryName,
                item_group_name: categoryName,
                parent_item_group: "Food",
                is_group: 0
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.log('Error details:', errorData);
            // throw new Error(`Failed to create item category: ${JSON.stringify(errorData)}`);
        }
        return response;
        } catch (error) {
            console.error('Error creating item category:', error);
            throw error;
        }
    }

    const updateItemCategory = async (itemName: string, categoryName: string) => {
        try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item/${itemName}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                item_group: categoryName
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to update item category: ${JSON.stringify(errorData)}`);
        }
        return response;
        } catch (error) {
            console.error('Error updating item category:', error);
            throw error;
        }
    }

    //* -------------------------------------------------------------------------- */
    //*                             API calls for Item Price                       */
    //* -------------------------------------------------------------------------- */

    const createItemPrice = async (payload: ItemPricePayload) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item Price`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error details:', errorData);
                throw new Error(`Failed to create item price: ${JSON.stringify(errorData)}`);
            }

            return response;
        } catch (error) {
            console.error('Error creating item price:', error);
            throw error;
        }
    } 
    const fetchItemPrice = async (itemName: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item Price?filters=[["item_code","=","${itemName}"]]&fields=["name","item_name","price_list_rate","selling"]`, {
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

    const updateItemPrice = async (itemPriceName: string, price: number) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Item Price/${itemPriceName}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                price_list_rate: price
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to update item price: ${JSON.stringify(errorData)}`);
        }
        return response;
    }

    //* -------------------------------------------------------------------------- */
    //*                             API calls for Stock                            */
    //* -------------------------------------------------------------------------- */
    const createStockEntry = async (payload: StockEntryPayload) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Stock Entry`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to create stock entry: ${JSON.stringify(errorData)}`);
        }
        return response;
    }

    const fetchStockEntry = async (itemName: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Bin?filters=[["item_code","=","${itemName}"]]&fields=["*"]`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to fetch stock entry: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        return data.data;
    }
   
    const stockReconciliation = async (payload: StockReconciliationPayload) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Stock Reconciliation`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to reconcile stock: ${JSON.stringify(errorData)}`);
        }
        return response;
    }

    //* -------------------------------------------------------------------------- */
    //*                             API calls for Kitchen                          */
    //* -------------------------------------------------------------------------- */

    const fetchKitchenOrderNames = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order?limit_page_length=1000`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to fetch kitchen orders: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        return data.data;
    }

    const fetchKitchenOrderDetails = async (orderId: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order/${orderId}`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.log('Error details:', errorData);
            console.log(`Failed to fetch kitchen order details: ${JSON.stringify(errorData)}`);
            return null;
        }
        const data = await response.json();
        return data.data;
    }

    const createKitchenOrder = async (payload: SalesOrderPayload) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to create kitchen order: ${JSON.stringify(errorData)}`);
        }
        return response;
    }

    const updateKitchenOrder = async (orderName: string, payload: SalesOrderPayload) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order/${orderName}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to update kitchen order: ${JSON.stringify(errorData)}`);
        }
        return response;
    }

    const completeKitchenOrder = async (orderName: string, payload: SalesOrderUpdatePayload) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order/${orderName}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to update kitchen order: ${JSON.stringify(errorData)}`);
        }
        return response;
    }

    const updateKitchenOrderItem = async (SalesOrderItemName: string, customItemDone: number) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order Item/${SalesOrderItemName}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({custom_item_done: customItemDone})
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to update kitchen order item: ${JSON.stringify(errorData)}`);
        }
        return response;
    }

    const updateKitchenOrderPayment = async (orderName: string, payload: PaymentUpdatePayload) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order/${orderName}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to update kitchen order payment: ${JSON.stringify(errorData)}`);
        }
        return response;
    }
    //* -------------------------------------------------------------------------- */
    //*                             API calls for Open Tickets                     */
    //* -------------------------------------------------------------------------- */

    const fetchOpenTickets = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order?filters=[["docstatus", "=", 0]]`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to fetch open tickets: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        return data.data;
    }

    const completeOpenTicket = async (orderName: string, discount: number, paymentMethod: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order/${orderName}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({docstatus: 1, additional_discount_percentage: discount, custom_payment_mode: paymentMethod})
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to complete open ticket: ${JSON.stringify(errorData)}`);
        }
        return response;
    }

    const deleteOpenTicket = async (orderName: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order/${orderName}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            // body: JSON.stringify({docstatus: 2})
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to delete open ticket: ${JSON.stringify(errorData)}`);
        }
        return response;
    }

    //* -------------------------------------------------------------------------- */
    //*                             API calls for Payment                          */
    //* -------------------------------------------------------------------------- */

    const getAllPaidSalesInvoice = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Invoice?filters=[["status", "=", "Paid"]]&fields=["name", "posting_date"]&limit_page_length=1000`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to fetch sales invoice: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        return data.data;
    }

    const getSalesInvoiceByName = async (invoiceName: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Invoice/${invoiceName}`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to fetch sales invoice: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        return data.data;
    }

    const createSalesInvoice = async (payload: SalesInvoicePayload) => {
        
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Invoice`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error details:', errorData);
                throw new Error(`Failed to create sales invoice: ${JSON.stringify(errorData)}`);
            }
    
            return response;
    }

    const createPaymentEntry = async (payload: PaymentEntryPayload) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Payment Entry`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to create payment entry: ${JSON.stringify(errorData)}`);
        }
        return response;
    }
    //* -------------------------------------------------------------------------- */
    //*                             API calls for Revenue                         */
    //* -------------------------------------------------------------------------- */

    const getRevenue = async () => {
        try {
            if (isStaging) {
                // return mockRevenueData;
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Payment Entry?limit_page_length=1000&fields=["paid_amount", "posting_date", "creation"]&order_by=creation+desc`, {
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to fetch revenue: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        return data.data;
        } catch (error) {
            console.error('Error fetching revenue:', error);
            throw error;
        }
    }
    
    const getRevenueByPaymentMode = async (paymentMode: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Payment Entry?limit_page_length=1000&fields=["paid_amount", "posting_date", "mode_of_payment"]&filters=[["mode_of_payment","=","${paymentMode}"]]`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to fetch revenue by payment mode: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        return data.data;
        } catch (error) {
            console.error('Error fetching revenue by payment mode:', error);
            throw error;
        }
    }
    
    const getCompletedSalesOrder = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order?filters=[["docstatus", "=", 1]]&fields=["name", "customer", "transaction_date", "net_total"]&limit_page_length=1000&order_by=creation+desc`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to fetch completed sales order: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        return data.data;
    }

    const getCompletedSalesOrderItems = async (orderName: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Sales Order/${orderName}`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to fetch completed sales order items: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        return data.data;
    }

    //* -------------------------------------------------------------------------- */
    //*                             API calls for Activity Log                     */
    //* -------------------------------------------------------------------------- */
    const getActivityLog = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Version?fields=["modified_by", "creation", "ref_doctype", "docname", "data"]&limit_page_length=1000&order_by=creation+desc`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to fetch activity log: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        return data.data;
    }

    const getCompanyName = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Company`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to get company name: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        return data.data[0].name;
    }

    //* -------------------------------------------------------------------------- */
    //*                             API calls for send email                       */
    //* -------------------------------------------------------------------------- */
    
    const sendEmail = async (payload: EmailPayload) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/method/frappe.core.doctype.communication.email.make`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
        }
        return response;
    }

    const uploadReceipt = async (file: File, orderName: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('doctype', 'Sales Order');
        formData.append('docname', orderName);
        formData.append('is_private', '1');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/method/upload_file`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to upload file: ${JSON.stringify(errorData)}`);
        }
        
        return response;
    }

    //* -------------------------------------------------------------------------- */
    //*                             API calls for Custom Fields                     */
    //* -------------------------------------------------------------------------- */

    const checkCustomFieldExists = async (fieldname: string, dt: string): Promise<boolean> => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/resource/Custom Field?filters=[["fieldname","=","${fieldname}"],["dt","=","${dt}"]]`,
                {
                    headers: {
                        'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                return false;
            }
            
            const data = await response.json();
            return data.data && data.data.length > 0;
        } catch (error) {
            console.error('Error checking custom field existence:', error);
            return false;
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createCustomField = async (payload: any): Promise<Response> => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Custom Field`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error creating custom field:', errorData);
                throw new Error(`Failed to create custom field: ${JSON.stringify(errorData)}`);
            }

            return response;
        } catch (error) {
            console.error('Error creating custom field:', error);
            throw error;
        }
    };

    const initializeCustomFields = async () => {
        try {
            const customFields = [
                {
                    dt: "Sales Order",
                    label: "kitchen_status",
                    fieldname: "custom_kitchen_status",
                    insert_after: "per_delivered",
                    fieldtype: "Small Text",
                    default: "preparing",
                    translatable: 1
                },
                {
                    dt: "Sales Order",
                    label: "remarks",
                    fieldname: "custom_remarks",
                    insert_after: "custom_kitchen_status",
                    fieldtype: "Small Text",
                    translatable: 1
                },
                {
                    dt: "Sales Order",
                    label: "order_time",
                    fieldname: "custom_time",
                    insert_after: "delivery_date",
                    fieldtype: "Time"
                },
                {
                    dt: "Sales Order",
                    label: "order_complete",
                    fieldname: "custom_order_complete",
                    insert_after: "billing_status",
                    fieldtype: "Check",
                    allow_on_submit: 1
                },
                {
                    dt: "Sales Order",
                    label: "payment_mode",
                    fieldname: "custom_payment_mode",
                    insert_after: "custom_order_complete",
                    fieldtype: "Small Text",
                    allow_on_submit: 1,
                    translatable: 1
                },
                {
                    dt: "Sales Order",
                    label: "payment_complete",
                    fieldname: "custom_payment_complete",
                    insert_after: "custom_payment_mode",
                    fieldtype: "Check",
                    allow_on_submit: 1
                },
                {
                    dt: "Sales Order Item",
                    label: "item_done",
                    fieldname: "custom_item_done",
                    insert_after: "reserve_stock",
                    fieldtype: "Check",
                }
            ];

            for (const field of customFields) {
                const exists = await checkCustomFieldExists(field.fieldname, field.dt);
                if (!exists) {
                    console.log(`Creating custom field: ${field.fieldname}`);
                    await createCustomField(field);
                } else {
                    console.log(`Custom field already exists: ${field.fieldname}`);
                }
            }

            const categoryHeader = await createCategoryHead();
            console.log('Category header: ', categoryHeader);
            if (categoryHeader.statusText === "CONFLICT") {
                console.log('Category header "Food" already exists');
            }
            else {
                console.log('Category header created: "Food"');
            }

            console.log('Custom fields initialization completed');
        } catch (error) {
            console.error('Error initializing custom fields:', error);
            throw error;
        }
    };

    const checkModeOfPaymentExists = async (modeOfPayment: string): Promise<boolean> => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Mode of Payment?filters=[["name","=","${modeOfPayment}"]]`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
            }
        });
        if (!response.ok) {
            return false;
        }
        const data = await response.json();
        return data.data && data.data.length > 0;
    }

    const createModeOfPayment = async (modeOfPayment: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Mode of Payment`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: modeOfPayment,
                mode_of_payment: modeOfPayment
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to create mode of payment: ${JSON.stringify(errorData)}`);
        }
        return response;
    }
    const initializeModeOfPayment = async () => {
        const modeOfPayment = ["NETS", "Debit/Credit Card", "PayNow", "CDC"];
        for (const payment of modeOfPayment) {
            const exists = await checkModeOfPaymentExists(payment);
            if (!exists) {
                await createModeOfPayment(payment);
            }
            else {
                console.log(`Mode of payment already exists: ${payment}`);
            }
        }
        console.log('Mode of payment initialization completed');
    }
    //* -------------------------------------------------------------------------- */
    //*                             API calls for Customer                         */
    //* -------------------------------------------------------------------------- */
    const checkGuestCustomerExists = async () => {
        try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Customer/Guest`, {
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            return false;
            throw new Error(`Failed to check guest customer exists: ${JSON.stringify(errorData)}`);
        }
            const data = await response.json();
            if (data.data.name === 'Guest') {
                console.log('Guest customer exists');
                return true;
            } else {
                console.log('Guest customer does not exist');
                return false;
            }
        } catch (error) {
            console.error('Error checking guest customer exists:', error);
            throw error;
        }
    }

    const createGuestCustomer = async () => {
        try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resource/Customer`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${process.env.NEXT_PUBLIC_API_TOKEN}:${process.env.NEXT_PUBLIC_API_SECRET}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customer_name: "Guest",
                customer_type: "Individual"
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Failed to create guest customer: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        console.log('Guest customer created:', data.data);
        return data.data;
        } catch (error) {
            console.error('Error creating guest customer:', error);
            throw error;
        }
    }
    return (
        <ApiContext.Provider value={{ 
            fetchItems, 
            fetchItemDetails,
            disableItem,
            undoDisableItem,
            getItemAttribute,
            createItemAttribute,
            updateItemAttribute,
            createItemTemplate,
            createItemVariant,
            getItemCategories,
            createItemCategory,
            updateItemCategory,
            createItemPrice,
            fetchItemPrice,
            updateItemPrice,
            createStockEntry,
            fetchStockEntry,
            stockReconciliation,
            createKitchenOrder,
            fetchKitchenOrderNames,
            fetchKitchenOrderDetails,
            updateKitchenOrder,
            completeKitchenOrder,
            updateKitchenOrderItem,
            fetchOpenTickets,
            completeOpenTicket,
            deleteOpenTicket,
            createSalesInvoice,
            createPaymentEntry,
            getRevenue,
            updateKitchenOrderPayment,
            getRevenueByPaymentMode,
            getAllPaidSalesInvoice,
            getSalesInvoiceByName,
            getCompletedSalesOrder,
            getCompletedSalesOrderItems,
            getActivityLog,
            getCompanyName,
            initializeCustomFields,
            checkGuestCustomerExists,
            createGuestCustomer,
            initializeModeOfPayment,
            sendEmail,
            uploadReceipt
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

//* -------------------------------------------------------------------------- */
//*                             API calls for Custom Fields                     */
//* -------------------------------------------------------------------------- */

// ! custom_kitchen_status
// "dt": "Sales Order",
// "label": "kitchen_status",
// "fieldname": "custom_kitchen_status",
// "insert_after": "per_delivered",
// "fieldtype": "Small Text",
// "default": "preparing",
// "translatable": 1,

// !! custom_remarks
// "dt": "Sales Order",
// "label": "remarks",
// "fieldname": "custom_remarks",
// "insert_after": "custom_kitchen_status",
// "fieldtype": "Small Text",
// "translatable": 1,

// ! custom_time`
// "dt": "Sales Order",
// "label": "order_time",
// "fieldname": "custom_time",
// "insert_after": "delivery_date",
// "fieldtype": "Time",

// ! custom_order_complete
// "dt": "Sales Order",
// "label": "order_complete",
// "fieldname": "custom_order_complete",
// "insert_after": "billing_status",
// "fieldtype": "Check",
// "allow_on_submit": 1,
// "doctype": "Custom Field"

// ! custom_payment_mode
// "dt": "Sales Order",
// "label": "payment_mode",
// "fieldname": "custom_payment_mode",
// "insert_after": "custom_order_complete",
// "fieldtype": "Small Text",
// "allow_on_submit": 1,
// "translatable": 1,

// ! custom_payment_complete
// "dt": "Sales Order",
// "label": "payment_complete",
// "fieldname": "custom_payment_complete",
// "insert_after": "custom_payment_mode",
// "fieldtype": "Check",
// "allow_on_submit": 1,