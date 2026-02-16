import { useState } from 'react';
import { Activity, Shield, AlertTriangle, CheckCircle, Download, Search, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { cn } from '../lib/utils';

const Monitoring = () => {
    // Mock Data for Charts
    const trafficData = Array.from({ length: 20 }).map((_, i) => ({
        time: `${i}:00`,
        value: 10 + Math.random() * 50 + (i > 15 ? 40 : 0) // Spike at end
    }));

    const auditLogs = [
        { id: 1, time: '2023-10-27 14:23:01', severity: 'critical', type: 'Auth_Failure', node: 'US-East-1-N4', msg: 'Multiple failed login attempts detected from IP 192.168.x.x' },
        { id: 2, time: '2023-10-27 14:18:45', severity: 'warning', type: 'Latency_Spike', node: 'EU-West-2-N1', msg: 'Encryption module response time > 200ms' },
        { id: 3, time: '2023-10-27 14:15:22', severity: 'success', type: 'Key_Rotation', node: 'System_Global', msg: 'Scheduled AES-256 key rotation completed successfully.' },
        { id: 4, time: '2023-10-27 14:10:05', severity: 'info', type: 'User_Login', node: 'US-East-1-Gateway', msg: 'User admin_security session started.' },
        { id: 5, time: '2023-10-27 14:08:12', severity: 'info', type: 'Config_Update', node: 'US-East-1-N2', msg: 'Firewall rule set updated via Admin Policy.' },
    ];

    const getSeverityStyles = (sev) => {
        switch (sev) {
            case 'critical': return 'bg-danger/10 text-danger border-danger/20';
            case 'warning': return 'bg-warning/10 text-warning border-warning/20';
            case 'success': return 'bg-success/10 text-success border-success/20';
            default: return 'bg-gray-800 text-gray-400 border-gray-700';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">System Monitoring & Audit Logs</h1>
                    <p className="text-gray-400 text-sm">Real-time security insights and immutable audit trails across distributed nodes.</p>
                </div>
                <div className="flex items-center gap-2 bg-success/10 px-3 py-1.5 rounded-full border border-success/20">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    <span className="text-success text-xs font-bold uppercase">System Healthy</span>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Access Attempts Chart */}
                <div className="bg-surface border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-gray-400 text-sm font-medium">Access Attempts (24h)</h3>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-bold text-white">12,450</span>
                                <span className="text-success text-xs font-bold bg-success/10 px-1.5 py-0.5 rounded">↗ 12%</span>
                            </div>
                        </div>
                        <div className="p-2 bg-gray-900 rounded-lg"><Activity size={18} className="text-gray-400" /></div>
                    </div>
                    <div className="h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trafficData}>
                                <defs>
                                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF3D3D" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FF3D3D" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#FF3D3D" strokeWidth={2} fillOpacity={1} fill="url(#colorTraffic)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Encryption Throughput */}
                <div className="bg-surface border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-gray-400 text-sm font-medium">Encryption Throughput</h3>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-bold text-white">450</span>
                                <span className="text-sm text-gray-500">MB/s</span>
                                <span className="text-success text-xs font-bold bg-success/10 px-1.5 py-0.5 rounded">↗ 5%</span>
                            </div>
                        </div>
                        <div className="p-2 bg-gray-900 rounded-lg"><Shield size={18} className="text-gray-400" /></div>
                    </div>
                    <div className="h-32 flex items-end justify-between gap-1 px-2">
                        {[40, 60, 30, 80, 100, 50, 45].map((h, i) => (
                            <div key={i} style={{ height: `${h}%` }} className={cn("w-full rounded-t-sm", i === 4 ? "bg-primary shadow-[0_0_10px_#00E5FF]" : "bg-gray-800")}></div>
                        ))}
                    </div>
                </div>

                {/* Anomaly Score */}
                <div className="bg-surface border border-gray-800 rounded-xl p-6 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-gray-400 text-sm font-medium">Anomaly Detection Score</h3>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-4xl font-bold text-white">2</span>
                                <span className="text-xl font-bold text-danger">Critical</span>
                                <span className="text-danger text-xs font-bold bg-danger/10 px-1.5 py-0.5 rounded">+2 detected</span>
                            </div>
                        </div>
                        <div className="p-2 bg-danger/10 rounded-lg border border-danger/20 animate-pulse">
                            <AlertTriangle size={18} className="text-danger" />
                        </div>
                    </div>

                    {/* Gauge Bar */}
                    <div className="mt-8">
                        <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase mb-1">
                            <span>Low</span>
                            <span>Medium</span>
                            <span>High</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full flex overflow-hidden">
                            <div className="w-1/3 bg-success/30"></div>
                            <div className="w-1/3 bg-warning/30"></div>
                            <div className="w-1/3 bg-danger/30"></div>
                        </div>
                        <div className="relative h-2 mt-[-8px]">
                            <div className="absolute right-0 top-0 w-full h-full bg-gradient-to-r from-transparent via-transparent to-danger rounded-r-full"></div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Last anomaly: <strong>IP 192.168.1.45</strong> (Unauthorized access)</p>
                </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-lg">Immutable Audit Logs</span>
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded border border-gray-700 flex items-center gap-1"><Lock size={10} /> Tamper-Proof</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input type="text" placeholder="Search logs, IPs, Hashes..." className="bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-64" />
                        </div>
                        <button className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white"><Filter size={18} /></button>
                        <button className="px-4 py-2 bg-danger hover:bg-red-600 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-danger/20">
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-900/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4 border-b border-gray-800">Timestamp</th>
                                <th className="p-4 border-b border-gray-800">Severity</th>
                                <th className="p-4 border-b border-gray-800">Event Type</th>
                                <th className="p-4 border-b border-gray-800">Node</th>
                                <th className="p-4 border-b border-gray-800">Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-sm">
                            {auditLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-surfaceHover transition-colors">
                                    <td className="p-4 font-mono text-gray-400">{log.time}</td>
                                    <td className="p-4">
                                        <span className={cn("px-2 py-1 rounded border text-xs font-bold uppercase", getSeverityStyles(log.severity))}>
                                            {log.severity}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-white">{log.type}</td>
                                    <td className="p-4 text-gray-400">{log.node}</td>
                                    <td className="p-4 text-gray-300">{log.msg}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Monitoring;
