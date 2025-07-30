"use client";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import AddNewInventoryTemplate from "@/app/components/add/AddNewInventory";
import AddExistingInventory from "@/app/components/add/AddExistingInventory";

export default function AddInventory() {
  const [isExistingTemplate, setIsExistingTemplate] = useState<boolean | null>(null);

  return (
    <>
      <div className="z-50">
        <Toaster />
      </div>
      <div className="p-6 bg-white min-h-screen">
        <h1 className="text-2xl font-bold text-black mb-6">Add inventory</h1>

        <div className="text-black text-sm mb-4">
          <span className="mr-2">Is the product a variant of an existing template?</span>
          <input
            type="radio"
            value=""
            name="inline-radio-group"
            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            onChange={() => setIsExistingTemplate(true)}
          />
          <label className="mx-2 text-sm font-medium text-black">Yes</label>
          <input
            type="radio"
            value=""
            name="inline-radio-group"
            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            onChange={() => setIsExistingTemplate(false)}
          />
          <label className="mx-2 text-sm font-medium text-black">No</label>
        </div>
        {isExistingTemplate === true ? <AddExistingInventory /> : isExistingTemplate === false ? <AddNewInventoryTemplate /> : <></>}
      </div>
    </>
  );
}
