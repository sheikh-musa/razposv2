import { RecentActivity as RecentActivityType } from "@/app/context/types/ERPNext";
import { useState } from "react";
import Image from "next/image";

type ActivityData = {
    added: unknown[];
    changed: [string, string | number, string | number][];
    removed: unknown[];
    row_changed: Array<[string, number, string, Array<[string, unknown, number]>]>;
    data_import: null;
    updater_reference: null;
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatActivityData = (dataString: string) => {
    try {
        const data: ActivityData = JSON.parse(dataString);
        
        // Handle status changes
        const statusChange = data.changed.find(change => change[0] === 'status');
        if (statusChange) {
            return (
                <div className="flex items-center gap-2">
                    <span className="text-gray-600">Changed status from</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        getStatusColor(statusChange[1] as string)
                    }`}>
                        {statusChange[1]}
                    </span>
                    <span className="text-gray-600">to</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        getStatusColor(statusChange[2] as string)
                    }`}>
                        {statusChange[2]}
                    </span>
                </div>
            );
        }

        // Handle document status changes
        const docStatusChange = data.changed.find(change => change[0] === 'docstatus');
        if (docStatusChange) {
            return (
                <span className="text-gray-600">
                    Changed document status from {getDocStatus(docStatusChange[1] as number)} to {getDocStatus(docStatusChange[2] as number)}
                </span>
            );
        }

        const orderCompleteChange = data.changed.find(change => change[0] === 'custom_order_complete');
        if (orderCompleteChange) {
            return (
                <span className="text-gray-600">
                    Updated Sales Order status to completed
                </span>
            );
        }

        const paymentModeChange = data.changed.find(change => change[0] === 'custom_payment_mode');
        if (paymentModeChange) {
            return (
                <span className="text-gray-600">
                    Updated payment mode from {paymentModeChange[1]} to {paymentModeChange[2]}
                </span>
            );
        }

        // Handle payment changes
        const paymentChange = data.row_changed.find(change => change[0] === 'references');
        if (paymentChange) {
            return (
                <span className="text-gray-600">
                    Updated payment reference
                </span>
            );
        }

        return <span className="text-gray-600">Made changes to the document</span>;
    } catch {
        return <span className="text-gray-600">Updated the document</span>;
    }
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'draft':
            return 'bg-gray-100 text-gray-600';
        case 'submitted':
            return 'bg-green-100 text-green-600';
        case 'unpaid':
            return 'bg-yellow-100 text-yellow-600';
        case 'cancelled':
            return 'bg-red-100 text-red-600';
        case 'paid':
            return 'bg-blue-100 text-blue-600';
        default:
            return 'bg-gray-100 text-gray-600';
    }
};

const getDocStatus = (status: number) => {
    switch (status) {
        case 0:
            return 'Draft';
        case 1:
            return 'Submitted';
        case 2:
            return 'Cancelled';
        default:
            return 'Unknown';
    }
};

const Tooltip = ({ content }: { content: string }) => {
    return (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-gray-900 text-white rounded-md shadow-lg whitespace-pre-wrap max-w-xs">
            <div className="max-h-48 overflow-auto">
                {JSON.stringify(JSON.parse(content), null, 2)}
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
    );
};

export default function RecentActivity({ activityLog }: { activityLog: RecentActivityType[] }) {
    const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);
    const imageUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
    
    return (
        <div className="flex flex-col h-[600px]">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3 flex-shrink-0">
                <h2 className="text-md text-gray-500 font-semibold">Recent activity</h2>
                <div className="flex gap-2">
                    <button className="px-3 py-2 text-xs text-gray-600 border border-gray-400 rounded-md">Download</button>
                    <button className="px-3 py-2 text-xs bg-purple-600 text-white rounded-md">View all</button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto pr-2">
                    <div className="space-y-4">
                        {activityLog.map((activity, index) => (
                            <div key={index} className="flex items-start gap-3 py-3 hover:bg-gray-50 rounded-lg px-2">
                                <Image 
                                    src={imageUrl} 
                                    alt={activity.modified_by} 
                                    width={32} 
                                    height={32} 
                                    className="rounded-full flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-black truncate">
                                            {activity.modified_by.split('@')[0]}
                                        </span>
                                        <span className="text-gray-400 flex-shrink-0">•</span>
                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                            {formatDate(activity.creation)}
                                        </span>
                                    </div>
                                    <div className="mt-1">
                                        <span 
                                            className="text-sm relative inline-block cursor-help"
                                            onMouseEnter={() => setHoveredActivity(activity.data)}
                                            onMouseLeave={() => setHoveredActivity(null)}
                                        >
                                            {formatActivityData(activity.data)}
                                            {hoveredActivity === activity.data && (
                                                <Tooltip content={activity.data} />
                                            )}
                                        </span>
                                        <div className="mt-1 text-xs text-gray-500">
                                            {activity.ref_doctype}: {activity.docname}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}