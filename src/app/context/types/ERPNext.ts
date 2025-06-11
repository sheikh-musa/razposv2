// * -------------------------  Item Attribute Types ------------------------ */
export type ItemAttributeValue = {
    attribute_value: string;
    abbr: string;
}

export type ItemAttributePayload = {
    attribute_name: string;
    numeric_values: number;
    item_attribute_values: ItemAttributeValue[];
}

//* --------------------------- Item Template Types -------------------------- */
export type ItemAttribute = {
    attribute: string;
}

export type ItemTemplatePayload = {
    item_code: string;
    item_name: string;
    item_group: string;
    has_variants: number;
    variant_based_on: string;
    attributes: ItemAttribute[];
}

//* --------------------------- Item Variant Types --------------------------- */
export type VariantAttribute = {
    attribute: string;
    attribute_value: string;
}

export type ItemVariantPayload = {
    variant_of: string;
    item_code: string;
    item_name: string;
    item_group: string;
    stock_uom: string;
    opening_qty: number;
    attributes: VariantAttribute[];
}

//* --------------------------- Item Price Types ---------------------------- */
export type ItemPricePayload = {
    item_code: string;
    item_name: string;
    stock_uom: string;
    price_list: string;
    selling: number;
    currency: string;
    price_list_rate: number;
    // valid_from?: string;
    // valid_upto?: string;
}

export type ItemPrice = {
    item_name: string;
    price_list_rate: number;
    selling: number;
}
//* --------------------------- Stock Types ---------------------------- */ 

export type StockEntryItem = {
    item_code: string;
    qty: number;
    t_warehouse: string;
    uom: string;
};

export type StockEntryPayload = {
    stock_entry_type: string;
    items: StockEntryItem[];
    docstatus: number;
};

export type StockReconciliationPayload = {
    purpose: string;
    items: {
        item_code: string;
        warehouse: string;
        qty: number;
        valuation_rate: number;
    }[];
    docstatus: number;
}

export type StockEntry = {
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
}

//* --------------------------- Order (Kitchen) Types ---------------------------- */

export type SalesOrders = {
    name: string;
    customer: string;
    transaction_date: string;
    total_qty: number;
    total: number
    custom_kitchen_status: string;
    custom_remarks: string;
    custom_payment_mode: string;
    custom_payment_complete: number;
    custom_order_complete: number;
    payment_schedule: PaymentSchedule[];
    items: SalesOrderItem[];
}

export type PaymentSchedule = {
    payment_amount: number;
    discount: number;
    outstanding: number;
}

export type SalesOrderItem = {
    item_code: string;
    qty: number;
}

export type SalesOrderPayload = {
    customer: string;
    delivery_date: string;
    custom_order_time: string;
    items: SalesOrderItem[];
    status: string;
    custom_kitchen_status: string;
    custom_remarks: string;
    custom_payment_mode: string;
    custom_order_complete: number;
    custom_payment_complete: number;
    docstatus: number;
  }

export type SalesOrderUpdatePayload = {
    custom_order_complete: number;
    custom_payment_complete: number;
}

export type CompletedSalesOrder = {
    name: string;
    customer: string;
    transaction_date: string;
    total: number
    items: SalesOrderItem[];
}
//* --------------------------- Sales Invoice Types ---------------------------- */

export type SalesInvoice = {
    name: string;
    posting_date: string;
}

export type SalesInvoicePayload = {
    customer: string;
    items: {
        item_code: string;
        qty: number;
        warehouse: string;
        income_account: string;
        sales_order: string;
    }[];
    update_stock: number;
    disable_rounded_total: number;
    docstatus: number;
}

export type PaymentEntryPayload = {
    payment_type: string;
    party_type: string;
    party: string;
    paid_to: string;
    received_amount: number;
    paid_amount: number;
    references: {
        reference_doctype: string;
        reference_name: string;
        total_amount: number;
        outstanding_amount: number;
        allocated_amount: number;
    }[];
    mode_of_payment: string;
    docstatus: number;
}

//* --------------------------- Common Types ---------------------------- */
export type ItemDetailed = {
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
    quantity?: number;
}

export type ItemTemplate = {
    name: string;
    item_name: string;
    variants: ItemDetailed[];
} 

export type ItemBasic = {
    name: string;
    item_name: string;
}

export type ItemWithPrice = ItemDetailed & {
    price?: ItemPrice;  // Making it optional in case price isn't always available
};

//* --------------------------- Revenue Types ---------------------------- */

export type RevenueEntry = {
    paid_amount: number;
    posting_date: string;
    creation: string;
}

export type MonthlyRevenue = {
    month: string;  // e.g., "2025-03"
    total: number;
    entries: RevenueEntry[];
}

export type RevenueByPaymentMode = {
    total_amount: number;
    mode_of_payment: string;
}

export type PaymentUpdatePayload = {
    custom_payment_mode: string;
};

export type SalesItemRevenue = {
    item_code: string;
    total_amount: number;
}