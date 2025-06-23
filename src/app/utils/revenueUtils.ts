import { RevenueEntry, MonthlyRevenue } from '../context/types/ERPNext';

type TimeRange = '12 months' | '30 days' | '7 days' | '24 hours';

export const groupRevenueByMonth = (revenue: RevenueEntry[]): MonthlyRevenue[] => {
    // Create a map to group entries by month
    const monthlyGroups = revenue.reduce((groups, entry) => {
        // Get YYYY-MM from the posting_date
        const month = entry.posting_date.substring(0, 7);

        if (!groups.has(month)) {
            groups.set(month, {
                month,
                total: 0,
                entries: []
            });
        }
        
        const group = groups.get(month)!;
        group.entries.push(entry);
        group.total += entry.paid_amount;
        
        return groups;
    }, new Map<string, MonthlyRevenue>());
    // Convert map to array and sort by month
    return Array.from(monthlyGroups.values())
        .sort((a, b) => a.month.localeCompare(b.month));
};

export const processRevenueData = (revenue: RevenueEntry[]) => {
    const monthlyRevenue = groupRevenueByMonth(revenue);
    const totalRevenue = revenue.reduce((sum, item) => sum + item.paid_amount, 0);
    
    // Get current and last month in YYYY-MM format
    const today = new Date();
    const currentMonth = today.toISOString().substring(0, 7);
    
    // Get last month
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth());
    const lastMonth = lastMonthDate.toISOString().substring(0, 7);
    
    // Find revenue for current and last month
    const currentMonthData = monthlyRevenue.find(m => m.month === currentMonth);
    const lastMonthData = monthlyRevenue.find(m => m.month === lastMonth);
    
    // Calculate percentage increase
    let percentageIncrease = 0;
    if (lastMonthData?.total && currentMonthData?.total) {
        percentageIncrease = ((currentMonthData.total - lastMonthData.total) / lastMonthData.total) * 100;
    }

    return {
        totalRevenue,
        currentMonthRevenue: currentMonthData?.total || 0,
        lastMonthRevenue: lastMonthData?.total || 0,
        percentageIncrease,
        monthlyRevenue
    };
};

const groupEntriesByDay = (entries: RevenueEntry[]) => {
    const dailyGroups = entries.reduce((groups, entry) => {
        const date = entry.posting_date;
        if (!groups[date]) {
            groups[date] = 0;
        }
        groups[date] += entry.paid_amount;
        return groups;
    }, {} as Record<string, number>);

    return Object.entries(dailyGroups)
        .map(([date, total]) => ({
            date,
            value: total
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
};

export const processDataForChart = (monthlyRevenue: MonthlyRevenue[], timeRange: TimeRange = '12 months') => {

    switch (timeRange) {
        case '12 months':
            return monthlyRevenue.map(month => (
                {
                    name: new Date(month.month + '-01').toLocaleString('default', { month: 'short' }),
                    value: month.total,
                    orderCount: month.entries.length,
                    // totalQty: month.entries.reduce((sum, entry) => sum + entry.total_qty, 0)
                }
            ));

        case '30 days': {
            // Get all entries from the last month and current month
            const allEntries = monthlyRevenue.flatMap(month => month.entries);

            const sortedEntries = allEntries.sort((a, b) => b.posting_date.localeCompare(a.posting_date));

            // Get unique dates and sum values for each date
            const last30Days = groupEntriesByDay(sortedEntries.slice(0, 30));

            return last30Days.map(day => ({
                name: new Date(day.date).getDate().toString(),
                value: day.value
            }));
        }

        case '7 days': {
            // Get all entries from the current month
            const allEntries = monthlyRevenue.flatMap(month => month.entries);
            const sortedEntries = allEntries.sort((a, b) => b.posting_date.localeCompare(a.posting_date));
            
            // Get unique dates and sum values for each date
            const last7Days = groupEntriesByDay(sortedEntries.slice(0, 7));

            return last7Days.map(day => ({
                name: new Date(day.date).getDate().toString(),
                value: day.value
            }));
        }

        default:
            return monthlyRevenue.map(month => ({
                name: new Date(month.month + '-01').toLocaleString('default', { month: 'short' }),
                value: month.total
            }));
    }
}; 