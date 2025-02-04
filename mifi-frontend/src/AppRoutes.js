import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { AddTransaction } from './pages/AddTransaction';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddTransaction />} />
        </Routes>
    )
}

