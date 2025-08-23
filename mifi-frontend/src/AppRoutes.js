import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { AddTransaction } from './pages/AddTransaction';
import { Analytics } from './pages/Analytics';
import { Transactions } from './pages/Transactions';
import { Budget } from './pages/Budget';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddTransaction />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budget />} />
        </Routes>
    )
}

