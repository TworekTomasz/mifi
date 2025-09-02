import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    CalendarIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export const Transactions = () => {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
    const [sortBy, setSortBy] = useState('date'); // 'date', 'amount', 'title'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
    
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

    // Group transactions by month and transform data format
    const transactionsByMonth = useMemo(() => {
        if (!allTransactions) return {};
        
        const grouped = {};
        
        allTransactions.forEach(transaction => {
            // Extract date and create month key
            const transactionDate = new Date(transaction.date || transaction.createdAt || transaction.timestamp);
            const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (!grouped[monthKey]) {
                grouped[monthKey] = [];
            }
            
            // Use title field and clean it up
            let cleanTitle = transaction.title || transaction.description || transaction.name || 'Unknown Transaction';
            
            // Remove the part after "DATA TRANSAKCJI:" if it exists
            const dataTransakcjiIndex = cleanTitle.indexOf('DATA TRANSAKCJI:');
            if (dataTransakcjiIndex !== -1) {
                cleanTitle = cleanTitle.substring(0, dataTransakcjiIndex).trim();
            }
            
            // Transform backend data to match our frontend format
            grouped[monthKey].push({
                id: transaction.id,
                date: transaction.date || transaction.createdAt || transaction.timestamp,
                title: cleanTitle,
                type: transaction.type?.toLowerCase() === 'income' ? 'income' : 'expense',
                amount: Math.abs(transaction.amount || 0),
                category: transaction.category || 'Other',
                bank: transaction.bank || 'Unknown'
            });
        });
        
        // Sort transactions within each month by date (newest first)
        Object.keys(grouped).forEach(monthKey => {
            grouped[monthKey].sort((a, b) => new Date(b.date) - new Date(a.date));
        });
        
        return grouped;
    }, [allTransactions]);

    // Get transactions for selected month with filters
    const filteredTransactions = useMemo(() => {
        let transactions = transactionsByMonth[selectedMonth] || [];
        console.log('Transactionsss', transactions)
        // Apply search filter
        if (searchTerm) {
            transactions = transactions.filter(transaction =>
                transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.bank.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply type filter
        if (filterType !== 'all') {
            transactions = transactions.filter(transaction => transaction.type === filterType);
        }
        
        // Apply sorting
        transactions = [...transactions].sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'amount':
                    comparison = a.amount - b.amount;
                    break;
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'date':
                default:
                    comparison = new Date(a.date) - new Date(b.date);
                    break;
            }
            
            return sortOrder === 'desc' ? -comparison : comparison;
        });
        
        return transactions;
    }, [transactionsByMonth, selectedMonth, searchTerm, filterType, sortBy, sortOrder]);
    
    // Calculate summary statistics for selected month
    const summary = useMemo(() => {
        const transactions = transactionsByMonth[selectedMonth] || [];
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return {
            income,
            expenses,
            balance: income - expenses,
            transactionCount: transactions.length
        };
    }, [transactionsByMonth, selectedMonth]);
    
    // Month navigation
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
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    };

    const handleSort = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
                            <p className="text-gray-600">View and manage all your financial transactions</p>
                        </div>
                        <Link
                            to="/add"
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Transaction
                        </Link>
                    </div>
                </div>

                {/* Month Selector */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <CalendarIcon className="h-6 w-6 text-gray-500" />
                            <h2 className="text-xl font-semibold text-gray-900">
                                {formatMonthDisplay(selectedMonth)}
                            </h2>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                aria-label="Previous month"
                            >
                                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                            </button>
                            <button
                                onClick={() => {
                                    const now = new Date();
                                    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                                    setSelectedMonth(currentMonth);
                                }}
                                className="px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Go to current month"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                aria-label="Next month"
                            >
                                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                            </button>
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

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        
                        {/* Type Filter */}
                        <div className="flex items-center space-x-2">
                            <FunnelIcon className="h-5 w-5 text-gray-500" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="all">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expenses</option>
                            </select>
                        </div>
                        
                        {/* Export Button */}
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-500" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {filteredTransactions.length} of {summary.transactionCount} transactions shown
                        </p>
                    </div>
                    
                    {filteredTransactions.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <CalendarIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchTerm || filterType !== 'all' ? 'No matching transactions' : 'No transactions found'}
                            </h3>
                            <p className="text-gray-500">
                                {searchTerm || filterType !== 'all' 
                                    ? 'Try adjusting your search or filter criteria.' 
                                    : 'No transactions were recorded for this month.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('date')}
                                        >
                                            Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-1/3"
                                            onClick={() => handleSort('title')}
                                        >
                                            Description {sortBy === 'title' && (sortOrder === 'desc' ? '↓' : '↑')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th 
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('amount')}
                                        >
                                            Amount {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(transaction.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={transaction.title}>
                                                    {transaction.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full truncate max-w-24" title={transaction.category}>
                                                    {transaction.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full truncate max-w-20" title={transaction.bank}>
                                                    {transaction.bank}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                    transaction.type === 'income' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className={`text-sm font-semibold ${
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
            </div>
        </div>
    );
};

