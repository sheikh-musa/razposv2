interface RestoreMultipleItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemCount: number;
}

export default function RestoreMultipleItemsModal({ isOpen, onClose, onConfirm, itemCount }: RestoreMultipleItemsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Restore Multiple Items</h2>
                <p className="mb-6">
                    Are you sure you want to restore {itemCount} selected items?
                </p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                        Restore All
                    </button>
                </div>
            </div>
        </div>
    );
}