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
};

//  -------------------------------------------------------------------------- */
//                 TODO: REDO THE CART CONTEXT USING THE NEW TYPES             */
//  -------------------------------------------------------------------------- */

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemVariant: string, name: string) => void;
  updateQuantity: (itemVariant: string, name: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (newItem: CartItem) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(
          item => item.itemVariant === newItem.itemVariant && item.name === newItem.name
      );

      if (existingItem) {
        return currentItems.map(item =>
          item.itemVariant === newItem.itemVariant && item.name === newItem.name
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }

      return [...currentItems, newItem];
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