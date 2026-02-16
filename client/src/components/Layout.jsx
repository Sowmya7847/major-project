import { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
    LayoutDashboard,
    Shield,
    Server,
    Activity,
    Settings,
    LogOut,
    Menu,
    Bell,
    Search,
    User,
    Lock
} from 'lucide-react';
import { cn } from '../lib/utils';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <Link
        to={path}
        className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
            active
                ? "bg-primary/10 text-primary border-r-2 border-primary"
                : "text-gray-400 hover:bg-surfaceHover hover:text-white"
        )}
    >
        <Icon size={20} className={cn("group-hover:scale-110 transition-transform", active && "text-primary")} />
        <span className="font-medium">{label}</span>
    </Link>
);

const Layout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Activity, label: 'Admin Console', path: '/admin' },
        { icon: Shield, label: 'Data Security', path: '/data-security' },
        { icon: Lock, label: 'Encryption Control', path: '/encryption-control' },
        { icon: Activity, label: 'Monitoring & Logs', path: '/monitoring' },
        { icon: Server, label: 'Distributed Nodes', path: '/nodes' },
    ];

    return (
        <div className="min-h-screen bg-background text-white flex">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-gray-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:block",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center px-6 border-b border-gray-800">
                    <Shield className="w-8 h-8 text-primary mr-2" />
                    <span className="text-xl font-bold tracking-wide">CloudShield</span>
                </div>

                <nav className="p-4 space-y-1 mt-4">
                    <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Main Menu
                    </div>
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.path + item.label}
                            {...item}
                            active={location.pathname === item.path}
                        />
                    ))}
                </nav>

                <div className="absolute bottom-4 left-0 w-full px-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                    <div className="mt-4 px-4 py-2 bg-gray-900 rounded-lg flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.role === 'admin' ? 'Administrator' : 'User'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-surface/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-40">
                    <button
                        className="lg:hidden p-2 text-gray-400 hover:text-white"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="hidden lg:flex items-center bg-gray-900 rounded-full px-4 py-1.5 border border-gray-700 w-96">
                        <Search size={16} className="text-gray-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Search logs, nodes, or files..."
                            className="bg-transparent border-none focus:ring-0 text-sm w-full text-white placeholder-gray-500"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-400 hover:text-primary transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-700 mx-2"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400 hidden sm:block">US-East-1 (Prod)</span>
                            <div className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_8px_#00E676]"></div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
