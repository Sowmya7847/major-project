import { useState, useEffect } from 'react';
import { Settings, Shield, Cpu, Activity, Save, RefreshCw, Lock, AlertCircle } from 'lucide-react';
import API from '../services/api';
import { cn } from '../lib/utils';

const SystemConfig = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const { data } = await API.get('/config');
            setConfig(data);
        } catch (error) {
            console.error('Failed to fetch config', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await API.put('/config', config);
            setMessage({ type: 'success', text: 'Configuration saved successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update configuration.' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return <div className="flex items-center justify-center p-20"><RefreshCw className="animate-spin text-primary" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">System Configuration</h1>
                    <p className="text-gray-400 text-sm">Fine-tune global security and infrastructure parameters.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-primary hover:bg-primaryHover text-black rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {message.text && (
                <div className={cn(
                    "p-4 rounded-lg flex items-center gap-3 border animate-in slide-in-from-top-2",
                    message.type === 'success' ? "bg-success/10 border-success/20 text-success" : "bg-danger/10 border-danger/20 text-danger"
                )}>
                    {message.type === 'success' ? <Shield size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cryptographic Settings */}
                <div className="bg-surface border border-gray-800 rounded-xl p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <Lock size={18} className="text-primary" />
                        Cryptographic Settings
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Global Encryption Algorithm</label>
                            <select
                                value={config.encryptionMode}
                                onChange={(e) => handleChange('encryptionMode', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                            >
                                <option value="AES-256-GCM">AES-256-GCM (Recommended)</option>
                                <option value="ChaCha20-Poly1305">ChaCha20-Poly1305</option>
                                <option value="AES-256-CBC">AES-256-CBC (Legacy Support)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Default Chunk Count</label>
                            <input
                                type="number"
                                value={config.defaultChunkCount}
                                onChange={(e) => handleChange('defaultChunkCount', parseInt(e.target.value))}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800">
                            <div>
                                <h4 className="text-sm font-medium text-white">Require Multi-Node Storage</h4>
                                <p className="text-[10px] text-gray-500">Ensure chunks are distributed across 3+ nodes</p>
                            </div>
                            <button
                                onClick={() => handleChange('requireMFAForAdmin', !config.requireMFAForAdmin)}
                                className={cn(
                                    "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
                                    config.requireMFAForAdmin ? "bg-primary" : "bg-gray-700"
                                )}
                            >
                                <span className={cn("inline-block h-3 w-3 transform rounded-full bg-white transition-transform", config.requireMFAForAdmin ? "translate-x-5" : "translate-x-1")} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI & Analytics Thresholds */}
                <div className="bg-surface border border-gray-800 rounded-xl p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <Activity size={18} className="text-warning" />
                        AI & Anomaly Thresholds
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">ML Anomaly Sensitivity</label>
                                <span className="text-xs text-primary font-mono">{config.mlAnomalyThreshold}%</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="95"
                                value={config.mlAnomalyThreshold}
                                onChange={(e) => handleChange('mlAnomalyThreshold', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Max Failed Logins Threshold</label>
                                <span className="text-xs text-warning font-mono">{config.maxLoginAttempts} Attempts</span>
                            </div>
                            <input
                                type="range"
                                min="3"
                                max="20"
                                value={config.maxLoginAttempts}
                                onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-warning"
                            />
                        </div>
                        <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                            <p className="text-[10px] text-yellow-500/80 leading-relaxed">
                                <AlertCircle size={10} className="inline mr-1" />
                                Lowering sensitivity might increase noise in AI reports, while raising it may ignore subtle lateral movement.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Performance & Infrastructure */}
                <div className="bg-surface border border-gray-800 rounded-xl p-6 md:col-span-2">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <Cpu size={18} className="text-success" />
                        Infrastructure & Performance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Compression Level</label>
                            <select
                                value={config.compressionLevel}
                                onChange={(e) => handleChange('compressionLevel', parseInt(e.target.value))}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                            >
                                <option value={0}>None</option>
                                <option value={1}>Fast</option>
                                <option value={6}>Balanced</option>
                                <option value={9}>Max Compression</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Audit Log TTL (Days)</label>
                            <input
                                type="number"
                                value={config.auditLogRetentionDays}
                                onChange={(e) => handleChange('auditLogRetentionDays', parseInt(e.target.value))}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Session Timeout (Min)</label>
                            <input
                                type="number"
                                value={config.sessionTimeout || 60}
                                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemConfig;
