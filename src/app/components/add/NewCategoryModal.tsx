"use client";
import { Modal } from "@/components/application/modals/modal";

;

export default function NewCategoryModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h1 className="text-black text-lg font-medium text-center mb-2">New Category</h1>
                <input type="text" className="w-full p-2 border rounded-md text-sm" placeholder="Category name" />
                <button className="w-full p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm" onClick={onClose}>Create</button>
            </div>
        </div>
        // <Modal isOpen={isOpen} onClose={onClose} className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        //     <h1 className="text-black text-lg font-medium text-center mb-2">New Category</h1>
        //     <input type="text" className="w-full p-2 border rounded-md text-sm" placeholder="Category name" />
        //     <button className="w-full p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm" onClick={onClose}>Create</button>
        // </Modal>
    )
}