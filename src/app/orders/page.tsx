"use client";
import React, { useEffect, useState } from "react";
import OrderSummary from "../components/orders/OrderSummary";
import { useCart } from "../context/CartContext";
import OrderConfirmationModal from "../components/modals/OrderConfirmationModal";
import OrderCard from "../components/orders/OrderCard";
import { useApi } from "../context/ApiContext";
import { ItemTemplate, ItemWithPrice } from "../context/types/ERPNext";

export default function Orders() {
  const { fetchItems, fetchItemDetails, fetchItemPrice } = useApi();
  const [products, setProducts] = useState<ItemTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // const [showFilters, setShowFilters] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const { addItem, items } = useCart();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<{
    product: ItemTemplate;
    variant: ItemWithPrice;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        // Fetch item templates (items with variants)
        const templates = await fetchItems(false, true);
        // For each template, fetch its variants
        const productsWithVariants = await Promise.all(
          templates.map(async (template) => {
            const variants = await fetchItemDetails(template.name, true);
            // Fetch prices for all variants
            const variantsWithPrices = await Promise.all(
              variants.map(async (variant) => {
                const price = await fetchItemPrice(variant.name);
                const itemPrice = price[0]; // Get first price from array
                return {
                  ...variant,
                  price: itemPrice, // Use single ItemPrice object instead of array
                  quantity: 1, // Default quantity for ordering
                } as ItemWithPrice;
              })
            );

            return {
              name: template.name,
              item_name: template.item_name,
              variants: variantsWithPrices,
            };
          })
        );
        setProducts(productsWithVariants);
        console.log("productsWithVariants", productsWithVariants); // ! console log
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    // eslint-disable-next-line
  }, []);

  const handleQuantityChange = (productName: string, variantName: string, change: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.name === productName) {
          return {
            ...product,
            variants: product.variants.map((variant) => {
              if (variant.name === variantName) {
                return {
                  ...variant,
                  quantity: Math.max(1, (variant.quantity || 1) + change),
                };
              }
              return variant;
            }),
          };
        }
        return product;
      })
    );
  };

  const handleAddToOrder = (product: ItemTemplate, variant: ItemWithPrice) => {
    const existingItem = items.find((item) => item.name === variant.name);

    if (existingItem) {
      setPendingOrder({ product, variant });
      setShowConfirmModal(true);
    } else {
      addItem({
        itemTemplate: product.name,
        name: variant.name,
        itemVariant: variant.item_name,
        price: variant.price?.price_list_rate || 0, // ! some of the old data use valuation_rate
        quantity: variant.quantity || 1,
        type: product.item_name,
      });
      console.log("variant", variant); // ! console log
      setShowOrderSummary(true);
    }
  };

  const handleConfirmAdd = () => {
    if (pendingOrder) {
      const { product, variant } = pendingOrder;
      addItem({
        itemTemplate: product.name,
        name: variant.name,
        itemVariant: variant.item_name,
        price: variant.price?.price_list_rate || 0, // ! some of the old data use valuation_rate
        quantity: variant.quantity || 1,
        type: product.item_name,
      });
      setShowOrderSummary(true);
      setPendingOrder(null);
      setShowConfirmModal(false);
    }
  };

  // Filter products based on search query
  const filteredProducts = products
    .map((product) => ({
      ...product,
      variants: product.variants.filter(
        (variant) =>
          variant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.item_name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((product) => product.variants.length > 0);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ color: "var(--color-fg-primary)" }}>
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
              className="pl-10 pr-4 py-2 border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-black text-sm"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Order Summary Button */}
          <button
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-600"
            onClick={() => setShowOrderSummary(!showOrderSummary)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Order Summary
          </button>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="flex gap-4">
        {/* Product Grid */}
        <div className={`grid grid-cols-1 ${showOrderSummary ? "md:grid-cols-2" : "md:grid-cols-3"} gap-3 flex-1`}>
          {filteredProducts.map((product) => (
            <OrderCard key={product.name} product={product} onQuantityChange={handleQuantityChange} onAddToOrder={handleAddToOrder} />
          ))}
        </div>

        {/* Order Summary Side Panel */}
        {showOrderSummary && (
          <div className="w-80 flex-shrink-0">
            <OrderSummary onClose={() => setShowOrderSummary(false)} />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingOrder(null);
        }}
        onConfirm={handleConfirmAdd}
        itemName={pendingOrder?.variant.item_name || ""}
      />
    </div>
  );
}
