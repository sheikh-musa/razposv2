import { RecentActivity as RecentActivityType } from "@/app/context/types/ERPNext";

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

export default function RecentActivity({ activityLog }: { activityLog: RecentActivityType[] }) {
    const imageUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
                <h2 className="text-md text-gray-500 font-semibold">Recent activity</h2>
                <div className="flex gap-2">
                    <button className="px-3 py-2 text-xs text-gray-600 border border-gray-400 rounded-md">Download</button>
                    <button className="px-3 py-2 text-xs bg-purple-600 text-white rounded-md">View all</button>
                </div>
            </div>
            <div className="space-y-4">
                {activityLog.reverse().filter((activity, index) => index < 10).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 py-3">
                        <img 
                            src={imageUrl} 
                            alt={activity.modified_by} 
                            width={32} 
                            height={32} 
                            className="rounded-full"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-black">
                                    {activity.modified_by.split('@')[0]}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-xs text-gray-500">
                                    {formatDate(activity.creation)}
                                </span>
                            </div>
                            <div className="mt-1">
                                <span className={`text-sm hover:${activity.data} cursor-pointer`} >
                                    {formatActivityData(activity.data)}
                                </span>
                                <div className="mt-1 text-xs text-gray-500">
                                    Document: {activity.ref_doctype}: {activity.docname}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}