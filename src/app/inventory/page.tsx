/* eslint-disable */
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DeleteItemModal from "@/app/components/modals/inventory/DeleteItemModal";
import DeleteMultipleItemsModal from "@/app/components/modals/inventory/DeleteMultipleItemsModal";
import RestoreItemModal from "@/app/components/modals/inventory/RestoreItemModal";
import RestoreMultipleItemsModal from "@/app/components/modals/inventory/RestoreMultipleItemsModal";
import { useApi } from "../context/ApiContext";
import InventoryTable from "@/app/components/inventory/InventoryTable";
import { ItemWithPrice } from "../context/types/ERPNext";
import InventoryEdit from "@/app/components/inventory/InventoryEdit";

export default function Inventory() {
  const router = useRouter();
  const { fetchItems, fetchItemDetails, disableItem, undoDisableItem, fetchItemPrice } = useApi();
  const [items, setItems] = useState<ItemWithPrice[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedItems, setSelectedItems] = useState<
    {
      name: string;
      item_name: string;
    }[]
  >([]);
  const [showMultiDeleteModal, setShowMultiDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    name: string;
    item_name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState(false);
  const [showDeletedItems, setShowDeletedItems] = useState(false);
  const [itemToRestore, setItemToRestore] = useState<{
    name: string;
    item_name: string;
  } | null>(null);
  const [showMultiRestoreModal, setShowMultiRestoreModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemWithPrice | null>(null);
  // const [itemPrice, setItemPrice] = useState<ItemPrice[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const itemsWithDetails = await fetchItemWithDetails();
        setItems(itemsWithDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [showDeletedItems]);

  const fetchItemWithDetails = async () => {
    const basicItems = await fetchItems(showDeletedItems);
    const itemsWithDetails = await Promise.all(
      basicItems.map(async (item) => {
        const details = await fetchItemDetails(item.name);
        const price = await fetchItemPrice(item.name);
        return {
          ...details[0],
          price: price[0],
        };
      })
    );
    console.log("itemsWithDetails", itemsWithDetails); // ! console log
    setFilterOptions(false);
    setShowOptions(false);
    setSelectedItems([]);
    return itemsWithDetails;
  };

  const handleDelete = (name: string, itemName: string) => {
    setItemToDelete({ name, item_name: itemName });
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setLoading(true);
      const response = await disableItem(itemToDelete.name);

      if (response.ok) {
        const itemsWithDetails = await fetchItemWithDetails();
        setItems(itemsWithDetails);
      }
    } catch (error) {
      setError("Failed to delete item");
      console.error("Error deleting item:", error);
    } finally {
      setLoading(false);
      setItemToDelete(null);
    }
  };

  // Filter items based on search query
  const filteredItems = items.filter(
    (item) =>
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) || item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Reuse the page numbers generation logic
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1, "...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...", totalPages);
      }
    }
    return pages;
  };

  // Add checkbox handling
  const handleCheckboxChange = (name: string, itemName: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, { name, item_name: itemName }]);
    } else {
      setSelectedItems((prev) => prev.filter((item) => !(item.name === name)));
    }
  };

  // Handle "select all" checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allItems = currentItems.map((item) => ({
        name: item.name,
        item_name: item.item_name,
      }));
      setSelectedItems(allItems);
    } else {
      setSelectedItems([]);
    }
  };

  // Add bulk delete handler
  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedItems.map((item) => disableItem(item.name)));

      const itemsWithDetails = await fetchItemWithDetails();
      setItems(itemsWithDetails);
      setSelectedItems([]);
      setShowMultiDeleteModal(false);
    } catch (error) {
      setError("Failed to delete items");
      console.error("Error deleting items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update handleRestore to show modal
  const handleRestore = (name: string, itemName: string) => {
    setItemToRestore({ name, item_name: itemName });
  };

  // Add confirmRestore function
  const confirmRestore = async () => {
    if (!itemToRestore) return;

    try {
      setLoading(true);
      const response = await undoDisableItem(itemToRestore.name);

      if (response.ok) {
        const itemsWithDetails = await fetchItemWithDetails();
        setItems(itemsWithDetails);
      }
    } catch (error) {
      setError("Failed to restore item");
      console.error("Error restoring item:", error);
    } finally {
      setLoading(false);
      setItemToRestore(null);
    }
  };

  // Add bulk restore handler
  const handleBulkRestore = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedItems.map((item) => undoDisableItem(item.name)));

      const itemsWithDetails = await fetchItemWithDetails();
      setItems(itemsWithDetails);
      setSelectedItems([]);
      setShowMultiRestoreModal(false);
    } catch (error) {
      setError("Failed to restore items");
      console.error("Error restoring items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item: ItemWithPrice) => {
    setSelectedItem(item);
  };

  const handleInventoryUpdate = async () => {
    const updatedItems = await fetchItemWithDetails();
    setItems(updatedItems);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-0" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-fg-primary)" }}>
      {/* Header Section - Mobile: Stack vertically, Desktop: Side by side */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
        <h1 className="text-xl lg:text-2xl font-bold">
          Inventory {showDeletedItems ? <span style={{ color: "var(--color-fg-error-primary)" }}>(Deleted)</span> : ""}
        </h1>

        {/* Controls - Mobile: Stack, Desktop: Horizontal */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-sm">
          {/* Search Bar - Full width on mobile */}
          <div className="relative order-1 sm:order-1">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-4 py-2 border text-black rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Button Row - Mobile: Grid 2x2, Desktop: Horizontal */}
          <div className="grid grid-cols-2 sm:flex gap-2 order-2 sm:order-2">
            {/* Filters Button */}
            <div className="relative">
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 lg:px-4 py-2 border rounded-md hover:bg-gray-50 text-xs lg:text-sm"
                onClick={() => setFilterOptions(!filterOptions)}
              >
                <svg className="w-4 lg:w-5 h-4 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span className="hidden sm:inline">Filters</span>
              </button>

              {filterOptions && (
                <div className="absolute mt-2 w-64 bg-white rounded-md shadow-lg z-10 p-4 left-0 sm:right-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showDeleted"
                      checked={showDeletedItems}
                      onChange={(e) => setShowDeletedItems(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="showDeleted" className="text-sm text-gray-700">
                      Show deleted items
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Add Inventory Button */}
            <button
              onClick={() => router.push("/inventory/add")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-500 text-white px-3 lg:px-4 py-2 rounded-md hover:bg-purple-600 text-xs lg:text-sm"
            >
              <svg className="w-4 lg:w-5 h-4 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add</span>
              <span className="sm:hidden">Add Inventory</span>
            </button>

            {/* Export Button */}
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-300 px-3 lg:px-4 py-2 rounded-md hover:bg-gray-50 text-xs lg:text-sm">
              <svg className="w-4 lg:w-5 h-4 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* More Options (Hamburger) Button */}
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="w-full sm:w-auto p-2 hover:bg-gray-100 rounded-md flex items-center justify-center"
              >
                <svg className="w-4 lg:w-5 h-4 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                    onClick={() => {
                      // Handle edit
                      setShowOptions(false);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Edit
                  </button>
                  {!showDeletedItems ? (
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                      onClick={() => {
                        // Handle delete
                        setShowMultiDeleteModal(true);
                        setShowOptions(false);
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  ) : (
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-gray-100 w-full"
                      onClick={() => {
                        // Handle delete
                        setShowMultiRestoreModal(true);
                        setShowOptions(false);
                      }}
                    >
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Restore
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table - Now handles its own responsiveness */}
      <div className="mb-6">
        <InventoryTable
          currentItems={currentItems}
          selectedItems={selectedItems}
          handleCheckboxChange={handleCheckboxChange}
          handleSelectAll={handleSelectAll}
          handleDelete={handleDelete}
          handleRestore={handleRestore}
          showDeletedItems={showDeletedItems}
          onEditItem={handleEditItem}
        />
      </div>

      {/* Pagination - Mobile: Stack, Desktop: Inline */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
        <button
          className="flex items-center justify-center gap-2 text-gray-600 w-full sm:w-auto py-2 px-4 border rounded-md sm:border-0"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {/* Page Numbers - Horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto px-4 sm:px-0">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              className={`flex-shrink-0 w-8 h-8 rounded-lg ${page === currentPage ? "bg-purple-600 text-white" : "text-gray-600"}`}
              onClick={() => typeof page === "number" && setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          className="flex items-center justify-center gap-2 text-gray-600 w-full sm:w-auto py-2 px-4 border rounded-md sm:border-0"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ...existing code... */}
      {/* Single Delete Modal */}
      <DeleteItemModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        itemName={itemToDelete?.item_name}
      />

      {/* Multiple Delete Modal */}
      <DeleteMultipleItemsModal
        isOpen={showMultiDeleteModal}
        onClose={() => setShowMultiDeleteModal(false)}
        onConfirm={handleBulkDelete}
        itemCount={selectedItems.length}
      />

      {/* Add Restore Modals */}
      <RestoreItemModal
        isOpen={!!itemToRestore}
        onClose={() => setItemToRestore(null)}
        onConfirm={confirmRestore}
        itemName={itemToRestore?.item_name}
      />

      <RestoreMultipleItemsModal
        isOpen={showMultiRestoreModal}
        onClose={() => setShowMultiRestoreModal(false)}
        onConfirm={handleBulkRestore}
        itemCount={selectedItems.length}
      />

      {selectedItem && <InventoryEdit item={selectedItem} onClose={() => setSelectedItem(null)} onUpdate={handleInventoryUpdate} />}
    </div>
  );
}
