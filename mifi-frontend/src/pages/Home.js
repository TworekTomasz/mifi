import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export const Home = () => {
    const [viewMode, setViewMode] = useState('year'); // 'year' or 'month'
    const [selectedYear, setSelectedYear] = useState(() => {
        const now = new Date();
        return now.getFullYear();
    });
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    
    // Fetch transactions from backend
    const { data: allTransactions, isLoading, error } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            try {
                const response = await fetch('http://localhost:8080/transactions');
                if (!response.ok) {
                    console.error('API Error:', {
                        status: response.status,
                        statusText: response.statusText,
                        url: response.url
                    });
                    throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                
                // Log the response to understand the structure
                console.log('Backend response:', data);
                console.log('Number of transactions:', data.length);
                if (data.length > 0) {
                    console.log('Sample transaction structure:', data[0]);
                }
                
                return data;
            } catch (err) {
                console.error('Error fetching transactions:', err);
                throw err;
            }
        }
    });

    // Process transactions based on view mode
    const { transactions, summary } = useMemo(() => {
        if (!allTransactions) return { transactions: [], summary: { income: 0, expenses: 0, balance: 0, transactionCount: 0 } };
        
        let filteredTransactions = [];
        
        if (viewMode === 'year') {
            // Filter transactions by selected year
            filteredTransactions = allTransactions.filter(transaction => {
                const transactionDate = new Date(transaction.date || transaction.createdAt || transaction.timestamp);
                return transactionDate.getFullYear() === selectedYear;
            });
        } else {
            // Filter transactions by selected month
            filteredTransactions = allTransactions.filter(transaction => {
                const transactionDate = new Date(transaction.date || transaction.createdAt || transaction.timestamp);
                const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
                return monthKey === selectedMonth;
            });
        }
        
        // Transform and sort transactions
        const transformedTransactions = filteredTransactions
            .map(transaction => {
                // Use title field and clean it up
                let cleanTitle = transaction.title || transaction.description || transaction.name || 'Unknown Transaction';
                
                // Remove the part after "DATA TRANSAKCJI:" if it exists
                const dataTransakcjiIndex = cleanTitle.indexOf('DATA TRANSAKCJI:');
                if (dataTransakcjiIndex !== -1) {
                    cleanTitle = cleanTitle.substring(0, dataTransakcjiIndex).trim();
                }
                
                return {
                    id: transaction.id,
                    date: transaction.date || transaction.createdAt || transaction.timestamp,
                    title: cleanTitle,
                    type: transaction.type?.toLowerCase() === 'income' ? 'income' : 'expense',
                    amount: Math.abs(transaction.amount || 0),
                    bank: transaction.bank || 'Unknown'
                };
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Calculate summary
        const income = transformedTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transformedTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        return {
            transactions: transformedTransactions,
            summary: {
                income,
                expenses,
                balance: income - expenses,
                transactionCount: transformedTransactions.length
            }
        };
    }, [allTransactions, viewMode, selectedYear, selectedMonth]);
    
    // Navigation functions
    const navigateYear = (direction) => {
        setSelectedYear(prev => prev + direction);
    };
    
    const navigateMonth = (direction) => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 1);
        date.setMonth(date.getMonth() + direction);
        const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonth(newMonth);
    };
    
    const navigate = (direction) => {
        if (viewMode === 'year') {
            navigateYear(direction);
        } else {
            navigateMonth(direction);
        }
    };
    
    const formatMonthDisplay = (monthKey) => {
        const [year, month] = monthKey.split('-').map(Number);
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };
    
    const formatCurrentPeriod = () => {
        if (viewMode === 'year') {
            return selectedYear.toString();
        } else {
            return formatMonthDisplay(selectedMonth);
        }
    };
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-900">Loading transactions...</h3>
                    <p className="text-gray-500">Fetching data from backend</p>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load transactions</h3>
                    <p className="text-gray-500 mb-4">{error.message}</p>
                    <p className="text-sm text-gray-400">
                        Make sure your backend is running on http://localhost:8080
                    </p>
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Overview</h1>
                    <p className="text-gray-600">Track your income and expenses by year or month</p>
                </div>

                {/* Period Selector */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <CalendarIcon className="h-6 w-6 text-gray-500" />
                            <h2 className="text-xl font-semibold text-gray-900">
                                {formatCurrentPeriod()}
                            </h2>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('year')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                        viewMode === 'year'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Year
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
                            
                            {/* Navigation */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                    aria-label={viewMode === 'year' ? 'Previous year' : 'Previous month'}
                                >
                                    <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => navigate(1)}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                    aria-label={viewMode === 'year' ? 'Next year' : 'Next month'}
                                >
                                    <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100">
                                <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Income</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.income)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-red-100">
                                <div className="w-6 h-6 bg-red-600 rounded-full"></div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.expenses)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-full ${summary.balance >= 0 ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                                <div className={`w-6 h-6 rounded-full ${summary.balance >= 0 ? 'bg-blue-600' : 'bg-yellow-600'}`}></div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Net Balance</p>
                                <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                                    {formatCurrency(summary.balance)}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-gray-100">
                                <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Transactions</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.transactionCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                        <Link
                            to="/transactions"
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
                        >
                            View all
                            <ArrowRightIcon className="h-4 w-4 ml-1" />
                        </Link>
                    </div>
                    
                    {transactions.length === 0 ? (
                        <div className="text-center py-8">
                            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No transactions found for this period.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                                        <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.slice(0, 10).map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="py-3 text-sm text-gray-900">
                                                {new Date(transaction.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="py-3 text-sm text-gray-900 truncate max-w-xs">
                                                {transaction.title}
                                            </td>
                                            <td className="py-3 text-sm">
                                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                    {transaction.bank}
                                                </span>
                                            </td>
                                            <td className="py-3 text-sm">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    transaction.type === 'income' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-sm text-right">
                                                <span className={`font-semibold ${
                                                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link
                            to="/add"
                            className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Add Transaction
                        </Link>
                        <Link
                            to="/transactions"
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            View Transactions
                        </Link>
                        <Link
                            to="/analytics"
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            View Analytics
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
