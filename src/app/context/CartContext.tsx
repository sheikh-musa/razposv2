'use client'
import React, { createContext, useContext, useState } from 'react';
// import { SalesOrderItem } from './types/ERPNext';

type CartItem = {
  itemTemplate: string; //* productId
  itemVariant: string; //* variantId
  name: string;
  price: number;
  quantity: number;
  type: string;
  additional_notes?: string;
  custom_item_done?: number;
};

//  -------------------------------------------------------------------------- */
//                 TODO: REDO THE CART CONTEXT USING THE NEW TYPES             */
//  -------------------------------------------------------------------------- */

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem, additionalNotes?: string) => void;
  removeItem: (itemVariant: string, name: string) => void;
  updateQuantity: (itemVariant: string, name: string, quantity: number) => void;
  updateAdditionalNotes: (itemVariant: string, name: string, additionalNotes: string) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (newItem: CartItem, additionalNotes?: string) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.name === newItem.name);
      
      if (existingItemIndex !== -1) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
          additional_notes: additionalNotes || updatedItems[existingItemIndex].additional_notes,
          custom_item_done: updatedItems[existingItemIndex].custom_item_done,
        };
        return updatedItems;
      } else {
        // Add new item with additional notes
        return [...prevItems, { ...newItem, additional_notes: additionalNotes || '' }];
      }
    });
  };

  const removeItem = (itemVariant: string, name: string) => {
    setItems(currentItems => 
      currentItems.filter(item => 
        !(item.itemVariant === itemVariant && item.name === name)
      )
    );
  };

  const updateQuantity = (itemVariant: string, name: string, quantity: number) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.itemVariant === itemVariant && item.name === name
          ? { ...item, quantity }
          : item
      )
    );
  };

  const updateAdditionalNotes = (itemVariant: string, name: string, additionalNotes: string) => {

    setItems(currentItems =>
      currentItems.map(item =>
        item.itemVariant === itemVariant && item.name === name
          ? { ...item, additional_notes: additionalNotes }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      updateAdditionalNotes,
      clearCart,
      total 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 