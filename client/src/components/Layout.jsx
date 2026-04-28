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
    Lock,
    Sun,
    Moon,
    ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import ThemeContext from '../context/ThemeContext';

const SidebarItem = ({ icon: Icon, label, path, active, hasSubmenu }) => (
    <Link
        to={path}
        className={cn(
            "flex items-center justify-between px-4 py-3 rounded-r-full transition-all duration-300 group mr-4",
            active
                ? "bg-gradient-to-r from-primary/20 to-transparent border-l-2 border-primary"
                : "text-gray-400 hover:text-white border-l-2 border-transparent"
        )}
    >
        <div className="flex items-center gap-3">
            <Icon size={20} className={cn("group-hover:scale-110 transition-transform", active ? "text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" : "")} />
            <span className={cn("font-medium", active ? "text-primary drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]" : "")}>{label}</span>
        </div>
        {hasSubmenu && <ChevronDown size={16} className={cn(active ? "text-primary" : "text-gray-500")} />}
    </Link>
);

const Layout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Activity, label: 'Admin Console', path: '/admin', adminOnly: true },
        { icon: Shield, label: 'Data Security', path: '/data-security' },
        { icon: Lock, label: 'Encryption Control', path: '/encryption-control' },
        { icon: Activity, label: 'Monitoring & Logs', path: '/monitoring' },
        { icon: Server, label: 'Distributed Nodes', path: '/nodes' },
        { icon: User, label: 'Access Policies', path: '/access-policies' }
    ];

    const filteredNavItems = navItems.filter(item => !item.adminOnly || user?.role === 'admin');

    const isSettingsActive = location.pathname.startsWith('/system-config');

    return (
        <div className="min-h-screen bg-[#0d131a] text-white flex overflow-hidden">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-[#111822] border-r border-[#1e293b] shadow-[4px_0_24px_rgba(0,0,0,0.5)] transition-transform duration-300 lg:translate-x-0 lg:static lg:block flex flex-col",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center px-6 border-b border-[#1e293b]">
                    <Shield className="w-8 h-8 text-primary mr-2 drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                    <span className="text-xl font-bold tracking-wide">CloudShield</span>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <nav className="py-6 space-y-1">
                        <div className="px-6 mb-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            MAIN MENU
                        </div>
                        {filteredNavItems.map((item) => (
                            <SidebarItem
                                key={item.path + item.label}
                                {...item}
                                active={location.pathname === item.path}
                            />
                        ))}

                        {/* System Settings (Collapsible) */}
                        {(!user || user?.role === 'admin') && (
                            <div className="mt-2">
                                <div 
                                    className="cursor-pointer"
                                    onClick={() => setSettingsOpen(!settingsOpen)}
                                >
                                    <SidebarItem
                                        icon={Settings}
                                        label="System Settings"
                                        path="#"
                                        active={isSettingsActive}
                                        hasSubmenu={true}
                                    />
                                </div>
                                {settingsOpen && (
                                    <div className="ml-12 mt-1 space-y-2 border-l border-gray-800 py-2">
                                        <Link to="/system-config/audit-logs" className="block px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">Audit Logs</Link>
                                        <Link to="/system-config/keys" className="block px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">Key Management</Link>
                                        <Link to="/system-config/policies" className="block px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">Policy Editor</Link>
                                        <Link to="/system-config/alerts" className="block px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">System Alerts</Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                </div>

                <div className="p-4 border-t border-[#1e293b] space-y-3">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-danger hover:bg-danger/10 transition-colors group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                    
                    <div className="px-4 py-3 bg-[#17202d] rounded-xl border border-gray-800 flex items-center gap-3 shadow-inner">
                        <div className="w-10 h-10 rounded-full bg-[#111822] border-2 border-primary flex items-center justify-center text-primary font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)]">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate text-white">{user?.name || 'Admin User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.role === 'admin' ? 'Security Director' : 'Administrator'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0d131a] relative">
                {/* Glow Effects */}
                <div className="absolute top-0 left-0 right-0 h-96 bg-primary/5 blur-[120px] pointer-events-none -z-0"></div>

                {/* Header */}
                <header className="h-16 border-b border-[#1e293b] flex items-center justify-between px-6 sticky top-0 z-40 bg-[#0d131a]/80 backdrop-blur-md">
                    <button
                        className="lg:hidden p-2 text-gray-400 hover:text-white"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="hidden lg:flex items-center bg-[#17202d] rounded-full px-4 py-2 border border-gray-800 w-96 shadow-inner focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                        <Search size={16} className="text-gray-500 mr-3" />
                        <input
                            type="text"
                            placeholder="Search logs, nodes, or files..."
                            className="bg-transparent border-none focus:ring-0 text-sm w-full text-white placeholder-gray-600 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-5">
                        <button
                            onClick={toggleTheme}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button className="relative text-gray-400 hover:text-primary transition-colors">
                            <Bell size={18} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full shadow-[0_0_5px_rgba(255,61,61,0.8)]"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-800 mx-1"></div>
                        <div className="flex items-center gap-3 bg-[#17202d] px-4 py-1.5 rounded-full border border-gray-800">
                            <span className="text-sm text-gray-300 font-medium hidden sm:block">US-East-1 (Prod)</span>
                            <div className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_8px_#00E676] animate-pulse"></div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 overflow-y-auto relative z-10 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
