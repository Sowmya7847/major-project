import { useState, useEffect } from 'react';
import { Server, Activity, Database, Cloud, Globe } from 'lucide-react';
import API from '../services/api';

const NodeItem = ({ name, region, status, storage, latency, load }) => (
    <div className="bg-surface border border-gray-800 rounded-xl p-6 hover:border-primary/50 transition-colors group">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-900 rounded-lg group-hover:scale-110 transition-transform">
                    <Server size={20} className={status === 'active' ? 'text-success' : 'text-danger'} />
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm">{name}</h3>
                    <p className="text-xs text-gray-500">{region || 'Unknown Region'}</p>
                </div>
            </div>
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${status === 'active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {status}
            </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
                <p className="text-xs text-gray-500 mb-1">Storage Used</p>
                <div className="flex items-end gap-1">
                    <span className="text-lg font-bold text-white">{storage ? (storage / (1024 * 1024)).toFixed(2) : 0} MB</span>
                </div>
            </div>
            <div>
                <p className="text-xs text-gray-500 mb-1">Latency</p>
                <div className="flex items-center gap-1 text-sm font-mono text-gray-300">
                    <Activity size={12} /> {latency}ms
                </div>
            </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center text-xs">
            <span className="text-gray-500">Load: {load || 0} req/s</span>
            <button className="text-primary hover:text-white transition-colors font-medium">View Logs</button>
        </div>
    </div>
);

const Nodes = () => {
    const [nodes, setNodes] = useState([]);
    const [stats, setStats] = useState({
        activeRegions: 0,
        onlineNodes: 0,
        totalNodes: 0,
        totalStorageGB: 0,
        avgLatency: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNodes = async () => {
            try {
                const { data } = await API.get('/nodes');
                setNodes(data.nodes);
                setStats(prev => ({
                    ...prev,
                    ...data.stats,
                    activeRegions: new Set(data.nodes.map(n => n.url)).size // Estimate regions based on distinct URLs/paths
                }));
            } catch (error) {
                console.error("Failed to fetch nodes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNodes();
        const interval = setInterval(fetchNodes, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Distributed Node Network</h1>
                    <p className="text-gray-400 text-sm">Monitor health and storage across geographically distributed encryption nodes.</p>
                </div>
                <button className="px-4 py-2 bg-primary hover:bg-primaryHover text-black font-bold rounded-lg transition-colors flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                    <Cloud size={16} /> Deploy New Node
                </button>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-surface border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-full text-blue-400"><Globe size={24} /></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Active Regions</p>
                        <p className="text-2xl font-bold text-white">{stats.activeRegions}</p>
                    </div>
                </div>
                <div className="bg-surface border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-success/10 rounded-full text-success"><Server size={24} /></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Online Nodes</p>
                        <p className="text-2xl font-bold text-white">{stats.activeNodes}/{stats.totalNodes}</p>
                    </div>
                </div>
                <div className="bg-surface border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-full text-purple-400"><Database size={24} /></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Total Storage</p>
                        <p className="text-2xl font-bold text-white">{stats.totalStorageGB} GB</p>
                    </div>
                </div>
                <div className="bg-surface border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-warning/10 rounded-full text-warning"><Activity size={24} /></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Avg Latency</p>
                        <p className="text-2xl font-bold text-white">{stats.avgLatency}ms</p>
                    </div>
                </div>
            </div>

            {/* Node Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nodes.map(node => (
                    <NodeItem
                        key={node.nodeId}
                        name={node.name}
                        region={node.url.includes('local') ? 'Local Cluster' : 'Remote'}
                        status={node.status}
                        storage={node.storageUsed}
                        latency={node.lastResponseTime || node.latencyMs}
                        load={node.load}
                    />
                ))}

                {nodes.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No nodes connected. System initializing...
                    </div>
                )}
            </div>
        </div>
    );
};

export default Nodes;
