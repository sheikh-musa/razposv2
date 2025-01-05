'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'

type Variant = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type Product = {
  id: number;
  type: string;
  variants: Variant[];
};

export default function Orders() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const handleQuantityChange = (productId: number, variantId: number, change: number) => {
    setProducts(prevProducts =>
      prevProducts.map(product => {
        if (product.id === productId) {
          return {
            ...product,
            variants: product.variants.map(variant => {
              if (variant.id === variantId) {
                return {
                  ...variant,
                  quantity: Math.max(0, (variant.quantity || 0) + change)
                };
              }
              return variant;
            })
          };
        }
        return product;
      })
    );
  };

  const handleAddToOrder = (productId: number, variantId: number) => {
    // Add your order logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
  
          {/* Filters Button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50 text-black"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
  
          {/* Order Summary Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Order Summary
          </button>
        </div>
      </div>
  
      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-6 rounded-lg shadow-sm text-black">
            <h2 className="text-xl font-semibold mb-4">{product.type}</h2>
            <div className="space-y-4">
              {product.variants.map((variant) => (
                <div key={variant.id} className="flex items-center gap-4">
                  <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                    <Image
                      src={variant.image}
                      alt={variant.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{variant.name}</h3>
                    <p className="text-gray-600">${variant.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => handleQuantityChange(product.id, variant.id, -1)}
                          className="px-3 py-1 border-r hover:bg-gray-50 text-black"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 text-black">{variant.quantity || 0}</span>
                        <button
                          onClick={() => handleQuantityChange(product.id, variant.id, 1)}
                          className="px-3 py-1 border-l hover:bg-gray-50 text-black"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleAddToOrder(product.id, variant.id)}
                        className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}  