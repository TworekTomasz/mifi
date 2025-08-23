import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import { CalendarIcon, ArrowTrendingUpIcon, ChartPieIcon, ChartBarIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export const Analytics = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('12months');
    const [viewMode, setViewMode] = useState('period'); // 'period' or 'month'
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isCategoryAnalysisExpanded, setIsCategoryAnalysisExpanded] = useState(false);
    
    // Category color scheme - moved before useMemo to avoid initialization error
    const getCategoryColor = (category) => {
        const colors = {
            'GROCERIES': '#22c55e',           // Green - Essential food
            'ZABKA': '#10b981',               // Emerald - Convenience store
            'PHARMACY': '#06b6d4',            // Cyan - Health/medical
            'FUEL': '#f59e0b',                // Amber - Energy/fuel
            'PARKING_TOLLS': '#8b5cf6',       // Purple - Transportation costs
            'TRANSPORT_RIDEHAIL': '#a855f7',  // Violet - Ride services
            'FAST_FOOD': '#ef4444',           // Red - Quick meals
            'RESTAURANT': '#dc2626',          // Dark red - Dining out
            'CAFE': '#f97316',                // Orange - Coffee/beverages
            'DESSERTS': '#ec4899',            // Pink - Sweet treats
            'ENTERTAINMENT': '#8b5cf6',       // Purple - Fun activities
            'SUBSCRIPTION': '#6366f1',        // Indigo - Digital services
            'HOME_GOODS': '#84cc16',          // Lime - Home items
            'BEAUTY_PERSONAL_CARE': '#d946ef', // Fuchsia - Personal care
            'FLOWERS_GIFTS': '#f43f5e',       // Rose - Special occasions
            'GOVERNMENT_FEES': '#6b7280',     // Gray - Official fees
            'FITNESS_WELLNESS': '#14b8a6',    // Teal - Health/fitness
            'ONLINE_SERVICES': '#3b82f6',     // Blue - Web services
            'TRANSFER': '#64748b',            // Slate - Money transfers
            'UNKNOWN': '#9ca3af',             // Light gray - Uncategorized
            'Other': '#9ca3af'                // Light gray - Fallback
        };
        
        return colors[category] || colors['Other'];
    };
    
    // Fetch transactions from backend
    const { data: allTransactions, isLoading, error } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            try {
                const response = await fetch('http://localhost:8080/transactions');
                if (!response.ok) {
                    throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                return data;
            } catch (err) {
                console.error('Error fetching transactions:', err);
                throw err;
            }
        }
    });

    // Transform data for charts
    const chartData = useMemo(() => {
        if (!allTransactions) return null;

        if (viewMode === 'month') {
            // Single month view - show daily breakdown
            const dailyData = {};
            const [year, month] = selectedMonth.split('-').map(Number);
            const daysInMonth = new Date(year, month, 0).getDate();
            
            // Initialize all days of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const dayKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                dailyData[dayKey] = {
                    label: String(day),
                    income: 0,
                    expenses: 0,
                    transactions: []
                };
            }

            // Process transactions for the selected month
            const categoryTotals = {};
            allTransactions.forEach(transaction => {
                const transactionDate = new Date(transaction.date || transaction.createdAt || transaction.timestamp);
                const transactionMonthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
                
                if (transactionMonthKey === selectedMonth) {
                    const dayKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}-${String(transactionDate.getDate()).padStart(2, '0')}`;
                    
                    if (dailyData[dayKey]) {
                        const amount = Math.abs(transaction.amount || 0);
                        const isIncome = transaction.type?.toLowerCase() === 'income';
                        
                        if (isIncome) {
                            dailyData[dayKey].income += amount;
                        } else {
                            dailyData[dayKey].expenses += amount;
                            
                            // Categorize expenses for pie chart
                            const category = transaction.category || 'Other';
                            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
                        }
                        
                        // Use title field and clean it up
                        let cleanTitle = transaction.title || transaction.description || transaction.name || 'Unknown Transaction';
                        
                        // Remove the part after "DATA TRANSAKCJI:" if it exists
                        const dataTransakcjiIndex = cleanTitle.indexOf('DATA TRANSAKCJI:');
                        if (dataTransakcjiIndex !== -1) {
                            cleanTitle = cleanTitle.substring(0, dataTransakcjiIndex).trim();
                        }
                        
                        dailyData[dayKey].transactions.push({
                            ...transaction,
                            title: cleanTitle,
                            amount,
                            type: isIncome ? 'income' : 'expense'
                        });
                    }
                }
            });

            // Prepare data for charts (daily view)
            const days = Object.keys(dailyData).sort();
            const lineChartData = {
                xAxis: days.map(key => dailyData[key].label),
                series: [
                    {
                        id: 'income',
                        label: 'Income',
                        data: days.map(key => dailyData[key].income),
                        color: '#10b981'
                    },
                    {
                        id: 'expenses',
                        label: 'Expenses', 
                        data: days.map(key => dailyData[key].expenses),
                        color: '#ef4444'
                    }
                ]
            };

            const barChartData = {
                xAxis: days.map(key => dailyData[key].label),
                series: [
                    {
                        id: 'income',
                        label: 'Income',
                        data: days.map(key => dailyData[key].income),
                        color: '#10b981'
                    },
                    {
                        id: 'expenses',
                        label: 'Expenses',
                        data: days.map(key => dailyData[key].expenses),
                        color: '#ef4444'
                    }
                ]
            };

            const pieChartData = Object.entries(categoryTotals)
                .map(([category, amount], index) => ({
                    id: index,
                    value: amount,
                    label: category,
                    color: getCategoryColor(category)
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 8);

            const totalIncome = Object.values(dailyData).reduce((sum, day) => sum + day.income, 0);
            const totalExpenses = Object.values(dailyData).reduce((sum, day) => sum + day.expenses, 0);

            // Get all transactions for the selected month
            const allDayTransactions = Object.values(dailyData)
                .flatMap(day => day.transactions)
                .filter(t => t.type === 'expense'); // Only expenses for category filtering

            // First, calculate global active months (months with at least 10 transactions total)
            const globalMonthlyTotals = {};
            allTransactions.filter(t => t.type?.toLowerCase() !== 'income').forEach(transaction => {
                const transactionDate = new Date(transaction.date || transaction.createdAt || transaction.timestamp);
                const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
                
                if (!globalMonthlyTotals[monthKey]) {
                    globalMonthlyTotals[monthKey] = 0;
                }
                globalMonthlyTotals[monthKey] += 1;
            });
            
            // Count months with at least 10 transactions total
            const globalActiveMonthsCount = Object.values(globalMonthlyTotals).filter(count => count >= 10).length;

            // Calculate category averages (for the selected month - single month view)
            const categoryAverages = Object.entries(categoryTotals)
                .map(([category, total]) => {
                    const categoryTransactions = allDayTransactions.filter(t => (t.category || 'Other') === category);
                    
                    // Get all historical transactions for this category
                    const allCategoryTransactions = allTransactions.filter(t => {
                        const tCategory = t.category || 'Other';
                        const tType = t.type?.toLowerCase();
                        return tCategory === category && tType !== 'income';
                    });
                    
                    const totalCategoryAmount = allCategoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
                    
                    // Use the same global active months count for all categories
                    const averagePerMonth = globalActiveMonthsCount > 0 ? totalCategoryAmount / globalActiveMonthsCount : total;
                    
                    return {
                        category,
                        total,
                        averagePerMonth,
                        transactionCount: categoryTransactions.length,
                        activeMonthsCount: globalActiveMonthsCount,
                        color: getCategoryColor(category)
                    };
                })
                .sort((a, b) => b.total - a.total);

            return {
                lineChart: lineChartData,
                barChart: barChartData,
                pieChart: pieChartData,
                categoryTransactions: allDayTransactions,
                categoryAverages: categoryAverages,
                summary: {
                    totalIncome,
                    totalExpenses,
                    netSavings: totalIncome - totalExpenses,
                    avgMonthlyIncome: totalIncome,
                    avgMonthlyExpenses: totalExpenses,
                    savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0
                }
            };
        } else {
            // Period view - show monthly breakdown
            const monthlyData = {};
            const now = new Date();
            const monthsToShow = selectedPeriod === '6months' ? 6 : 12;
            
            // Initialize last N months
            for (let i = monthsToShow - 1; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                monthlyData[monthKey] = {
                    label: monthLabel,
                    income: 0,
                    expenses: 0,
                    transactions: []
                };
            }

            // Process transactions
            const categoryTotals = {};
            
            allTransactions.forEach(transaction => {
                const transactionDate = new Date(transaction.date || transaction.createdAt || transaction.timestamp);
                const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
                
                if (monthlyData[monthKey]) {
                    const amount = Math.abs(transaction.amount || 0);
                    const isIncome = transaction.type?.toLowerCase() === 'income';
                    
                    if (isIncome) {
                        monthlyData[monthKey].income += amount;
                    } else {
                        monthlyData[monthKey].expenses += amount;
                        
                        // Categorize expenses for pie chart
                        const category = transaction.category || 'Other';
                        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
                    }
                    
                    // Use title field and clean it up
                    let cleanTitle = transaction.title || transaction.description || transaction.name || 'Unknown Transaction';
                    
                    // Remove the part after "DATA TRANSAKCJI:" if it exists
                    const dataTransakcjiIndex = cleanTitle.indexOf('DATA TRANSAKCJI:');
                    if (dataTransakcjiIndex !== -1) {
                        cleanTitle = cleanTitle.substring(0, dataTransakcjiIndex).trim();
                    }
                    
                    monthlyData[monthKey].transactions.push({
                        ...transaction,
                        title: cleanTitle,
                        amount,
                        type: isIncome ? 'income' : 'expense'
                    });
                }
            });

            // Prepare data for line chart (monthly trends)
            const months = Object.keys(monthlyData).sort();
            const lineChartData = {
                xAxis: months.map(key => monthlyData[key].label),
                series: [
                    {
                        id: 'income',
                        label: 'Income',
                        data: months.map(key => monthlyData[key].income),
                        color: '#10b981'
                    },
                    {
                        id: 'expenses',
                        label: 'Expenses', 
                        data: months.map(key => monthlyData[key].expenses),
                        color: '#ef4444'
                    }
                ]
            };

            // Prepare data for bar chart (monthly comparison)
            const barChartData = {
                xAxis: months.map(key => monthlyData[key].label),
                series: [
                    {
                        id: 'income',
                        label: 'Income',
                        data: months.map(key => monthlyData[key].income),
                        color: '#10b981'
                    },
                    {
                        id: 'expenses',
                        label: 'Expenses',
                        data: months.map(key => monthlyData[key].expenses),
                        color: '#ef4444'
                    }
                ]
            };

            // Prepare data for pie chart (expense categories)
            const pieChartData = Object.entries(categoryTotals)
                .map(([category, amount], index) => ({
                    id: index,
                    value: amount,
                    label: category,
                    color: getCategoryColor(category)
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 8); // Show top 8 categories

            // Get all transactions for the selected period
            const allPeriodTransactions = Object.values(monthlyData)
                .flatMap(month => month.transactions)
                .filter(t => t.type === 'expense'); // Only expenses for category filtering

            // First, calculate global active months (months with at least 10 transactions total)
            const globalMonthlyTotals = {};
            allTransactions.filter(t => t.type?.toLowerCase() !== 'income').forEach(transaction => {
                const transactionDate = new Date(transaction.date || transaction.createdAt || transaction.timestamp);
                const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
                
                if (!globalMonthlyTotals[monthKey]) {
                    globalMonthlyTotals[monthKey] = 0;
                }
                globalMonthlyTotals[monthKey] += 1;
            });
            
            // Count months with at least 10 transactions total
            const globalActiveMonthsCount = Object.values(globalMonthlyTotals).filter(count => count >= 10).length;

            // Calculate category averages (for the selected period)
            const categoryAverages = Object.entries(categoryTotals)
                .map(([category, total]) => {
                    const categoryTransactions = allPeriodTransactions.filter(t => (t.category || 'Other') === category);
                    
                    // Get all historical transactions for this category
                    const allCategoryTransactions = allTransactions.filter(t => {
                        const tCategory = t.category || 'Other';
                        const tType = t.type?.toLowerCase();
                        return tCategory === category && tType !== 'income';
                    });
                    
                    const totalCategoryAmount = allCategoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
                    
                    // Use the same global active months count for all categories
                    const averagePerMonth = globalActiveMonthsCount > 0 ? totalCategoryAmount / globalActiveMonthsCount : (total / monthsToShow);
                    
                    return {
                        category,
                        total,
                        averagePerMonth,
                        transactionCount: categoryTransactions.length,
                        activeMonthsCount: globalActiveMonthsCount,
                        color: getCategoryColor(category)
                    };
                })
                .sort((a, b) => b.total - a.total);

            // Calculate summary statistics
            const totalIncome = Object.values(monthlyData).reduce((sum, month) => sum + month.income, 0);
            const totalExpenses = Object.values(monthlyData).reduce((sum, month) => sum + month.expenses, 0);
            const avgMonthlyIncome = totalIncome / monthsToShow;
            const avgMonthlyExpenses = totalExpenses / monthsToShow;

            return {
                lineChart: lineChartData,
                barChart: barChartData,
                pieChart: pieChartData,
                categoryTransactions: allPeriodTransactions,
                categoryAverages: categoryAverages,
                summary: {
                    totalIncome,
                    totalExpenses,
                    netSavings: totalIncome - totalExpenses,
                    avgMonthlyIncome,
                    avgMonthlyExpenses,
                    savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0
                }
            };
        }
    }, [allTransactions, selectedPeriod, viewMode, selectedMonth]);

    // Calculate overall monthly averages since 01.01.2025
    const overallAverages = useMemo(() => {
        if (!allTransactions) return { avgMonthlyIncome: 0, avgMonthlyExpenses: 0, monthsActive: 0 };

        const startDate = new Date('2025-01-01');
        const now = new Date();
        
        // Calculate number of months since start (including partial months)
        const yearDiff = now.getFullYear() - startDate.getFullYear();
        const monthDiff = now.getMonth() - startDate.getMonth();
        const dayDiff = now.getDate() - startDate.getDate();
        
        let monthsActive = yearDiff * 12 + monthDiff;
        if (dayDiff >= 0) {
            monthsActive += 1; // Include current month if we're past start day
        }
        
        // Filter transactions since 2025-01-01
        const transactionsSinceStart = allTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.date || transaction.createdAt || transaction.timestamp);
            return transactionDate >= startDate;
        });

        // Calculate totals
        const totalIncome = transactionsSinceStart
            .filter(t => t.type?.toLowerCase() === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
            
        const totalExpenses = transactionsSinceStart
            .filter(t => t.type?.toLowerCase() !== 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

        return {
            avgMonthlyIncome: monthsActive > 0 ? totalIncome / monthsActive : 0,
            avgMonthlyExpenses: monthsActive > 0 ? totalExpenses / monthsActive : 0,
            monthsActive,
            totalIncome,
            totalExpenses
        };
    }, [allTransactions]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    };

    // Month navigation functions
    const navigateMonth = (direction) => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 1);
        date.setMonth(date.getMonth() + direction);
        const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonth(newMonth);
    };

    const formatMonthDisplay = (monthKey) => {
        const [year, month] = monthKey.split('-').map(Number);
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Handle pie chart category selection
    const handleCategoryClick = (event, itemIdentifier, item) => {
        if (item && item.label) {
            setSelectedCategory(selectedCategory === item.label ? null : item.label);
        }
    };

    // Filter transactions by selected category
    const filteredCategoryTransactions = useMemo(() => {
        if (!selectedCategory || !chartData?.categoryTransactions) return [];
        
        return chartData.categoryTransactions
            .filter(transaction => (transaction.category || 'Other') === selectedCategory)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [selectedCategory, chartData?.categoryTransactions]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-900">Loading analytics...</h3>
                    <p className="text-gray-500">Preparing your financial insights</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-red-600 text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load analytics</h3>
                    <p className="text-gray-500 mb-4">{error.message}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!chartData) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Analytics</h1>
                            <p className="text-gray-600">Visualize your financial patterns and trends</p>
                        </div>
                        
                        {/* View Mode and Period Selector */}
                        <div className="flex items-center space-x-4">
                            <CalendarIcon className="h-5 w-5 text-gray-500" />
                            
                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('period')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                        viewMode === 'period'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Period
                                </button>
                                <button
                                    onClick={() => setViewMode('month')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                        viewMode === 'month'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Month
                                </button>
                            </div>
                            
                            {/* Period Selector or Month Navigation */}
                            {viewMode === 'period' ? (
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="6months">Last 6 Months</option>
                                    <option value="12months">Last 12 Months</option>
                                </select>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => navigateMonth(-1)}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                        aria-label="Previous month"
                                    >
                                        <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                                    </button>
                                    <span className="px-3 py-2 text-sm font-medium text-gray-900 min-w-[140px] text-center">
                                        {formatMonthDisplay(selectedMonth)}
                                    </span>
                                    <button
                                        onClick={() => navigateMonth(1)}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                        aria-label="Next month"
                                    >
                                        <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100">
                                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Income</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(chartData.summary.totalIncome)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-red-100">
                                <ArrowTrendingUpIcon className="h-6 w-6 text-red-600 rotate-180" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                                <p className="text-2xl font-bold text-red-600">{formatCurrency(chartData.summary.totalExpenses)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-full ${chartData.summary.netSavings >= 0 ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                                <div className={`w-6 h-6 rounded-full ${chartData.summary.netSavings >= 0 ? 'bg-blue-600' : 'bg-yellow-600'}`}></div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Net Savings</p>
                                <p className={`text-2xl font-bold ${chartData.summary.netSavings >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                                    {formatCurrency(chartData.summary.netSavings)}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-purple-100">
                                <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {chartData.summary.savingsRate.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Income vs Expenses Trend */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center mb-6">
                            <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-600 mr-3" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                {viewMode === 'month' ? 'Daily Income vs Expenses' : 'Income vs Expenses Trend'}
                            </h3>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <LineChart
                                xAxis={[{
                                    scaleType: 'point',
                                    data: chartData.lineChart.xAxis
                                }]}
                                series={chartData.lineChart.series}
                                height={300}
                                margin={{ left: 50, right: 50, top: 50, bottom: 50 }}
                                sx={{
                                    '& .MuiLineElement-root': {
                                        strokeWidth: 3,
                                    },
                                }}
                            />
                        </div>
                    </div>

                    {/* Monthly Comparison */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center mb-6">
                            <ChartBarIcon className="h-6 w-6 text-indigo-600 mr-3" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                {viewMode === 'month' ? 'Daily Comparison' : 'Monthly Comparison'}
                            </h3>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <BarChart
                                xAxis={[{
                                    scaleType: 'band',
                                    data: chartData.barChart.xAxis
                                }]}
                                series={chartData.barChart.series}
                                height={300}
                                margin={{ left: 50, right: 50, top: 50, bottom: 50 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Expense Categories Pie Chart */}
                {chartData.pieChart.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <ChartPieIcon className="h-6 w-6 text-indigo-600 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Expense Categories</h3>
                            </div>
                            <p className="text-sm text-gray-500">Click on a category to view transactions</p>
                        </div>
                        <div className="flex justify-center">
                            <div 
                                style={{ 
                                    width: '100%', 
                                    height: 400,
                                    '--color-0': chartData.pieChart[0]?.color || '#ef4444',
                                    '--color-1': chartData.pieChart[1]?.color || '#22c55e',
                                    '--color-2': chartData.pieChart[2]?.color || '#3b82f6',
                                    '--color-3': chartData.pieChart[3]?.color || '#f59e0b',
                                    '--color-4': chartData.pieChart[4]?.color || '#8b5cf6',
                                    '--color-5': chartData.pieChart[5]?.color || '#06b6d4',
                                    '--color-6': chartData.pieChart[6]?.color || '#ec4899',
                                    '--color-7': chartData.pieChart[7]?.color || '#84cc16',
                                }}
                            >
                                <PieChart
                                    series={[{
                                        data: chartData.pieChart,
                                        highlightScope: { faded: 'global', highlighted: 'item' },
                                        faded: { innerRadius: 30, additionalRadius: -30 },
                                        valueFormatter: (item) => formatCurrency(item.value),
                                    }]}
                                    height={400}
                                    margin={{ right: 200 }}
                                    onItemClick={handleCategoryClick}
                                    sx={{
                                        '& .MuiPieArc-root[data-id="0"]': { fill: 'var(--color-0)' },
                                        '& .MuiPieArc-root[data-id="1"]': { fill: 'var(--color-1)' },
                                        '& .MuiPieArc-root[data-id="2"]': { fill: 'var(--color-2)' },
                                        '& .MuiPieArc-root[data-id="3"]': { fill: 'var(--color-3)' },
                                        '& .MuiPieArc-root[data-id="4"]': { fill: 'var(--color-4)' },
                                        '& .MuiPieArc-root[data-id="5"]': { fill: 'var(--color-5)' },
                                        '& .MuiPieArc-root[data-id="6"]': { fill: 'var(--color-6)' },
                                        '& .MuiPieArc-root[data-id="7"]': { fill: 'var(--color-7)' },
                                        '& .MuiChartsLegend-series text': {
                                            fill: 'currentColor !important',
                                        },
                                    }}
                                    slotProps={{
                                        legend: {
                                            direction: 'column',
                                            position: { vertical: 'middle', horizontal: 'right' },
                                            padding: 0,
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Averages */}
                {chartData.categoryAverages && chartData.categoryAverages.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                        {/* Collapsible Header */}
                        <div 
                            className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setIsCategoryAnalysisExpanded(!isCategoryAnalysisExpanded)}
                        >
                            <div className="flex items-center">
                                <ChartBarIcon className="h-6 w-6 text-indigo-600 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Category Spending Analysis</h3>
                                <span className="ml-2 text-sm text-gray-500">
                                    ({chartData.categoryAverages.length} categories)
                                </span>
                            </div>
                            <div className="flex items-center">
                                {isCategoryAnalysisExpanded ? (
                                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                                )}
                            </div>
                        </div>
                        
                        {/* Collapsible Content */}
                        {isCategoryAnalysisExpanded && (
                            <div className="px-6 pb-6 border-t border-gray-200">
                                <div className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {chartData.categoryAverages.map((categoryData, index) => (
                                            <div 
                                                key={index} 
                                                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => setSelectedCategory(selectedCategory === categoryData.category ? null : categoryData.category)}
                                                style={{
                                                    borderLeftColor: categoryData.color,
                                                    borderLeftWidth: '4px'
                                                }}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center">
                                                        <div 
                                                            className="w-3 h-3 rounded-full mr-2"
                                                            style={{ backgroundColor: categoryData.color }}
                                                        ></div>
                                                        <h4 className="font-medium text-gray-900">{categoryData.category}</h4>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {categoryData.transactionCount} transactions (÷{categoryData.activeMonthsCount} months)
                                                    </span>
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Total:</span>
                                                        <span className="font-semibold text-red-600">
                                                            {formatCurrency(categoryData.total)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Avg/Month:</span>
                                                        <span className="font-semibold text-blue-600">
                                                            {formatCurrency(categoryData.averagePerMonth)}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3 text-xs text-gray-500 text-center">
                                                    Click to view transactions
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Category Transactions Table */}
                {selectedCategory && filteredCategoryTransactions.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {selectedCategory} Transactions
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {filteredCategoryTransactions.length} transactions in this category
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Bank
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCategoryTransactions.map((transaction, index) => (
                                        <tr key={transaction.id || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(transaction.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {transaction.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                    {transaction.bank || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm font-semibold text-red-600">
                                                    -{formatCurrency(transaction.amount)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Averages */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {viewMode === 'month' ? 'Monthly Totals' : 'Monthly Averages'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-green-800">
                                    {viewMode === 'month' ? 'Total Income' : 'Average Monthly Income'}
                                </p>
                                <p className="text-xl font-bold text-green-600">{formatCurrency(chartData.summary.avgMonthlyIncome)}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-red-800">
                                    {viewMode === 'month' ? 'Total Expenses' : 'Average Monthly Expenses'}
                                </p>
                                <p className="text-xl font-bold text-red-600">{formatCurrency(chartData.summary.avgMonthlyExpenses)}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-full">
                                <ArrowTrendingUpIcon className="h-6 w-6 text-red-600 rotate-180" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overall Monthly Averages Since 2025 */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-sm border border-indigo-200 p-6">
                    <div className="flex items-center mb-4">
                        <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                            <CalendarIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Overall Monthly Averages</h3>
                            <p className="text-sm text-gray-600">Since January 1, 2025 ({overallAverages.monthsActive} months active)</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-800">Avg Monthly Income</p>
                                    <p className="text-xl font-bold text-green-600">{formatCurrency(overallAverages.avgMonthlyIncome)}</p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-full">
                                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-800">Avg Monthly Expenses</p>
                                    <p className="text-xl font-bold text-red-600">{formatCurrency(overallAverages.avgMonthlyExpenses)}</p>
                                </div>
                                <div className="p-2 bg-red-100 rounded-full">
                                    <ArrowTrendingUpIcon className="h-5 w-5 text-red-600 rotate-180" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Total Income</p>
                                    <p className="text-xl font-bold text-blue-600">{formatCurrency(overallAverages.totalIncome)}</p>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <div className="w-5 h-5 bg-blue-600 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-800">Total Expenses</p>
                                    <p className="text-xl font-bold text-purple-600">{formatCurrency(overallAverages.totalExpenses)}</p>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-full">
                                    <div className="w-5 h-5 bg-purple-600 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
                        <p className="text-sm text-gray-700 text-center">
                            <span className="font-medium">Net Monthly Average:</span> 
                            <span className={`ml-2 font-bold ${(overallAverages.avgMonthlyIncome - overallAverages.avgMonthlyExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(overallAverages.avgMonthlyIncome - overallAverages.avgMonthlyExpenses)}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
