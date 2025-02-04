import { Link } from 'react-router-dom';
import './Navbar.css';

export const Navbar = () => {
    return (
        <nav className="bg-gray-800 text-white p-4">
            <ul className="flex gap-4">
                <li><Link className="hover:text-gray-300" to="/">Home</Link></li>
                <li><Link className="hover:text-gray-300" to="/add">Add transaction</Link></li>
            </ul>
        </nav>
    );
};