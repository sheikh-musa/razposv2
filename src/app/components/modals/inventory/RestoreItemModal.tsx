type RestoreItemModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName?: string;
};

export default function RestoreItemModal({ 
    isOpen, 
    onClose, 
    onConfirm,
    itemName 
}: RestoreItemModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                </div>
                <h3 className="text-black text-lg font-medium text-center mb-2">Confirm</h3>
                <p className="text-gray-500 text-center mb-6">
                    Are you sure you want to restore {itemName ? `"${itemName}"` : 'this item'}?
                </p>
                <p className="text-gray-500 text-center text-sm mb-6">This item will be available in the inventory again</p>
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
                        className="flex-1 text-sm px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                        Restore
                    </button>
                </div>
            </div>
        </div>
    );
}
