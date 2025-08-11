import { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline';

// Mock data generator
const generateMockData = () => {
    const data = {};
    const categories = {
        expense: ['Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities', 'Health', 'Entertainment', 'Travel'],
        income: ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other Income']
    };
    
    // Generate data for the last 6 months
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
        const date = new Date();
        date.setMonth(date.getMonth() - monthOffset);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        data[monthKey] = [];
        
        // Generate 15-25 transactions per month
        const transactionCount = Math.floor(Math.random() * 11) + 15;
        
        for (let i = 0; i < transactionCount; i++) {
            const isIncome = Math.random() > 0.7; // 30% chance of income
            const type = isIncome ? 'income' : 'expense';
            const category = categories[type][Math.floor(Math.random() * categories[type].length)];
            
            // Generate random day in the month
            const transactionDate = new Date(date.getFullYear(), date.getMonth(), Math.floor(Math.random() * 28) + 1);
            
            data[monthKey].push({
                id: `${monthKey}-${i}`,
                date: transactionDate.toISOString().split('T')[0],
                title: category,
                type: type,
                amount: isIncome 
                    ? Math.floor(Math.random() * 5000) + 500  // Income: 500-5500
                    : Math.floor(Math.random() * 300) + 10    // Expense: 10-310
            });
        }
        
        // Sort by date (newest first)
        data[monthKey].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    return data;
};

export const Home = () => {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    
    const mockData = useMemo(() => generateMockData(), []);
    const transactions = mockData[selectedMonth] || [];
    
    // Calculate summary statistics
    const summary = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return {
            income,
            expenses,
            balance: income - expenses,
            transactionCount: transactions.length
        };
    }, [transactions]);
    
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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Overview</h1>
                    <p className="text-gray-600">Track your income and expenses month by month</p>
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

                {/* Transactions Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
                        <p className="text-sm text-gray-500 mt-1">{transactions.length} transactions this month</p>
                    </div>
                    
                    {transactions.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <CalendarIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                            <p className="text-gray-500">No transactions were recorded for this month.</p>
                        </div>
                    ) : (
            <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(transaction.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{transaction.title}</div>
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
