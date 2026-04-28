import { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Thermometer, Microchip, MemoryStick, Download, Search, Activity, Box } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import API from '../services/api';

const Monitoring = () => {
    const [activeTab, setActiveTab] = useState('cpu'); // 'cpu' or 'memory'
    const [cpuData, setCpuData] = useState([]);
    const [memoryData, setMemoryData] = useState([]);
    const [cpuLogs, setCpuLogs] = useState([]);
    const [memLogs, setMemLogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [liveMetrics, setLiveMetrics] = useState({
        cpuLoad: 78,
        temp: 65,
        memUsed: 5.2,
        memFree: 28
    });

    useEffect(() => {
        const fetchMonitoringData = async () => {
            try {
                const [analyticsRes, logsRes] = await Promise.all([
                    API.get('/analytics'),
                    API.get('/security/logs?limit=5')
                ]);
                
                const data = analyticsRes.data;
                const nodes = data.nodes || [];
                
                // Average load from nodes for baseline metrics
                const avgLoad = nodes.length > 0 ? nodes.reduce((a, b) => a + (b.load || 0), 0) / nodes.length : 78;
                const securityOverhead = parseFloat(data.securityOverhead || 15);
                
                setLiveMetrics(prev => ({
                    cpuLoad: Math.max(10, Math.min(100, avgLoad + (Math.random() - 0.5) * 5)),
                    temp: Math.max(40, Math.min(90, 50 + (avgLoad * 0.3) + (Math.random() - 0.5) * 2)),
                    memUsed: Math.max(1.0, Math.min(128.0, (avgLoad * 0.1) + (Math.random() - 0.5) * 0.2)),
                    memFree: Math.max(10, 128 - ((avgLoad * 0.1) + 2))
                }));

                // Dynamic CPU Chart Data
                setCpuData([
                    { workload: 0, core1: 0, offload: 0, aes: 0, total: 0 },
                    { workload: 200, core1: avgLoad * 0.7, offload: securityOverhead, aes: 15, total: avgLoad * 0.8 },
                    { workload: 400, core1: avgLoad * 0.8, offload: securityOverhead * 1.5, aes: 30, total: avgLoad * 0.9 },
                    { workload: 600, core1: avgLoad * 0.9, offload: securityOverhead * 1.8, aes: 68, total: avgLoad },
                    { workload: 1000, core1: avgLoad * 0.95, offload: securityOverhead * 2.0, aes: 70, total: avgLoad * 1.05 },
                    { workload: 1400, core1: avgLoad * 1.0, offload: securityOverhead * 2.2, aes: 72, total: avgLoad * 1.1 },
                    { workload: 2000, core1: Math.min(100, avgLoad * 1.1), offload: securityOverhead * 2.5, aes: 75, total: Math.min(100, avgLoad * 1.2) },
                ]);

                // Dynamic Memory Chart Data
                const memBase = (avgLoad * 0.1);
                setMemoryData([
                    { workload: 0, nodeGlobal: memBase * 0.1, aes: 0.1, total: 0.2 },
                    { workload: 200, nodeGlobal: memBase * 0.3, aes: 0.3, total: memBase * 0.5 },
                    { workload: 400, nodeGlobal: memBase * 0.5, aes: 0.5, total: memBase * 1.0 },
                    { workload: 600, nodeGlobal: memBase * 0.8, aes: 0.9, total: memBase * 1.5 },
                    { workload: 1000, nodeGlobal: memBase * 1.0, aes: 1.2, total: memBase * 2.0 },
                    { workload: 1400, nodeGlobal: memBase * 1.2, aes: 1.5, total: memBase * 2.5 },
                    { workload: 2000, nodeGlobal: memBase * 1.5, aes: 1.8, total: memBase * 3.0 },
                ]);

                if (logsRes.data) {
                    const mappedCpuLogs = logsRes.data.map((log, i) => ({
                        id: log._id || i,
                        time: new Date(log.timestamp).toLocaleString(),
                        node: log.node || 'Node_Global',
                        core: log.severity === 'critical' ? 'Legacy proc' : (i % 2 === 0 ? 'AES-GCM' : 'CP-ABE'),
                        rate: (Math.random() * 100).toFixed(0),
                        load: (avgLoad * (Math.random() * 0.5 + 0.8)).toFixed(0),
                        tp: log.severity === 'critical' ? 'Quarantine' : (1000 + Math.random() * 1000).toFixed(0),
                        lat: (parseFloat(data.globalLatency || 12) + Math.random() * 2).toFixed(1),
                        danger: log.severity === 'critical',
                        highlight: log.severity !== 'critical' && i === 1
                    }));
                    setCpuLogs(mappedCpuLogs);

                    const mappedMemLogs = logsRes.data.map((log, i) => ({
                        id: log._id || i,
                        time: new Date(log.timestamp).toLocaleString(),
                        node: log.node || 'Node_Global',
                        alloc: (32 + Math.random() * 64).toFixed(0),
                        used: (memBase + Math.random() * 10).toFixed(1),
                        usage: Math.min(100, Math.floor(avgLoad + (Math.random() * 20 - 10))),
                        avail: (10 + Math.random() * 20).toFixed(1),
                        mod: log.severity === 'critical' ? 'FAILED' : (i % 2 === 0 ? 'AES-GCM' : 'CP-ABE'),
                        tp: log.severity === 'critical' ? '0' : (100 + Math.random() * 900).toFixed(0),
                        lat: log.severity === 'critical' ? 'High Risk' : (10 + Math.random() * 5).toFixed(1),
                        danger: log.severity === 'critical',
                        highlight: log.severity !== 'critical' && i === 2
                    }));
                    setMemLogs(mappedMemLogs);
                }

            } catch (error) {
                console.error("Failed to fetch monitoring data:", error);
            }
        };

        fetchMonitoringData();
        const interval = setInterval(fetchMonitoringData, 5000);
        return () => clearInterval(interval);
    }, []);

    const exportLogsCSV = () => {
        const logsToExport = activeTab === 'cpu' ? cpuLogs : memLogs;
        if (logsToExport.length === 0) return;
        
        let headers = "";
        let csv = "";
        
        if (activeTab === 'cpu') {
            headers = "Timestamp,Node,Core 1 Load (%),Hardware Offload Rate (Ops/s),Specific Module Load (%),Effective Processing Rate (Mbps),Latency (ms)\n";
            csv = logsToExport.map(l => `"${l.time}","${l.node}","${l.core}","${l.rate}","${l.load}","${l.tp}","${l.lat}"`).join("\n");
        } else {
            headers = "Timestamp,Node,Total Alloc (GB),Used (GB),Usage (%),Available (GB),Primary Module,Effective Throughput (Mbps),Latency (ms)\n";
            csv = logsToExport.map(l => `"${l.time}","${l.node}","${l.alloc}","${l.used}","${l.usage}","${l.avail}","${l.mod}","${l.tp}","${l.lat}"`).join("\n");
        }
        
        const blob = new Blob([headers + csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `system_telemetry_${activeTab}_logs.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredCpuLogs = cpuLogs.filter(log => 
        log.node.toLowerCase().includes(searchQuery.toLowerCase()) || 
        log.core.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredMemLogs = memLogs.filter(log => 
        log.node.toLowerCase().includes(searchQuery.toLowerCase()) || 
        log.mod.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const CpuCustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#111822] border border-[#1e293b] rounded-lg p-3 shadow-xl">
                    <p className="text-white font-bold mb-2">Workload: {label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-xs text-gray-300">{entry.name}:</span>
                            <span className="text-xs font-bold text-white">{entry.value}%</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };
    
    const MemCustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#111822] border border-[#1e293b] rounded-lg p-3 shadow-xl z-50 relative">
                    <p className="text-white font-bold mb-2">Workload: {label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-xs text-gray-300">{entry.name}:</span>
                            <span className="text-xs font-bold text-white">{entry.value} GB</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {activeTab === 'cpu' ? 'CPU Utilization During Secure Processing' : 'Memory Utilization Comparison'}
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {activeTab === 'cpu' 
                            ? 'Real-time CPU and specialized processing metrics for critical workloads.' 
                            : 'Real-time comparison of memory usage for different processing nodes and modules.'}
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Tabs */}
                    <div className="flex bg-[#111822] border border-[#1e293b] rounded-lg p-1 shadow-inner">
                        <button 
                            onClick={() => setActiveTab('cpu')}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2",
                                activeTab === 'cpu' ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,229,255,0.2)]" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <Cpu size={16} /> CPU
                        </button>
                        <button 
                            onClick={() => setActiveTab('memory')}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2",
                                activeTab === 'memory' ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,229,255,0.2)]" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <Box size={16} /> Memory
                        </button>
                    </div>

                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)] border", 
                        liveMetrics.cpuLoad > 90 || liveMetrics.temp > 85 ? "bg-[#1a0f0f] border-danger/30" : 
                        liveMetrics.cpuLoad > 75 || liveMetrics.temp > 75 ? "bg-[#1a150f] border-warning/30" : 
                        "bg-[#0d131a] border-success/30"
                    )}>
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", 
                            liveMetrics.cpuLoad > 90 || liveMetrics.temp > 85 ? "bg-danger shadow-[0_0_5px_#ef4444]" : 
                            liveMetrics.cpuLoad > 75 || liveMetrics.temp > 75 ? "bg-warning shadow-[0_0_5px_#f59e0b]" : 
                            "bg-success shadow-[0_0_5px_#00e676]"
                        )}></div>
                        <span className={cn("text-xs font-bold tracking-wide uppercase", 
                            liveMetrics.cpuLoad > 90 || liveMetrics.temp > 85 ? "text-danger" : 
                            liveMetrics.cpuLoad > 75 || liveMetrics.temp > 75 ? "text-warning" : 
                            "text-success"
                        )}>
                            {liveMetrics.cpuLoad > 90 || liveMetrics.temp > 85 ? "Critical Warning" : 
                             liveMetrics.cpuLoad > 75 || liveMetrics.temp > 75 ? "High Load" : 
                             "System Healthy"}
                        </span>
                    </div>
                </div>
            </div>

            {activeTab === 'cpu' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                    {/* Top Cards (CPU) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#111822] border border-[#1e293b] rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <Microchip size={16} className="text-primary" /> Total CPU Load
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Activity size={16} className="text-primary" />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="relative w-28 h-28 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-135" viewBox="0 0 100 100">
                                        <path d="M 20 80 A 45 45 0 1 1 80 80" fill="transparent" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
                                        <path d="M 20 80 A 45 45 0 1 1 80 80" fill="transparent" stroke="#00e5ff" strokeWidth="10" strokeLinecap="round" strokeDasharray="200" strokeDashoffset={200 - (200 * liveMetrics.cpuLoad) / 100} className="transition-all duration-1000" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-white">{liveMetrics.cpuLoad.toFixed(0)}%</span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">CPU</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-1 items-end">
                                    {/* Mini bars */}
                                    <div className="flex items-end gap-1 h-12">
                                        {[40, 60, 45, 80, 50, 70, 90, 65].map((h, i) => (
                                            <div key={i} className="w-2 bg-primary/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between w-full text-[9px] text-gray-500 mt-1 px-1">
                                        <span>1h</span>
                                        <span>1h</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#111822] border border-[#1e293b] rounded-2xl p-6 shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <ShieldCheck size={16} className="text-primary" /> Encryption Module Load
                                </div>
                                <div className="w-6 h-6 rounded border border-primary/30 flex items-center justify-center">
                                    <CheckCircle size={12} className="text-primary" />
                                </div>
                            </div>
                            
                            <div className="mb-4 flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">72%</span>
                                <span className="text-lg text-gray-400 font-bold">Load</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400">Core 1:</span>
                                    <span className="text-primary font-bold">85%</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400">Core 2:</span>
                                    <span className="text-primary font-bold">60%</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400">Core 3:</span>
                                    <span className="text-primary font-bold">60%</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400">Core 4:</span>
                                    <span className="text-primary font-bold">50%</span>
                                </div>
                                <div className="col-span-2 flex justify-between items-center text-xs mt-1 pt-2 border-t border-[#1e293b]">
                                    <span className="text-gray-400">Core 5: specialized hardware:</span>
                                    <span className="text-primary font-bold">90%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#111822] border border-[#1e293b] rounded-2xl p-6 shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <Thermometer size={16} className="text-primary" /> Core Temp & Processing Efficiency
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center h-full pb-4">
                                <div className="relative w-28 h-28">
                                    <svg className="w-full h-full transform -rotate-135" viewBox="0 0 100 100">
                                        <path d="M 20 80 A 45 45 0 1 1 80 80" fill="transparent" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
                                        {/* Multi-color gauge segment */}
                                        <path d="M 20 80 A 45 45 0 1 1 80 80" fill="transparent" stroke="url(#tempGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray="200" strokeDashoffset={200 - (200 * liveMetrics.temp) / 100} className="transition-all duration-1000" />
                                        <defs>
                                            <linearGradient id="tempGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#00e5ff" />
                                                <stop offset="50%" stopColor="#f59e0b" />
                                                <stop offset="100%" stopColor="#ef4444" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
                                        <span className="text-xs text-gray-400">Average: <span className="font-bold text-white">{liveMetrics.temp.toFixed(0)}°C</span></span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-xs text-gray-400 mb-1">Efficiency Score</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-4xl font-bold text-white">96<span className="text-lg">%</span></span>
                                        <Gauge size={20} className="text-gray-500" />
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Perf Meter</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart (CPU) */}
                    <div className="bg-[#111822] border border-[#1e293b] rounded-2xl p-6 shadow-lg">
                        <h2 className="text-lg font-bold text-white mb-6">Core Processing Efficiency vs. Specialized Hardware Offload</h2>
                        
                        <div className="flex items-center justify-center gap-6 mb-4 text-xs font-bold">
                            <div className="flex items-center gap-2 text-warning"><div className="w-3 h-3 rounded-full bg-warning border-2 border-[#111822] shadow-[0_0_0_1px_#f59e0b]"></div> CPU Core 1-4 load</div>
                            <div className="flex items-center gap-2 text-primary"><div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_5px_#00e5ff]"></div> AES-GCM accelerator Offload</div>
                            <div className="flex items-center gap-2 text-[#3b82f6]"><div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div> CP-ABE processor load</div>
                            <div className="flex items-center gap-2 text-danger"><div className="w-3 h-3 rounded-full bg-danger"></div> Total System Overhead</div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={cpuData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={true} />
                                    <XAxis dataKey="workload" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
                                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1e293b' }} domain={[0, 100]} />
                                    <Tooltip content={<CpuCustomTooltip />} />
                                    
                                    {/* Area fills for background glow effect */}
                                    <Line type="monotone" dataKey="core1" name="CPU Core 1-4" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
                                    <Area type="monotone" dataKey="offload" fill="#00e5ff" fillOpacity={0.1} stroke="none" />
                                    <Line type="monotone" dataKey="offload" name="Offload" stroke="#00e5ff" strokeWidth={3} dot={{ r: 4, fill: '#00e5ff' }} activeDot={{ r: 6, fill: '#00e5ff', strokeWidth: 0 }} />
                                    <Line type="monotone" dataKey="aes" name="CP-ABE" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
                                    <Line type="monotone" dataKey="total" name="Total Overhead" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest">Workload (Requests/sec)</div>
                    </div>

                    {/* Table (CPU) */}
                    <div className="bg-[#111822] border border-[#1e293b] rounded-2xl p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-white">Node Specific CPU and Module Utilization</h2>
                            <div className="flex gap-3 items-center">
                                {showSearch && (
                                    <motion.input 
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 200, opacity: 1 }}
                                        autoFocus
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search node or core..."
                                        className="px-3 py-1.5 bg-[#0d131a] border border-primary/50 text-white rounded-lg text-sm outline-none focus:shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                                    />
                                )}
                                <button onClick={() => setShowSearch(!showSearch)} className={cn("px-4 py-2 border text-gray-300 rounded-lg text-sm flex items-center gap-2 hover:text-white transition-colors", showSearch ? "bg-primary/20 border-primary shadow-[0_0_10px_rgba(0,229,255,0.2)] text-white" : "bg-[#0d131a] border-[#1e293b]")}>
                                    <Search size={16} /> Detailed Query
                                </button>
                                <button onClick={exportLogsCSV} className="px-4 py-2 bg-danger hover:bg-red-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-danger/20">
                                    <Download size={16} /> Export Data
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0d131a] text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-[#1e293b]">
                                    <tr>
                                        <th className="p-4">Timestamp</th>
                                        <th className="p-4">Node</th>
                                        <th className="p-4">Core 1 Load (%)</th>
                                        <th className="p-4">Hardware Offload Rate (Ops/s)</th>
                                        <th className="p-4">Specific Module Load (%)</th>
                                        <th className="p-4">Effective Processing Rate (Mbps)</th>
                                        <th className="p-4 text-right">Latency (ms)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1e293b]">
                                    {filteredCpuLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-[#1a2332] transition-colors group">
                                            <td className="p-4 text-sm text-gray-300">{log.time}</td>
                                            <td className="p-4 text-sm text-gray-200">{log.node}</td>
                                            <td className="p-4 text-sm">
                                                <span className={log.highlight ? "text-primary font-bold" : "text-gray-300"}>{log.core}</span>
                                            </td>
                                            <td className="p-4 text-sm text-primary">{log.rate}</td>
                                            <td className="p-4 text-sm text-success">{log.load}</td>
                                            <td className="p-4 text-sm">
                                                <span className={log.danger ? "px-2 py-1 bg-danger/20 text-danger border border-danger/30 rounded font-bold text-xs" : "text-gray-300"}>
                                                    {log.tp}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-300 text-right">{log.lat}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === 'memory' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                    {/* Top Cards (Memory) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#111822] border border-[#1e293b] rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <Microchip size={16} className="text-primary" /> Total Memory Allocation
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <MemoryStick size={16} className="text-primary" />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="relative w-28 h-28 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-135" viewBox="0 0 100 100">
                                        <path d="M 20 80 A 45 45 0 1 1 80 80" fill="transparent" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
                                        <path d="M 20 80 A 45 45 0 1 1 80 80" fill="transparent" stroke="#00e5ff" strokeWidth="10" strokeLinecap="round" strokeDasharray="200" strokeDashoffset={50} className="transition-all duration-1000" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-white">128 <span className="text-sm">GB</span></span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">RAM</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-1 items-end">
                                    <div className="flex items-end gap-1 h-12">
                                        {[60, 65, 70, 75, 70, 78, 80, 75].map((h, i) => (
                                            <div key={i} className="w-2 bg-primary/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between w-full text-[9px] text-gray-500 mt-1 px-1">
                                        <span>1h</span>
                                        <span>1h</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#111822] border border-[#1e293b] rounded-2xl p-6 shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <ShieldCheck size={16} className="text-primary" /> Encryption Module Memory Load
                                </div>
                                <div className="w-6 h-6 rounded border border-primary/30 flex items-center justify-center">
                                    <CheckCircle size={12} className="text-primary" />
                                </div>
                            </div>
                            
                            <div className="mb-4 flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">{liveMetrics.memUsed.toFixed(1)} GB</span>
                                <span className="text-lg text-gray-400 font-bold">Used</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400">CP-ABE: <span className="text-white">1.8 GB</span></span>
                                    <span className="text-primary font-bold">78%</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400">AES-GCM: <span className="text-white">0.9 GB</span></span>
                                    <span className="text-primary font-bold">90%</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400">3DES: <span className="text-white">0.2 GB</span></span>
                                    <span className="text-primary font-bold">20%</span>
                                </div>
                                <div className="flex justify-between items-center text-xs bg-[#1a2332] p-1 px-2 rounded border border-primary/20">
                                    <span className="text-gray-400">Specialized: <span className="text-white">2.3 GB</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#111822] border border-[#1e293b] rounded-2xl p-6 shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <Thermometer size={16} className="text-primary" /> Cache Efficiency & Free Memory
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center h-full pb-4">
                                <div className="relative w-28 h-28">
                                    <svg className="w-full h-full transform -rotate-135" viewBox="0 0 100 100">
                                        <path d="M 20 80 A 45 45 0 1 1 80 80" fill="transparent" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
                                        <path d="M 20 80 A 45 45 0 1 1 80 80" fill="transparent" stroke="url(#effGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray="200" strokeDashoffset={200 - (200 * 92) / 100} className="transition-all duration-1000" />
                                        <defs>
                                            <linearGradient id="effGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#00e5ff" />
                                                <stop offset="100%" stopColor="#f59e0b" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
                                        <span className="text-3xl font-bold text-white">92<span className="text-lg">%</span></span>
                                        <span className="text-[9px] text-gray-400 mt-1">Average: 92°C</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-xs text-gray-400 mb-1">Free:</p>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl font-bold text-white">{liveMetrics.memFree.toFixed(0)} GB</span>
                                    </div>
                                    <span className="text-xs text-gray-500">Temperature: 45°C</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart (Memory) */}
                    <div className="bg-[#111822] border border-[#1e293b] rounded-2xl p-6 shadow-lg">
                        <h2 className="text-lg font-bold text-white mb-6">Comparative Memory Usage by Module & Node</h2>
                        
                        <div className="flex flex-wrap items-center justify-center gap-6 mb-4 text-xs font-bold">
                            <div className="flex items-center gap-2 text-gray-400"><div className="w-3 h-3 rounded bg-warning/50 border border-warning"></div> Node Specific Memory (Area Graph)</div>
                            <div className="flex items-center gap-2 text-primary"><div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_5px_#00e5ff]"></div> Global Memory Trend (Cyan Line)</div>
                            <div className="flex items-center gap-2 text-[#3b82f6]"><div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div> Peak Usage Points (Data Points)</div>
                            <div className="flex items-center gap-2 text-danger"><div className="w-3 h-3 rounded-full bg-danger"></div> Baseline Memory (Red Line)</div>
                        </div>

                        <div className="h-[300px] w-full relative z-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={memoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorNodeGlobal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorAes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={true} />
                                    <XAxis dataKey="workload" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
                                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1e293b' }} domain={[0, 10]} />
                                    <Tooltip content={<MemCustomTooltip />} />
                                    
                                    <Area type="monotone" dataKey="total" name="Total Usage" stroke="#ef4444" fillOpacity={1} fill="url(#colorTotal)" />
                                    <Area type="monotone" dataKey="aes" name="AES-GCM" stroke="#f59e0b" fillOpacity={1} fill="url(#colorAes)" />
                                    <Area type="monotone" dataKey="nodeGlobal" name="Node_Global" stroke="#00e5ff" strokeWidth={2} fillOpacity={1} fill="url(#colorNodeGlobal)" dot={{ r: 4, fill: '#00e5ff', strokeWidth: 2, stroke: '#111822' }} activeDot={{ r: 6, fill: '#00e5ff', strokeWidth: 0 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest">Workload (Requests/sec)</div>
                    </div>

                    {/* Table (Memory) */}
                    <div className="bg-[#111822] border border-[#1e293b] rounded-2xl p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-white">Node & Module Specific Memory Metrics</h2>
                            <div className="flex gap-3 items-center">
                                {showSearch && (
                                    <motion.input 
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 200, opacity: 1 }}
                                        autoFocus
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search node or module..."
                                        className="px-3 py-1.5 bg-[#0d131a] border border-primary/50 text-white rounded-lg text-sm outline-none focus:shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                                    />
                                )}
                                <button onClick={() => setShowSearch(!showSearch)} className={cn("px-4 py-2 border text-gray-300 rounded-lg text-sm flex items-center gap-2 hover:text-white transition-colors", showSearch ? "bg-primary/20 border-primary shadow-[0_0_10px_rgba(0,229,255,0.2)] text-white" : "bg-[#0d131a] border-[#1e293b]")}>
                                    <Search size={16} /> Detailed Query
                                </button>
                                <button onClick={exportLogsCSV} className="px-4 py-2 bg-danger hover:bg-red-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-danger/20">
                                    <Download size={16} /> Export Data
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0d131a] text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-[#1e293b]">
                                    <tr>
                                        <th className="p-4">Timestamp</th>
                                        <th className="p-4">Node</th>
                                        <th className="p-4">Total Alloc (GB)</th>
                                        <th className="p-4">Used (GB)</th>
                                        <th className="p-4">Usage (%)</th>
                                        <th className="p-4">Available (GB)</th>
                                        <th className="p-4">Primary Module</th>
                                        <th className="p-4">Effective Throughput (Mbps)</th>
                                        <th className="p-4 text-right">Latency (ms)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1e293b]">
                                    {filteredMemLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-[#1a2332] transition-colors group">
                                            <td className="p-4 text-sm text-gray-300">{log.time}</td>
                                            <td className="p-4 text-sm text-gray-200">{log.node}</td>
                                            <td className="p-4 text-sm text-gray-300">{log.alloc}</td>
                                            <td className="p-4 text-sm text-gray-300">{log.used}</td>
                                            <td className="p-4 text-sm">
                                                <div className="w-full max-w-[60px] bg-gray-800 rounded h-5 relative flex items-center justify-center overflow-hidden">
                                                    <div className={cn("absolute left-0 top-0 h-full", log.usage >= 90 ? "bg-primary" : log.usage >= 80 ? "bg-primary/70" : "bg-danger")} style={{ width: `${log.usage}%` }}></div>
                                                    <span className="relative text-[10px] font-bold text-white z-10">{log.usage}%</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-300">{log.avail}</td>
                                            <td className="p-4 text-sm">
                                                <span className={log.danger ? "text-danger font-bold" : log.highlight ? "text-gray-300" : "text-primary font-bold"}>{log.mod}</span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-300">{log.tp}</td>
                                            <td className="p-4 text-sm text-gray-300 text-right">
                                                <span className={log.danger ? "text-warning font-bold" : ""}>{log.lat}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Monitoring;
