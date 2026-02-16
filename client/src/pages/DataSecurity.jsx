import { useState, useEffect } from 'react';
import { Shield, Lock, RefreshCw, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

const Toggle = ({ enabled, onChange }) => (
    <button
        onClick={() => onChange(!enabled)}
        className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900",
            enabled ? "bg-primary" : "bg-gray-700"
        )}
    >
        <span
            className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                enabled ? "translate-x-6" : "translate-x-1"
            )}
        />
    </button>
);

const DataSecurity = () => {
    const [config, setConfig] = useState({
        endToEndEncryption: true,
        hmacVerification: true,
        autoKeyRotation: false,
    });
    const [algorithm, setAlgorithm] = useState('AES-256-GCM');
    const [inputText, setInputText] = useState('{\n  "name": "John Doe",\n  "cc": "4532-xxxx-xxxx-8899",\n  "ssn": "xxx-xx-6789"\n}');
    const [encryptedPreview, setEncryptedPreview] = useState('');

    useEffect(() => {
        // Simulate encryption for preview
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let result = "";
        for (let i = 0; i < inputText.length * 1.5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setEncryptedPreview(result.match(/.{1,45}/g)?.join('\n') || '');
    }, [inputText, algorithm]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Shield className="text-primary h-8 w-8" />
                        Data Security Configuration
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse"></div>
                        <span className="text-success text-sm font-medium">System Status: Operational</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-surface border border-gray-700 text-gray-300 rounded-lg hover:bg-surfaceHover transition-colors flex items-center gap-2 font-medium">
                        <RefreshCw size={18} /> View History
                    </button>
                    <button className="px-4 py-2 bg-danger hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 font-bold shadow-lg shadow-danger/20">
                        <Lock size={18} /> Save Configuration
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Controls */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Toggle Card */}
                    <div className="bg-surface border border-gray-800 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                                    <Shield size={32} className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">End-to-End Encryption</h3>
                                    <p className="text-gray-400 text-sm mt-1 max-w-md">
                                        Data is encrypted at the source and decrypted only at the destination. Keys are managed by the client.
                                    </p>
                                </div>
                            </div>
                            <Toggle
                                enabled={config.endToEndEncryption}
                                onChange={(v) => setConfig({ ...config, endToEndEncryption: v })}
                            />
                        </div>
                    </div>

                    {/* Algo Selection */}
                    <div className="bg-surface border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6">Encryption Parameters</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Algorithm</label>
                                <select
                                    value={algorithm}
                                    onChange={(e) => setAlgorithm(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                >
                                    <option>AES-256-GCM (Recommended)</option>
                                    <option>ChaCha20-Poly1305</option>
                                    <option>AES-256-CBC (Legacy)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    GCM mode provides both confidentiality and integrity authentication.
                                </p>

                                <div className="mt-6 flex items-center gap-3">
                                    <div className={`p-1 rounded ${config.hmacVerification ? 'bg-primary' : 'bg-gray-700'}`}>
                                        <CheckCircle size={14} className="text-black" />
                                    </div>
                                    <span className="text-sm text-gray-300">Enable HMAC Integrity Verification</span>
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-gray-400">Security vs. Performance</span>
                                    <span className="text-xs bg-danger/10 text-danger px-2 py-1 rounded font-bold">High Security</span>
                                </div>
                                {/* Slider Visualization */}
                                <div className="relative h-2 bg-gray-700 rounded-full mb-2">
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-danger rounded-full shadow-[0_0_10px_#FF3D3D]"></div>
                                    <div className="absolute inset-y-0 left-0 right-2 bg-gradient-to-r from-green-500 via-yellow-500 to-danger rounded-full opacity-50"></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                                    <span>Performance</span>
                                    <span>Balanced</span>
                                    <span>Max Security</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Rotation Info */}
                    <div className="bg-surface border border-gray-800 rounded-xl p-6 flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <RefreshCw size={20} className="text-primary" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">Compliance Check</h4>
                            <p className="text-gray-400 text-sm mt-1">
                                Configuring <span className="text-primary">AES-256</span> with <span className="text-primary">90-day</span> rotation meets
                                <span className="font-bold text-white"> SOC2 Type II</span> and <span className="font-bold text-white">GDPR</span> requirements.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Preview */}
                <div className="lg:col-span-1 bg-surface border border-gray-800 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center gap-2">
                        <Eye size={18} className="text-gray-400" />
                        <h3 className="font-bold text-white text-sm">Live Encryption Preview</h3>
                    </div>

                    <div className="flex-1 p-0 flex flex-col">
                        <div className="flex-1 p-4 border-b border-gray-800">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Input Data (JSON)</label>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="w-full h-32 bg-transparent text-gray-300 font-mono text-sm resize-none focus:outline-none"
                                spellCheck="false"
                            />
                        </div>
                        <div className="flex-1 p-4 bg-gray-900 relative group">
                            <label className="text-xs font-bold text-primary uppercase mb-2 block flex justify-between">
                                <span>Encrypted Output</span>
                                <Lock size={12} />
                            </label>
                            <div className="font-mono text-xs text-success break-all opacity-80 group-hover:opacity-100 transition-opacity">
                                {encryptedPreview}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataSecurity;
