import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import API from '../services/api';
import { Upload, FileText, Download, Shield, Mail, Briefcase, CheckCircle, AlertTriangle, Info, MoreVertical, Share2, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [algorithm, setAlgorithm] = useState('aes');
    const [uploadProgress, setUploadProgress] = useState(0);

    const [policy, setPolicy] = useState('');
    const [alerts, setAlerts] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchAll = () => {
            fetchFiles();
            fetchAlerts();
        };
        
        fetchAll();
        
        // Polling for updates
        const interval = setInterval(() => {
            fetchAll();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            const { data } = await API.get('/security/logs?limit=3');
            if (data) setAlerts(data);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        }
    };

    const fetchFiles = async () => {
        try {
            const { data } = await API.get('/files');
            if (data && data.length > 0) setFiles(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        setUploading(true);
        setUploadProgress(0);

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 95) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 5;
            });
        }, 200);

        const formData = new FormData();
        formData.append('file', selectedFile);

        if (algorithm === 'cp-abe') {
            formData.append('scheme', 'cp-abe');
            formData.append('policy', policy || 'Role:Admin');
        } else {
            formData.append('scheme', 'aes');
            formData.append('algorithm', algorithm === 'aes' ? 'lightweight' : 'heavy');
        }

        try {
            await API.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            clearInterval(interval);
            setUploadProgress(100);
            setTimeout(() => {
                setSelectedFile(null);
                setUploading(false);
                setUploadProgress(0);
                fetchFiles();
            }, 500);
        } catch (error) {
            clearInterval(interval);
            alert('Upload failed: ' + (error.response?.data?.message || error.message));
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDownload = async (fileId, fileName) => {
        if (fileId.length < 5) return; // mock id
        try {
            const response = await API.get(`/files/${fileId}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            alert('Download failed: ' + (error.response?.data?.message || 'Access Denied'));
        }
    };

    const exportFilesCSV = () => {
        if (files.length === 0) return;
        const headers = "Filename,Algorithm,Status,Risk Score\n";
        const csv = files.map(f => `${f.originalName},${f.algorithm || 'AES-GCM'},${f.status},${f.geminiAnalysis?.riskScore || 0}`).join("\n");
        const blob = new Blob([headers + csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recent_files_report_${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            {user?.role === 'admin' ? (
                <h1 className="text-2xl font-bold text-white tracking-tight mb-6">Data Upload Module</h1>
            ) : (
                <h1 className="text-2xl font-bold text-white tracking-tight mb-6">User Profile</h1>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1 bg-[#111822] border border-[#1e293b] rounded-2xl p-8 shadow-lg h-fit relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    
                    <div className="flex flex-col items-center text-center relative z-10">
                        {/* Avatar with Circular Progress Ring */}
                        <div className="relative w-28 h-28 mb-6">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="transparent" stroke="#1e293b" strokeWidth="3" />
                                <circle 
                                    cx="50" cy="50" r="45" 
                                    fill="transparent" 
                                    stroke="#00e5ff" 
                                    strokeWidth="3" 
                                    strokeDasharray="282.7" 
                                    strokeDashoffset="84.8" /* ~70% */
                                    className="drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-2 bg-[#0d131a] rounded-full flex items-center justify-center text-3xl font-bold text-primary">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="absolute bottom-2 right-2 w-5 h-5 bg-success rounded-full border-4 border-[#111822] shadow-[0_0_10px_rgba(0,230,118,0.8)]"></div>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2">{user?.name || (user?.role === 'admin' ? 'Admin User' : 'Dr. Aris Thorne')}</h2>
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] rounded-full font-bold uppercase tracking-widest border border-primary/20 shadow-[0_0_10px_rgba(0,229,255,0.2)] mb-8">
                            {user?.role === 'admin' ? 'ADMIN ACCESS' : 'SUPER ADMIN ACCESS'}
                        </span>

                        <div className="w-full space-y-5">
                            <div className="flex items-center gap-4 text-left">
                                <Mail size={18} className="text-gray-500" />
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Email Address</p>
                                    <p className="text-sm font-medium text-gray-200">{user?.email || 'a.thorne@cloudshield.net'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-left">
                                <Briefcase size={18} className="text-gray-500" />
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Department</p>
                                    <p className="text-sm font-medium text-gray-200">{user?.department || 'Global Cybersecurity Operations'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-left mt-2 pt-4 border-t border-[#1e293b]">
                                <CheckCircle size={18} className="text-success drop-shadow-[0_0_5px_rgba(0,230,118,0.8)]" />
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Security Score</p>
                                    <p className="text-sm font-bold text-success">{user?.securityScore || 99}/100 (Excellent)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions & Files */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Upload Box */}
                    <div className="bg-[#111822] border border-[#1e293b] rounded-2xl p-6 shadow-lg relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Shield size={18} className="text-primary drop-shadow-[0_0_5px_rgba(0,229,255,0.8)]" /> Secure File Upload
                            </h3>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="relative border border-dashed border-[#2a3a50] bg-[#0d131a]/50 rounded-xl p-8 hover:border-primary/50 transition-colors text-center group cursor-pointer h-32 flex flex-col justify-center">
                                <input
                                    id="file-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:bg-primary/20 group-hover:shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                                        <Upload className="text-gray-400 group-hover:text-primary transition-colors" size={18} />
                                    </div>
                                    <p className="text-sm text-gray-300">
                                        {selectedFile ? <span className="font-bold text-white">{selectedFile.name}</span> : <span>Drag & drop files or <span className="font-bold text-white">click to browse</span></span>}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Supports PDF, PNG, JPG, TXT (Max 50MB)</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAlgorithm('aes')}
                                    className={cn(
                                        "p-3 rounded-lg border text-left transition-all duration-300 relative overflow-hidden",
                                        algorithm === 'aes'
                                            ? "border-primary bg-[#111822] shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                                            : "border-[#1e293b] bg-[#0d131a] hover:border-gray-600"
                                    )}
                                >
                                    {algorithm === 'aes' && <div className="absolute top-0 right-0 w-8 h-8 bg-primary/20 rounded-bl-full blur-sm"></div>}
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="block text-xs font-bold text-white">AES-GCM</span>
                                        {algorithm === 'aes' && <CheckCircle size={14} className="text-primary" />}
                                    </div>
                                    <div className="text-[10px] text-gray-500">Standard / Fast</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAlgorithm('3des')}
                                    className={cn(
                                        "p-3 rounded-lg border text-left transition-all duration-300 relative overflow-hidden",
                                        algorithm === '3des'
                                            ? "border-warning bg-[#111822] shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                            : "border-[#1e293b] bg-[#0d131a] hover:border-gray-600"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="block text-xs font-bold text-white">3DES (Legacy)</span>
                                        <AlertTriangle size={12} className="text-warning" />
                                    </div>
                                    <div className="text-[10px] text-warning flex items-center gap-1">
                                        <AlertTriangle size={8} /> Deprecation Notice - Q4
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAlgorithm('cp-abe')}
                                    className={cn(
                                        "p-3 rounded-lg border text-left transition-all duration-300",
                                        algorithm === 'cp-abe'
                                            ? "border-[#a855f7] bg-[#111822] shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                                            : "border-[#1e293b] bg-[#0d131a] hover:border-gray-600"
                                    )}
                                >
                                    <div className="block text-xs font-bold text-white mb-1">CP-ABE</div>
                                    <div className="text-[10px] text-gray-500">Research / Parallel</div>
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !selectedFile}
                                className="w-full py-3 bg-primary hover:bg-primaryHover text-[#0d131a] font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none text-sm"
                            >
                                {uploading ? 'Encrypting...' : 'Encrypt & Upload Now'}
                            </button>
                            
                            {uploading && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#0d131a] rounded-lg p-3 border border-[#1e293b] flex items-center gap-4 mt-2"
                                >
                                    <span className="text-primary font-bold text-sm min-w-[30px]">{uploadProgress}%</span>
                                    <div className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                                        <div className="h-full bg-primary shadow-[0_0_10px_#00e5ff] transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                    <span className="text-xs text-gray-400 truncate max-w-[150px]">Scanning '{selectedFile?.name}'</span>
                                </motion.div>
                            )}
                        </form>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Files Table */}
                        <div className="lg:col-span-2 bg-[#111822] border border-[#1e293b] rounded-2xl overflow-hidden shadow-lg h-fit">
                            <div className="p-4 border-b border-[#1e293b] flex justify-between items-center">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <FileText size={16} className="text-gray-400" /> Recent Files
                                    {showFilters && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 ml-2">Filtering Active</span>}
                                </h3>
                                <MoreVertical size={16} className="text-gray-500 cursor-pointer" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#0d131a] text-gray-500 text-[9px] uppercase font-bold tracking-widest border-b border-[#1e293b]">
                                        <tr>
                                            <th className="p-3 pl-4">Filename</th>
                                            <th className="p-3">Algorithm / Policy</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Risk Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1e293b]">
                                        {files.slice(0, 5).map((file, i) => (
                                            <tr key={file._id || i} className="hover:bg-[#1a2332] transition-colors group">
                                                <td className="p-3 pl-4">
                                                    <p className="text-[13px] font-medium text-gray-200 group-hover:text-primary transition-colors truncate max-w-[150px]" title={file.originalName}>{file.originalName}</p>
                                                </td>
                                                <td className="p-3">
                                                    <span className="text-xs text-gray-400">
                                                        {file.algorithm || 'AES-GCM'}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    {file.status === 'processing' || i === 0 ? (
                                                        <span className="text-xs font-bold text-primary animate-pulse">Encrypting 45%</span>
                                                    ) : file.status === 'failed' || i === 4 ? (
                                                        <span className="text-xs font-bold text-danger">FAILED</span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-success">ENCRYPTED</span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {file.geminiAnalysis?.riskScore > 80 || i === 4 ? (
                                                        <span className="text-xs font-bold text-danger">High Risk</span>
                                                    ) : file.geminiAnalysis?.riskScore > 50 || i === 2 ? (
                                                        <span className="text-xs font-bold text-warning">Medium Risk</span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-success">Low Risk</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* System Alerts */}
                        <div className="lg:col-span-1 bg-[#111822] border border-[#1e293b] rounded-2xl overflow-hidden shadow-lg flex flex-col h-fit">
                            <div className="p-4 border-b border-[#1e293b]">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <AlertTriangle size={16} className="text-gray-400" /> System Alerts
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                {alerts.length > 0 ? alerts.map((alert, i) => (
                                    <div key={alert._id || i} className={cn("pl-3 border-l-2", alert.severity === 'critical' ? "border-danger" : alert.severity === 'warning' ? "border-warning" : "border-primary")}>
                                        <p className={cn("text-[11px] font-bold mb-0.5", alert.severity === 'critical' ? "text-danger" : alert.severity === 'warning' ? "text-warning" : "text-primary")}>
                                            {alert.severity === 'critical' ? 'CRITICAL:' : alert.severity === 'warning' ? 'WARN:' : 'INFO:'} {alert.eventType}
                                        </p>
                                        <p className="text-[10px] text-gray-400">{alert.message?.slice(0, 50)}...</p>
                                    </div>
                                )) : (
                                    <div className="pl-3 border-l-2 border-success">
                                        <p className="text-[11px] font-bold text-success mb-0.5">OK: Systems Optimal</p>
                                        <p className="text-[10px] text-gray-400">No recent alerts</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side Floating Menu Match Screenshot */}
            <div className="fixed right-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 z-50">
                <button onClick={() => window.scrollTo(0, 0)} className="w-10 h-10 bg-primary/20 backdrop-blur-md rounded-xl border border-primary/50 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:bg-primary/30 transition-all group">
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-success rounded-full border-2 border-[#0d131a]"></span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
                </button>
                <button onClick={() => setShowFilters(!showFilters)} className={cn("w-10 h-10 backdrop-blur-md rounded-xl border flex items-center justify-center transition-all group", showFilters ? "bg-primary/40 border-primary shadow-[0_0_15px_rgba(0,229,255,0.6)] text-white" : "bg-primary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:bg-primary/30")}>
                    <Filter size={18} />
                </button>
                <button onClick={exportFilesCSV} className="w-10 h-10 bg-primary/20 backdrop-blur-md rounded-xl border border-primary/50 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:bg-primary/30 transition-all group">
                    <Download size={18} />
                </button>
                <button onClick={() => alert('Share link copied to clipboard')} className="w-10 h-10 bg-primary/20 backdrop-blur-md rounded-xl border border-primary/50 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:bg-primary/30 transition-all group">
                    <Share2 size={18} />
                </button>
                <button onClick={() => document.getElementById('file-upload').click()} className="w-10 h-10 bg-primary/20 backdrop-blur-md rounded-xl border border-primary/50 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:bg-primary/30 transition-all group relative mt-4">
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-success rounded-full border-2 border-[#0d131a]"></span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
