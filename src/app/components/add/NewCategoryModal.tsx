"use client";
// import { Modal } from "@/components/application/modals/modal";
import { useState } from "react";
import { useApi } from "@/app/context/ApiContext";
import toast from "react-hot-toast";
;

export default function NewCategoryModal({ 
    isOpen,
    onClose,
    onCreate
 }: {
    isOpen: boolean, onClose: () => void, onCreate: (categoryName: string) => void }) {
    const [categoryName, setCategoryName] = useState('');
    const { createItemCategory } = useApi();
    const capitalizeFirstLetter = (string: string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
        };

    if (!isOpen) return null;

    const handleCreateCategory = async () => {
        const response = await createItemCategory(categoryName);
        console.log('response :', response);
        if (response.statusText === "CONFLICT") {
            toast.error('Category already exists');
        }
        else if (response.ok) {
            toast.success('Category created successfully');
            onCreate(categoryName);
            onClose();
        }
        else {
            toast.error('Failed to create category');
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h1 className="text-black text-lg font-medium text-center mb-2">Create new category</h1>
                <input type="text" className="w-full p-2 border rounded-md text-sm text-black mb-4" 
                placeholder="Please enter new category name" 
                onChange={(e) => setCategoryName(capitalizeFirstLetter(e.target.value))} 
                value={categoryName}
                />
                <div className="flex gap-4 justify-end">
                    <button
                        onClick={onClose}
                        className="text-black w-1/4 text-sm px-3 py-2 border border-slate-500 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            handleCreateCategory();
                        }}
                        className="w-1/4 px-3 p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                    >Create</button>
                </div>
            </div>
        </div>
        // <Modal isOpen={isOpen} onClose={onClose} className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        //     <h1 className="text-black text-lg font-medium text-center mb-2">New Category</h1>
        //     <input type="text" className="w-full p-2 border rounded-md text-sm" placeholder="Category name" />
        //     <button className="w-full p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm" onClick={onClose}>Create</button>
        // </Modal>
    )
}