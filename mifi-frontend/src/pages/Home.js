import { useQuery } from "@tanstack/react-query";

export const Home = () => {
    const { data: transactions, isLoading, error } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            try {
                const response = await fetch('http://192.168.1.6:8080/transactions');
                if (!response.ok) {
                    console.error('API Error:', {
                        status: response.status,
                        statusText: response.statusText,
                        url: response.url
                    });
                    throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
                }
                return response.json();
            } catch (err) {
                if (err instanceof TypeError && err.message === 'Failed to fetch') {
                    console.error('Connection Error: Server might be down or unreachable');
                } else {
                    console.error('Unexpected Error:', err);
                }
                throw err;
            }
        }
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Transactions</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(transaction.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {transaction.description || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {transaction.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        transaction.type === 'INCOME' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {transaction.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                                        ${transaction.amount.toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {transaction.accountId}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
