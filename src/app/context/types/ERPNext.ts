// Item Attribute Types
export type ItemAttributeValue = {
    attribute_value: string;
    abbr: string;
}

export type ItemAttributePayload = {
    attribute_name: string;
    numeric_values: number;
    item_attribute_values: ItemAttributeValue[];
}

// Item Template Types
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

// Item Variant Types
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

// Item Price Types
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

// Common Types
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

export type StockReconciliationPayload = {
    purpose: string;
    items: {
        item_code: string;
        warehouse: string;
        qty: number;
    }[];
    docstatus: number;
}