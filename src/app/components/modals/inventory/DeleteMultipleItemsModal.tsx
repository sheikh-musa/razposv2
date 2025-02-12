type DeleteMultipleItemsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemCount: number;
};

export default function DeleteMultipleItemsModal({ 
    isOpen, 
    onClose, 
    onConfirm,
    itemCount 
}: DeleteMultipleItemsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                </div>
                <h3 className="text-black text-lg font-medium text-center mb-2">Delete Multiple Items</h3>
                <p className="text-gray-500 text-center mb-6">
                    Are you sure you want to delete {itemCount} selected items?
                </p>
                <p className="text-gray-500 text-center text-sm mb-6">This action cannot be undone</p>
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="text-black text-sm flex-1 px-4 py-2 border border-slate-500 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Delete All
                    </button>
                </div>
            </div>
        </div>
    );
}
