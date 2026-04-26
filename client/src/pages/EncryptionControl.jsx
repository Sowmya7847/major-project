import { useState, useEffect } from 'react';
import { Key, ShieldCheck, RefreshCw, Archive, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
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

        {active && (
            <span className="mt-2 px-2 py-0.5 bg-success/10 text-success text-[10px] uppercase font-bold rounded tracking-wider">
                Active
            </span>
        )}
    </div>
);

const EncryptionControl = () => {
    const [activeKey, setActiveKey] = useState(null);
    const [allKeys, setAllKeys] = useState([]);
    const [keyStats, setKeyStats] = useState({ activeCount: 0, rotatedCount: 0, expiringCount: 0 });
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState('');
    const [rotationInterval, setRotationInterval] = useState(90);
    const [autoRotation, setAutoRotation] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [activeRes, allRes, statsRes] = await Promise.all([
                API.get('/keys/active').catch(() => ({ data: null })),
                API.get('/keys/all'),
                API.get('/keys/stats')
            ]);
            setActiveKey(activeRes.data);
            setAllKeys(allRes.data);
            setKeyStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch keys', error);
        }
    };

    const handleRotate = async () => {
        setLoading(true);
        try {
            await API.post('/keys/rotate');
            setMessage('✅ Key rotated successfully!');
            await fetchAll();
        } catch (error) {
            setMessage('❌ Failed to rotate key: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 4000);
        }
    };

    const handleGenerateKey = async () => {
        setGenerating(true);
        try {
            await API.post('/keys/generate');
            setMessage('✅ New master key generated!');
            await fetchAll();
        } catch (error) {
            setMessage('❌ Failed to generate key.');
        } finally {
            setGenerating(false);
            setTimeout(() => setMessage(''), 4000);
        }
    };

    // Build heatmap from real key usage (one cell per key, colour by status)
    const heatMapData = allKeys.slice(0, 28).map(k => ({
        val: k.isActive ? 4 : k.status === 'rotated' ? 2 : 1,
        label: k._id?.slice(-6)
    }));
    // Pad to 28 cells
    while (heatMapData.length < 28) heatMapData.push({ val: 0 });

    const getHeatColor = (val) => {
        if (val === 4) return 'bg-success';
        if (val === 3) return 'bg-orange-500';
        if (val === 2) return 'bg-yellow-500';
        if (val === 1) return 'bg-gray-700';
        return 'bg-gray-800';
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
    const daysUntil = (d) => {
        if (!d) return null;
        const diff = Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? `${diff} days` : 'Expired';
    };

    const filteredKeys = allKeys.filter(k =>
        k._id?.toLowerCase().includes(search.toLowerCase()) ||
        k.algorithm?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Encryption Control</h1>
                    <p className="text-gray-400 text-sm">Manage key lifecycles, enforce rotation policies, and monitor operations.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRotate}
                        disabled={loading}
                        className="px-4 py-2 bg-surface border border-gray-700 text-gray-300 rounded-lg hover:bg-surfaceHover transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> {loading ? 'Rotating...' : 'Rotate Keys'}
                    </button>
                    <button
                        onClick={handleGenerateKey}
                        disabled={generating}
                        className="px-4 py-2 bg-danger hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-bold shadow-lg shadow-danger/20 disabled:opacity-50"
                    >
                        <Plus size={16} /> {generating ? 'Generating...' : 'Generate Master Key'}
                    </button>
                </div>
            </div>

            {/* Toast */}
            {message && (
                <div className={cn(
                    "px-4 py-3 rounded-lg border text-sm font-medium",
                    message.startsWith('✅') ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'
                )}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Master Key Lifecycle */}
                <div className="lg:col-span-2 bg-surface border border-gray-800 rounded-xl p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-6 bg-primary rounded-full"></span>
                            Current Master Key Lifecycle
                        </h2>
                        <span className={cn(
                            "px-2 py-1 text-xs font-bold rounded",
                            activeKey ? "bg-success/10 text-success" : "bg-gray-800 text-gray-400"
                        )}>
                            {activeKey ? 'ACTIVE' : 'NO KEY'}
                        </span>
                    </div>

                    {activeKey ? (
                        <div className="relative flex justify-between px-10">
                            <div className="absolute top-6 left-16 right-16 h-0.5 bg-gray-800 -z-0"></div>
                            <div className="absolute top-6 left-16 right-[50%] h-0.5 bg-primary/30 -z-0"></div>

                            <LifecycleStep
                                title="Generated"
                                date={fmtDate(activeKey.createdAt)}
                                icon={Key}
                                completed={true}
                            />
                            <LifecycleStep
                                title="Activated"
                                date={fmtDate(activeKey.updatedAt)}
                                icon={ShieldCheck}
                                active={true}
                            />
                            <LifecycleStep
                                title="Rotation Due"
                                date={activeKey.expiryDate ? `In ${daysUntil(activeKey.expiryDate)}` : `In ${rotationInterval} days`}
                                icon={RefreshCw}
                            />
                            <LifecycleStep
                                title="Archival"
                                date="Future State"
                                icon={Archive}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Key size={32} className="mx-auto mb-3 opacity-30" />
                            <p>No active key. Click "Generate Master Key" to create one.</p>
                        </div>
                    )}

                    {activeKey && (
                        <div className="mt-8 pt-6 border-t border-gray-800 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Key ID</p>
                                <p className="font-mono text-white text-xs">{activeKey._id}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Algorithm</p>
                                <p className="font-mono text-primary uppercase">{activeKey.algorithm}</p>
                            </div>
                        </div>
                    )}
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
                                <input
                                    type="number"
                                    value={rotationInterval}
                                    onChange={e => setRotationInterval(parseInt(e.target.value) || 90)}
                                    className="w-20 bg-gray-900 border border-gray-700 border-r-0 rounded-l-lg px-3 py-2 text-white text-center font-mono focus:outline-none focus:border-primary"
                                />
                                <div className="bg-gray-800 border border-gray-700 rounded-r-lg px-3 py-2 text-sm text-gray-400">Days</div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleRotate}
                        disabled={loading}
                        className="w-full py-3 border border-danger text-danger hover:bg-danger hover:text-white rounded-lg transition-colors font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> {loading ? 'Rotating...' : 'Rotate Now'}
                    </button>
                </div>

                {/* Key Usage Density (real data heat map) */}
                <div className="lg:col-span-2 bg-surface border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-6 bg-warning rounded-full"></span>
                            Key Usage Density
                        </h2>
                        <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">All-Time</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">Each cell represents a key. Green = Active, Yellow = Rotated, Dark = Inactive.</p>

                    <div className="grid grid-cols-14 gap-1">
                        {heatMapData.map((d, i) => (
                            <div key={i} className={cn("h-8 rounded-sm transition-all hover:scale-110 cursor-pointer", getHeatColor(d.val))} title={d.label ? `Key: ${d.label}` : 'Empty'}></div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider items-center">
                        <span>Inactive</span>
                        <div className="w-16 h-2 bg-gradient-to-r from-gray-800 via-yellow-500 to-success rounded-full"></div>
                        <span>Active</span>
                    </div>
                </div>

                {/* Live Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface border border-gray-800 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                        <Key size={32} className="text-danger mb-2" />
                        <div className="text-2xl font-bold text-white">{keyStats.activeCount}</div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Active Keys</div>
                    </div>
                    <div className="bg-surface border border-gray-800 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                        <AlertTriangle size={32} className="text-warning mb-2" />
                        <div className="text-2xl font-bold text-white">{keyStats.expiringCount}</div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Expiring Soon</div>
                    </div>
                </div>
            </div>

            {/* Active Key Inventory — LIVE */}
            <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Active Key Inventory</h2>
                    <input
                        type="text"
                        placeholder="Search by Key ID or Algorithm..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-72"
                    />
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-900 text-gray-500 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Key ID</th>
                            <th className="p-4">Algorithm</th>
                            <th className="p-4">Created Date</th>
                            <th className="p-4">Expiry / Rotation</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filteredKeys.map(k => (
                            <tr key={k._id} className="hover:bg-surfaceHover transition-colors">
                                <td className="p-4 font-mono text-white text-sm">{k._id?.slice(-12).toUpperCase()}</td>
                                <td className="p-4 text-gray-300 text-sm uppercase">{k.algorithm}</td>
                                <td className="p-4 text-gray-400 text-sm">{fmtDate(k.createdAt)}</td>
                                <td className="p-4 text-sm">
                                    {k.expiryDate
                                        ? <span className="text-warning font-bold">{daysUntil(k.expiryDate)}</span>
                                        : <span className="text-gray-500">—</span>
                                    }
                                </td>
                                <td className="p-4">
                                    <span className={cn(
                                        "text-xs px-2 py-1 rounded font-bold uppercase",
                                        k.isActive ? "bg-success/10 text-success" : "bg-gray-800 text-gray-500"
                                    )}>
                                        {k.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {k.isActive ? (
                                        <span className="text-success text-xs font-bold flex items-center justify-end gap-1">
                                            <CheckCircle size={12} /> In Use
                                        </span>
                                    ) : (
                                        <span className="text-gray-600 text-xs">Rotated</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredKeys.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    No keys found. Generate a master key to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EncryptionControl;
