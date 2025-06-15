import { RecentActivity as RecentActivityType } from "@/app/context/types/ERPNext";

export default function RecentActivity({ activityLog }: { activityLog: RecentActivityType[] }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">

            <h2 className="text-md text-gray-500 font-semibold">Recent activity</h2>
            <div className="flex gap-2">
                <button className="px-3 py-2 text-xs text-gray-600 border border-gray-400 rounded-md">Download</button>
                <button className="px-3 py-2 text-xs bg-purple-600 text-white rounded-md">View all</button>
            </div>
            </div>
            <div>
                {activityLog.filter((activity, index) => index < 5).map((activity, index) => (
                    <div key={index} className='flex flex-col gap-2 text-black'>
                        <p className="text-xs text-gray-500">{index + 1}</p>
                        <p>{activity.modified_by}</p>
                        <p>{activity.creation}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}