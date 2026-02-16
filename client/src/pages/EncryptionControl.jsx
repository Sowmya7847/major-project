import { Key, ShieldCheck, RefreshCw, Archive, Plus, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import API from '../services/api';

const LifecycleStep = ({ title, date, status, icon: Icon, active, completed }) => (
    <div className="flex flex-col items-center relative z-10">
        <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all mb-3",
            active ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_#00E5FF]"
                : completed ? "bg-gray-800 border-gray-600 text-gray-400"
                    : "bg-surface border-gray-800 text-gray-600"
        )}>
            <Icon size={20} />
        </div>
        <h3 className={cn("font-bold text-sm", active ? "text-white" : "text-gray-500")}>{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{date}</p>

        {/* Status Badge */}
        {active && (
            <span className="mt-2 px-2 py-0.5 bg-success/10 text-success text-[10px] uppercase font-bold rounded tracking-wider">
                Active
            </span>
        )}
    </div>
);

const EncryptionControl = () => {
    const [autoRotation, setAutoRotation] = useState(true);
    const [activeKey, setActiveKey] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchActiveKey();
    }, []);

    const fetchActiveKey = async () => {
        try {
            const { data } = await API.get('/keys/active');
            setActiveKey(data);
        } catch (error) {
            console.error('No active key found', error);
        }
    };

    const handleRotate = async () => {
        setLoading(true);
        try {
            await API.post('/keys/rotate');
            await fetchActiveKey();
            setMessage('Key rotated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to rotate key.');
        } finally {
            setLoading(false);
        }
    };

    const heatMapData = Array.from({ length: 28 }).map((_, i) => ({
        val: Math.floor(Math.random() * 5), // 0-4 intensity
    }));

    const getHeatColor = (val) => {
        if (val === 4) return 'bg-danger';
        if (val === 3) return 'bg-orange-500';
        if (val === 2) return 'bg-yellow-500';
        if (val === 1) return 'bg-gray-700';
        return 'bg-gray-800';
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Encryption Control</h1>
                    <p className="text-gray-400 text-sm">Manage key lifecycles, enforce rotation policies, and monitor operations.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-surface border border-gray-700 text-gray-300 rounded-lg hover:bg-surfaceHover transition-colors flex items-center gap-2 text-sm font-medium">
                        <RefreshCw size={16} /> Audit Logs
                    </button>
                    <button className="px-4 py-2 bg-danger hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-bold shadow-lg shadow-danger/20">
                        <Plus size={16} /> Generate Master Key
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Master Key Lifecycle */}
                <div className="lg:col-span-2 bg-surface border border-gray-800 rounded-xl p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-6 bg-primary rounded-full"></span>
                            Current Master Key Lifecycle
                        </h2>
                        <span className="px-2 py-1 bg-success/10 text-success text-xs font-bold rounded">ACTIVE</span>
                    </div>

                    <div className="relative flex justify-between px-10">
                        {/* Connecting Line */}
                        <div className="absolute top-6 left-16 right-16 h-0.5 bg-gray-800 -z-0"></div>
                        <div className="absolute top-6 left-16 right-[30%] h-0.5 bg-primary/30 -z-0"></div>

                        <LifecycleStep
                            title="Generated"
                            date="Jan 10, 2026"
                            icon={Key}
                            completed={true}
                        />
                        <LifecycleStep
                            title="Activated"
                            date="Jan 12, 2026"
                            icon={ShieldCheck}
                            active={true}
                        />
                        <LifecycleStep
                            title="Scheduled Rotation"
                            date="Due in 14 days"
                            icon={RefreshCw}
                        />
                        <LifecycleStep
                            title="Archival"
                            date="Future State"
                            icon={Archive}
                        />
                    </div>
                </div>

                {/* Rotation Policy */}
                <div className="bg-surface border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <RefreshCw size={18} className="text-danger" /> Rotation Policy
                            </h2>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between mb-6">
                            <div>
                                <h4 className="font-bold text-white text-sm">Auto-Rotation</h4>
                                <p className="text-xs text-gray-500">Rotate keys automatically</p>
                            </div>
                            <button
                                onClick={() => setAutoRotation(!autoRotation)}
                                className={cn(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                    autoRotation ? "bg-danger" : "bg-gray-700"
                                )}
                            >
                                <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", autoRotation ? "translate-x-6" : "translate-x-1")} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Rotation Interval</label>
                            <div className="flex">
                                <input type="number" value="90" className="w-20 bg-gray-900 border border-gray-700 border-r-0 rounded-l-lg px-3 py-2 text-white text-center font-mono focus:outline-none" readOnly />
                                <div className="bg-gray-800 border border-gray-700 rounded-r-lg px-3 py-2 text-sm text-gray-400">Days</div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-3 border border-danger text-danger hover:bg-danger hover:text-white rounded-lg transition-colors font-bold text-sm flex items-center justify-center gap-2">
                        <RefreshCw size={16} /> Rotate Now
                    </button>
                </div>

                {/* Key Usage Density */}
                <div className="lg:col-span-2 bg-surface border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-6 bg-warning rounded-full"></span>
                            Key Usage Density
                        </h2>
                        <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">Last 24 Hours</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">Real-time cryptographic operations per node cluster.</p>

                    <div className="grid grid-cols-14 gap-1">
                        {heatMapData.map((d, i) => (
                            <div key={i} className={cn("h-8 rounded-sm transition-all hover:scale-110", getHeatColor(d.val))} title={`Activity: ${d.val}`}></div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider items-center">
                        <span>Low</span>
                        <div className="w-16 h-2 bg-gradient-to-r from-gray-800 via-yellow-500 to-danger rounded-full"></div>
                        <span>High</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface border border-gray-800 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                        <Key size={32} className="text-danger mb-2" />
                        <div className="text-2xl font-bold text-white">1,248</div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Active Keys</div>
                    </div>
                    <div className="bg-surface border border-gray-800 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                        <AlertTriangle size={32} className="text-warning mb-2" />
                        <div className="text-2xl font-bold text-white">3</div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Expiring Soon</div>
                    </div>
                </div>
            </div>

            {/* Active Key Inventory */}
            <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Active Key Inventory</h2>
                    <input type="text" placeholder="Search by Key ID..." className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-64" />
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-900 text-gray-500 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Key ID</th>
                            <th className="p-4">Algorithm</th>
                            <th className="p-4">Created Date</th>
                            <th className="p-4">Next Rotation</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        <tr className="hover:bg-surfaceHover transition-colors">
                            <td className="p-4 font-mono text-white text-sm">K-9021-X2</td>
                            <td className="p-4 text-gray-300 text-sm">AES-256</td>
                            <td className="p-4 text-gray-400 text-sm">Jan 10, 2023</td>
                            <td className="p-4 text-warning text-sm font-bold">14 days</td>
                            <td className="p-4"><span className="bg-success/10 text-success text-xs px-2 py-1 rounded font-bold uppercase">Active</span></td>
                            <td className="p-4 text-right"><button className="text-danger text-xs font-bold uppercase hover:underline">Manage</button></td>
                        </tr>
                        <tr className="hover:bg-surfaceHover transition-colors">
                            <td className="p-4 font-mono text-white text-sm">K-8812-B9</td>
                            <td className="p-4 text-gray-300 text-sm">ChaCha20</td>
                            <td className="p-4 text-gray-400 text-sm">Dec 15, 2022</td>
                            <td className="p-4 text-gray-500 text-sm">65 days</td>
                            <td className="p-4"><span className="bg-success/10 text-success text-xs px-2 py-1 rounded font-bold uppercase">Active</span></td>
                            <td className="p-4 text-right"><button className="text-danger text-xs font-bold uppercase hover:underline">Manage</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EncryptionControl;
