interface RestoreItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName?: string;
}

export default function RestoreItemModal({ isOpen, onClose, onConfirm, itemName }: RestoreItemModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4 text-black">Restore Item</h2>
                <p className="mb-6 text-black">
                    Are you sure you want to restore <span className="font-semibold">{itemName}</span>?
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
                        Restore
                    </button>
                </div>
            </div>
        </div>
    );
}
