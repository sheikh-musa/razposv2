'use client'
import React, { useEffect, useState } from 'react'

// Define types
type Variant = {
  name: string;
  price: number;
  productId: number;
  orderQuantity: number;
};
type Product = {
  type: string;
  variants: Variant[];
};
type Order = {
  id: number;
  itemsType: number;
  product: Product[];
  totalPrice: number;
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:mm:ss
};


export default function Orders() {

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/orders")
    .then((res) => res.json())
    .then((data) => setOrders(data));
    }, [])

  return (
    <div className="flex h-screen bg-white text-black">
      <h1 className="text-2xl font-bold text-black">Orders</h1>
      <pre>{JSON.stringify(orders, null, 2)}</pre>
    </div>
  );
} 