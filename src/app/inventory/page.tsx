"use client"
import React, { useEffect, useState } from 'react'

type Variant = {
    id: number;
    name: string;
    price: number;
    stock: number;
  };
  
  type Product = {
    id: number;
    type: string;
    variants: Variant[];
  };
  
export default function Inventory() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        fetch("/api/products")
          .then((res) => res.json())
          .then((data) => setProducts(data));
      }, []);
      console.log(products);
    return (
        <div className="flex h-screen bg-white">
            <h1 className="text-black">Inventory</h1>
            <div className='text-black'>
            <pre>{JSON.stringify(products, null, 2)}</pre>
            </div>
        </div>
    )
}
