import { useState, useEffect } from 'react';
import { TrendingUp, Shield, Server, AlertTriangle, Key, Ban, Zap, FileText, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import API from '../services/api';

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState({
        totalData: '0 PB',
        encryptionRatio: '0%',
        activeNodes: 0,
        threats: 0,
        trend: '+0%'
    });
    const [activities, setActivities] = useState([]);
    const [aiInsights, setAiInsights] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchingRecs, setFetchingRecs] = useState(false);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [analyticsRes, logsRes] = await Promise.all([
                    API.get('/analytics'),
                    API.get('/security/logs?limit=5')
                ]);

                const { stats, trafficData, aiInsights: aiText, anomalyStatus, anomalyScore, globalLatency, throughput, securityOverhead, nodes } = analyticsRes.data;

                setMetrics({
                    totalData: `${(stats.totalFiles * 0.15).toFixed(2)} GB`, // Simulated storage
                    encryptionRatio: '100%',
                    activeNodes: stats.activeNodes,
                    threats: stats.criticalAlerts,
                    trend: '+0%',
                    globalLatency: globalLatency || '12.0',
                    throughput: throughput || '10.2',
                    securityOverhead: securityOverhead || '1.2',
                    nodes: nodes || []
                });

                setAiInsights(aiText);

                const formattedActivities = logsRes.data.map(log => ({
                    id: log._id,
                    type: log.eventType,
                    message: log.message,
                    time: new Date(log.timestamp).toLocaleTimeString(),
                    severity: log.severity,
                    node: log.node || 'System'
                }));
                setActivities(formattedActivities);

            } catch (error) {
                console.error('Dashboard fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchRecommendations = async () => {
            try {
                const { data } = await API.get('/analytics/recommendations');
                setRecommendations(data.recommendations || []);
            } catch (error) {
                console.error('Recs fetch error:', error);
            }
        };

        fetchDashboard();
        fetchRecommendations();
        const interval = setInterval(fetchDashboard, 30000);
        return () => clearInterval(interval);
    }, []);

    const refreshRecommendations = async () => {
        setFetchingRecs(true);
        try {
            const { data } = await API.get('/analytics/recommendations');
            setRecommendations(data.recommendations || []);
        } catch (error) {
            console.error(error);
        } finally {
            setFetchingRecs(false);
        }
    };

    const handleRotateKeys = async () => {
        try {
            await API.post('/keys/rotate');
            alert('Keys rotated successfully!');
        } catch (error) {
            alert('Failed to rotate keys: ' + error.message);
        }
    };

    const handleIsolateNode = async () => {
        if (!metrics.nodes || metrics.nodes.length === 0) return;
        const nodeId = metrics.nodes[0].id; // For demo, isolate the first node
        try {
            await API.post('/nodes/isolate', { nodeId });
            alert(`Node ${nodeId} isolated successfully!`);
        } catch (error) {
            alert('Failed to isolate node: ' + error.message);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'Key_Rotation': return Key;
            case 'Auth_Failure': return Ban;
            case 'Latency_Spike': return Zap;
            case 'Config_Update': return FileText;
            default: return Activity;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
                    <p className="text-gray-400 text-sm">Real-time security posture</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    <span className="text-success text-xs font-bold">US-East-1 (Production)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-surface border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Total Data Processed</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">{metrics.totalData}</span>
                                <span className="text-success text-xs font-bold bg-success/10 px-1.5 py-0.5 rounded">{metrics.trend}</span>
                            </div>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <TrendingUp size={20} className="text-blue-400" />
                        </div>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                </div>

                <div className="bg-surface border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Encrypted Data Ratio</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">{metrics.encryptionRatio}</span>
                                <span className="text-success text-xs font-bold bg-success/10 px-1.5 py-0.5 rounded">Stable</span>
                            </div>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Shield size={20} className="text-primary" />
                        </div>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '99.8%' }}></div>
                    </div>
                </div>

                <div className="bg-surface border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Active Nodes</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">{metrics.activeNodes}</span>
                                <span className="text-warning text-xs font-bold bg-warning/10 px-1.5 py-0.5 rounded">-2 Nodes</span>
                            </div>
                        </div>
                        <div className="p-2 bg-success/10 rounded-lg">
                            <Server size={20} className="text-success" />
                        </div>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-success rounded-full" style={{ width: '90%' }}></div>
                    </div>
                </div>

                <div className="bg-surface border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Threats Detected</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">{metrics.threats}</span>
                                <span className="text-danger text-xs font-bold bg-danger/10 px-1.5 py-0.5 rounded">+{metrics.threats} New</span>
                            </div>
                        </div>
                        <div className="p-2 bg-danger/10 rounded-lg">
                            <AlertTriangle size={20} className="text-danger" />
                        </div>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-danger rounded-full" style={{ width: '15%' }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Server size={18} />
                            Node Distribution Map
                        </h3>
                        <div className="flex gap-2 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-success"></div>
                                <span className="text-gray-400">Secure</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-warning"></div>
                                <span className="text-gray-400">Warning</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-danger"></div>
                                <span className="text-gray-400">Critical</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-96 bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-sm">
                            Node Activity Map
                        </div>

                        {metrics.nodes && metrics.nodes.map((node, i) => {
                            // Assign a pseudo-random position based on index to spread them out on the map
                            const top = 20 + ((i * 37) % 60);
                            const left = 20 + ((i * 43) % 60);
                            const colorClass = node.status === 'active' ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-danger shadow-[0_0_10px_rgba(239,68,68,0.5)]';
                            
                            return (
                                <div key={node.id} className="absolute group" style={{ top: `${top}%`, left: `${left}%` }}>
                                    <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-gray-700 px-2 py-1 rounded text-[10px] whitespace-nowrap z-10">
                                        {node.name} ({node.status})<br/>Load: {node.load}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-surface border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Activity size={18} />
                            Security Activity
                        </h3>
                        <button className="text-primary text-xs hover:underline">View All</button>
                    </div>

                    <div className="space-y-3">
                        {activities.map(activity => {
                            const Icon = getActivityIcon(activity.type);
                            return (
                                <div key={activity.id} className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            activity.severity === 'critical' ? 'bg-danger/10' :
                                                activity.severity === 'warning' ? 'bg-warning/10' :
                                                    activity.severity === 'success' ? 'bg-success/10' : 'bg-gray-800'
                                        )}>
                                            <Icon size={14} className={cn(
                                                activity.severity === 'critical' ? 'text-danger' :
                                                    activity.severity === 'warning' ? 'text-warning' :
                                                        activity.severity === 'success' ? 'text-success' : 'text-gray-400'
                                            )} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-xs font-medium leading-tight">{activity.message}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-gray-500">{activity.time}</span>
                                                <span className="text-[10px] text-gray-600">•</span>
                                                <span className="text-[10px] text-gray-500">{activity.node}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="mt-6 pt-6 border-t border-gray-800">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <Shield size={12} className="text-primary" />
                                Gemini AI Insight
                            </h4>
                            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                <p className="text-xs text-gray-300 italic leading-relaxed">
                                    {aiInsights || "Generating real-time security context..."}
                                </p>
                            </div>
                        </div>

                        {activities.length === 0 && (
                            <div className="py-8 text-center text-gray-500 text-sm">
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface border border-gray-800 rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4">System Health</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Global Latency</span>
                                <span className="text-success font-mono">{metrics.globalLatency}ms <span className="text-gray-600">(-2ms)</span></span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-success rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Throughput</span>
                                <span className="text-primary font-mono">{metrics.throughput} MB/s</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: '95%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Security Overhead</span>
                                <span className="text-warning font-mono">{metrics.securityOverhead}%</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-warning rounded-full" style={{ width: '5%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-surface border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Zap size={18} />
                            AI Security Recommendations
                        </h3>
                        <button
                            onClick={refreshRecommendations}
                            disabled={fetchingRecs}
                            className="text-primary text-xs hover:underline flex items-center gap-1"
                        >
                            {fetchingRecs ? 'Analyzing...' : 'Refresh AI'}
                        </button>
                    </div>
                    <div className="space-y-3">
                        {recommendations.length > 0 ? (
                            recommendations.map((rec, idx) => (
                                <div key={idx} className="p-3 bg-gray-900 border-l-2 border-primary rounded-r-lg">
                                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                                        {rec}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="py-4 text-center text-gray-600 text-xs italic">
                                No recommendations found. System posture is stable.
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-800">
                            <button onClick={handleRotateKeys} className="p-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors text-left flex items-center gap-2">
                                <Key size={14} className="text-primary" />
                                <span className="text-white text-[10px] font-medium">Rotate Keys</span>
                            </button>
                            <button onClick={handleIsolateNode} className="p-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors text-left flex items-center gap-2">
                                <Ban size={14} className="text-danger" />
                                <span className="text-white text-[10px] font-medium">Isolate Node</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
