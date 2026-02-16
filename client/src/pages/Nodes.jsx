import { Server, Activity, Database, Cloud, Globe } from 'lucide-react';

const NodeItem = ({ name, region, status, storage, latency, load }) => (
    <div className="bg-surface border border-gray-800 rounded-xl p-6 hover:border-primary/50 transition-colors group">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-900 rounded-lg group-hover:scale-110 transition-transform">
                    <Server size={20} className={status === 'online' ? 'text-success' : 'text-danger'} />
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm">{name}</h3>
                    <p className="text-xs text-gray-500">{region}</p>
                </div>
            </div>
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${status === 'online' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {status}
            </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
                <p className="text-xs text-gray-500 mb-1">Storage Used</p>
                <div className="flex items-end gap-1">
                    <span className="text-lg font-bold text-white">{storage}%</span>
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full mb-1.5">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${storage}%` }}></div>
                    </div>
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
            <span className="text-gray-500">Load: {load} req/s</span>
            <button className="text-primary hover:text-white transition-colors font-medium">View Logs</button>
        </div>
    </div>
);

const Nodes = () => {
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
                        <p className="text-2xl font-bold text-white">4</p>
                    </div>
                </div>
                <div className="bg-surface border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-success/10 rounded-full text-success"><Server size={24} /></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Online Nodes</p>
                        <p className="text-2xl font-bold text-white">12/12</p>
                    </div>
                </div>
                <div className="bg-surface border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-full text-purple-400"><Database size={24} /></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Total Storage</p>
                        <p className="text-2xl font-bold text-white">45.2 TB</p>
                    </div>
                </div>
                <div className="bg-surface border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-warning/10 rounded-full text-warning"><Activity size={24} /></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Avg Latency</p>
                        <p className="text-2xl font-bold text-white">24ms</p>
                    </div>
                </div>
            </div>

            {/* Node Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <NodeItem name="US-East-1-Gateway" region="N. Virginia" status="online" storage={45} latency={12} load={120} />
                <NodeItem name="US-West-2-N1" region="Oregon" status="online" storage={78} latency={65} load={85} />
                <NodeItem name="EU-Central-1-Auth" region="Frankfurt" status="online" storage={23} latency={140} load={42} />
                <NodeItem name="AP-South-1-Storage" region="Mumbai" status="online" storage={89} latency={210} load={215} />
                <NodeItem name="SA-East-1-Backup" region="São Paulo" status="offline" storage={0} latency={0} load={0} />
                <NodeItem name="Global-Controller" region="Anycast" status="online" storage={12} latency={5} load={450} />
            </div>
        </div>
    );
};

export default Nodes;
