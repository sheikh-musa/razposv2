import { RevenueEntry, MonthlyRevenue } from '../context/types/ERPNext';

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

export const processDataForChart = (monthlyRevenue: MonthlyRevenue[]) => {
    return monthlyRevenue.map(month => ({
        name: new Date(month.month + '-01').toLocaleString('default', { month: 'short' }),
        value: month.total
    }));
}; 