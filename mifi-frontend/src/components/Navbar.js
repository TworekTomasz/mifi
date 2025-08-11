import { Link, useLocation } from 'react-router-dom';
import { 
    HomeIcon, 
    CreditCardIcon, 
    ChartBarIcon, 
    CalculatorIcon,
    BuildingLibraryIcon,
    DocumentChartBarIcon,
    TrophyIcon,
    CogIcon,
    QuestionMarkCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useSidebar } from '../contexts/SidebarContext';

export const Navbar = () => {
    const { isCollapsed, toggleSidebar } = useSidebar();
    const location = useLocation();

    const navigationItems = [
        { path: '/', name: 'Dashboard', icon: HomeIcon },
        { path: '/transactions', name: 'Transactions', icon: CreditCardIcon },
        { path: '/analytics', name: 'Analytics', icon: ChartBarIcon },
        { path: '/budgets', name: 'Budgets', icon: CalculatorIcon },
        { path: '/accounts', name: 'Accounts', icon: BuildingLibraryIcon },
        { path: '/reports', name: 'Reports', icon: DocumentChartBarIcon },
        { path: '/goals', name: 'Goals', icon: TrophyIcon },
        { path: '/settings', name: 'Settings', icon: CogIcon },
    ];

    const isActiveRoute = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out z-50 ${
            isCollapsed ? 'w-16' : 'w-64'
        }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {!isCollapsed && (
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <span className="font-semibold text-gray-900">MiFi</span>
                    </div>
                )}
                <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? (
                        <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                        <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
                    )}
                </button>
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col p-2 space-y-1">
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(item.path);
                    
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                                isActive
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                            title={isCollapsed ? item.name : ''}
                        >
                            <Icon className={`h-5 w-5 flex-shrink-0 ${
                                isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'
                            }`} />
                            {!isCollapsed && (
                                <span className="font-medium text-sm truncate">
                                    {item.name}
                                </span>
                            )}
                            {isCollapsed && isActive && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Footer */}
            {!isCollapsed && (
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <Link 
                        to="/help" 
                        className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <QuestionMarkCircleIcon className="h-5 w-5" />
                        <span className="text-sm">Help & Support</span>
                    </Link>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium text-sm">JD</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                                <p className="text-xs text-gray-500 truncate">john@example.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};