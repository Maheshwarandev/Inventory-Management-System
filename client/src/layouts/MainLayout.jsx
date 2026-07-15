import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
    LayoutDashboard, Package, Tags, Truck, Users,
    ShoppingCart, Receipt, Archive, FileText, Settings,
    LogOut, Menu, X, Box, Bell, Search, CreditCard, ChevronDown, Sun, Moon
} from 'lucide-react';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const location = useLocation();
    const notifRef = useRef(null);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await api.get('/inventory/low-stock');
                setLowStockAlerts(res.data);
            } catch (err) { console.error('Failed to load notifications'); }
        };
        if (user) fetchAlerts();

        // Close dropdown when clicking outside
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [user]);

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'employee'] },
        { path: '/products', icon: Package, label: 'Products', roles: ['admin', 'employee'] },
        { path: '/categories', icon: Tags, label: 'Categories', roles: ['admin'] },
        { path: '/suppliers', icon: Truck, label: 'Suppliers', roles: ['admin'] },
        { path: '/customers', icon: Users, label: 'Customers', roles: ['admin', 'employee'] },
        { path: '/purchases', icon: ShoppingCart, label: 'Purchases', roles: ['admin', 'employee'] },
        { path: '/sales', icon: Receipt, label: 'Sales', roles: ['admin', 'employee'] },
        { path: '/inventory', icon: Archive, label: 'Stock Control', roles: ['admin', 'employee'] },
        { path: '/payments', icon: CreditCard, label: 'Payments', roles: ['admin', 'employee'] },
        { path: '/reports', icon: FileText, label: 'Reports', roles: ['admin', 'employee'] },
        { path: '/users', icon: Users, label: 'Users', roles: ['admin'] },
        { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || 'employee'));
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 lg:hidden animate-fade-in"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-30 h-screen w-[260px] bg-sidebar text-slate-400 flex flex-col
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.06]">
                    <Link to="/dashboard" className="flex items-center gap-2.5 text-white">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                            <img src="/logo.png" alt="IMS Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-[15px] tracking-tight">IMS Pro</span>
                    </Link>
                    <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
                    {filteredMenu.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                                    isActive
                                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                                        : 'text-slate-400 hover:bg-sidebar-hover hover:text-slate-200'
                                }`}
                            >
                                <Icon className="w-[18px] h-[18px] shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User section at bottom */}
                <div className="p-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 px-3 py-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 font-bold text-xs uppercase shrink-0">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{user?.role || 'employee'}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                            title="Log out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px] transition-all">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                        <button onClick={toggleSidebar} className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1">
                            <Menu className="w-5 h-5" />
                        </button>
                        {/* Search */}
                        <div className="hidden sm:flex relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="w-72 pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/80 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button 
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                {lowStockAlerts.length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {notificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in origin-top-right">
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Notifications</h3>
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300">{lowStockAlerts.length} New</span>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {lowStockAlerts.length > 0 ? (
                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {lowStockAlerts.map((item, idx) => (
                                                    <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <div className="flex gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                                                <Archive className="w-4 h-4 text-red-500 dark:text-red-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Low Stock Alert</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name}</span> has only {item.stock_qty} left in stock.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="px-4 py-8 text-center">
                                                <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                                <p className="text-sm text-slate-500 dark:text-slate-400">You're all caught up!</p>
                                            </div>
                                        )}
                                    </div>
                                    {lowStockAlerts.length > 0 && (
                                        <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                            <Link to="/inventory" onClick={() => setNotificationsOpen(false)} className="block w-full text-center text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 py-2 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-lg transition-colors">
                                                View Inventory
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

                        {/* User */}
                        <div className="hidden sm:flex items-center gap-2.5 pl-1">
                            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-xs uppercase">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">{user?.name}</p>
                                <p className="text-[11px] text-slate-400 capitalize">{user?.role || 'employee'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
