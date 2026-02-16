import { useState, useEffect, useContext } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AuthContext from '../context/AuthContext';
import API from '../services/api';
import { Activity, Server, ShieldCheck, Clock, AlertTriangle, Database, Lock, Map, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="bg-surface border border-gray-800 rounded-xl p-6 relative overflow-hidden group hover:border-gray-700 transition-colors">
        <div className={cn("absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity", color)}>
            <Icon size={64} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className={cn("p-2 rounded-lg bg-opacity-20", color.replace('text-', 'bg-'))}>
                    <Icon size={20} className={color} />
                </div>
                <h3 className="text-gray-400 font-medium text-sm">{title}</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <p className="text-xs text-gray-500">{subtext}</p>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [metrics, setMetrics] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchMetrics = async () => {
        try {
            const { data } = await API.get('/files/metrics');
            setMetrics(data.reverse());
        } catch (error) {
            console.error(error);
        }
    };

    // Derived Stats
    const totalFiles = metrics.length;
    const avgEncryptionTime = metrics.reduce((acc, curr) => acc + curr.encryptionTimeMs, 0) / (totalFiles || 1);
    const criticalThreats = metrics.filter(m => m.geminiAnalysis?.riskScore > 75).length;

    const comparisonData = metrics.slice(-20).map((m, i) => ({
        name: `T-${i}`,
        EncryptionTime: m.encryptionTimeMs,
        TotalTime: m.totalTimeMs,
        Latency: m.nodeLatency,
        algorithm: m.algorithm
    }));

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-400 text-sm">Real-time security posture and node distribution.</p>
                </div>
                <div className="flex items-center gap-2 bg-surface border border-gray-800 p-1 rounded-lg">
                    {['overview', 'nodes', 'threats'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize",
                                activeTab === tab
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-400 hover:text-white"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Data Processed"
                    value={`${(totalFiles * 2.4).toFixed(1)} GB`}
                    subtext="+12% from yesterday"
                    icon={Database}
                    color="text-blue-500"
                />
                <StatCard
                    title="Encrypted Data Ratio"
                    value="99.8%"
                    subtext="AES-256-GCM Enforced"
                    icon={Lock}
                    color="text-primary"
                />
                <StatCard
                    title="Active Nodes"
                    value="3/3"
                    subtext="All systems operational"
                    icon={Server}
                    color="text-warning"
                />
                <StatCard
                    title="Threats Detected"
                    value={criticalThreats}
                    subtext=" blocked in last 24h"
                    icon={AlertTriangle}
                    color="text-danger"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Visual Map Placeholder / Chart */}
                <div className="lg:col-span-2 bg-surface border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            Encryption Throughput (Live)
                        </h2>
                        <span className="flex items-center gap-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div> Live
                        </span>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={comparisonData}>
                                <defs>
                                    <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                <XAxis dataKey="name" hide />
                                <YAxis stroke="#4b5563" fontSize={12} tickFormatter={(value) => `${value}ms`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#151F28', borderColor: '#374151', color: '#fff' }}
                                    itemStyle={{ color: '#00E5FF' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="EncryptionTime"
                                    stroke="#00E5FF"
                                    fillOpacity={1}
                                    fill="url(#colorTime)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Security Activity Feed */}
                <div className="bg-surface border border-gray-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                        <Activity size={18} className="text-warning" />
                        Security Activity
                    </h2>
                    <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                        {metrics.slice(0, 10).map((m, i) => (
                            <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-surfaceHover transition-colors border border-transparent hover:border-gray-800">
                                <div className="mt-1">
                                    {m.algorithm.includes('gcm') ? (
                                        <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_#00E676]"></div>
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-warning shadow-[0_0_8px_#FFC400]"></div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-white">
                                        {m.operation === 'upload' ? 'Secure Upload' : 'Data Retrieval'}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {m.algorithm.includes('gcm') ? 'AES-256-GCM' : 'Legacy Encryption'} • {m.nodeLatency.toFixed(0)}ms latency
                                    </p>
                                </div>
                                <div className="ml-auto text-xs text-gray-600">
                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                        {metrics.length === 0 && (
                            <div className="text-center text-gray-500 py-10">No activity recorded</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Node Distribution Map Placeholder */}
            <div className="bg-surface border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Globe size={18} className="text-purple-500" />
                        Global Node Distribution
                    </h2>
                    <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success"></div> Secure</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-warning"></div> Warning</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-danger"></div> Critical</span>
                    </div>
                </div>

                <div className="relative h-64 bg-[#0B1116] rounded-lg border border-gray-800 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}></div>

                    {/* Simulated Nodes on Map */}
                    <div className="absolute top-1/3 left-1/4">
                        <div className="w-3 h-3 bg-success rounded-full shadow-[0_0_12px_#00E676] animate-pulse"></div>
                        <div className="mt-2 text-[10px] text-gray-500 text-center">US-East-1</div>
                    </div>
                    <div className="absolute top-1/2 left-1/2">
                        <div className="w-3 h-3 bg-warning rounded-full shadow-[0_0_12px_#FFC400] animate-pulse"></div>
                        <div className="mt-2 text-[10px] text-gray-500 text-center">EU-West-2</div>
                    </div>
                    <div className="absolute bottom-1/3 right-1/3">
                        <div className="w-3 h-3 bg-success rounded-full shadow-[0_0_12px_#00E676] animate-pulse"></div>
                        <div className="mt-2 text-[10px] text-gray-500 text-center">AP-South-1</div>
                    </div>

                    <div className="text-gray-700 text-4xl font-bold opacity-10 select-none">300 x 300</div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
