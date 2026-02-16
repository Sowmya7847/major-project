import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import API from '../services/api';
import { Upload, FileText, Download, Shield, User, Briefcase, Mail, Calendar, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [algorithm, setAlgorithm] = useState('lightweight');

    const [policy, setPolicy] = useState('Role:Admin OR Dept:General');

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const { data } = await API.get('/files');
            setFiles(data);
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

        const formData = new FormData();
        formData.append('file', selectedFile);

        // Determine scheme
        if (algorithm === 'cp-abe') {
            formData.append('scheme', 'cp-abe');
            formData.append('policy', policy);
        } else {
            formData.append('scheme', 'aes');
            formData.append('algorithm', algorithm);
        }

        try {
            setUploading(true);
            await API.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSelectedFile(null);
            fetchFiles();
        } catch (error) {
            alert('Upload failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (fileId, fileName) => {
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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">User Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1 bg-surface border border-gray-800 rounded-xl p-6 h-fit">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-surfaceHover border-2 border-primary p-1 mb-4 relative">
                            <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold text-primary">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-success rounded-full border-2 border-surface"></div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{user?.name}</h2>
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium uppercase">
                            {user?.role} Access
                        </span>

                        <div className="w-full mt-6 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-surfaceHover rounded-lg">
                                <Mail size={18} className="text-gray-500" />
                                <div className="text-left overflow-hidden">
                                    <p className="text-xs text-gray-500">Email Address</p>
                                    <p className="text-sm font-medium text-gray-200 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-surfaceHover rounded-lg">
                                <Briefcase size={18} className="text-gray-500" />
                                <div className="text-left">
                                    <p className="text-xs text-gray-500">Department</p>
                                    <p className="text-sm font-medium text-gray-200">Cybersecurity Ops</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-surfaceHover rounded-lg">
                                <CheckCircle size={18} className="text-success" />
                                <div className="text-left">
                                    <p className="text-xs text-gray-500">Security Score</p>
                                    <p className="text-sm font-medium text-success">98/100 (Excellent)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions & Files */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Upload Box */}
                    <div className="bg-surface border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Shield size={18} className="text-primary" /> Secure File Upload
                        </h3>

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="relative border-2 border-dashed border-gray-700 bg-surfaceHover/50 rounded-xl p-8 hover:border-primary transition-colors text-center group">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="text-gray-400 group-hover:text-primary" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-300">
                                        {selectedFile ? selectedFile.name : "Drag & drop files or click to browse"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Supports PDF, PNG, JPG, TXT (Max 50MB)</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAlgorithm('lightweight')}
                                    className={cn(
                                        "p-2 rounded-lg border text-left transition-all",
                                        algorithm === 'lightweight'
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-gray-700 bg-surfaceHover hover:border-gray-600"
                                    )}
                                >
                                    <div className="block text-xs font-bold text-white mb-1">AES-GCM</div>
                                    <div className="text-[10px] text-gray-500">Standard / Fast</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAlgorithm('heavy')}
                                    className={cn(
                                        "p-2 rounded-lg border text-left transition-all",
                                        algorithm === 'heavy'
                                            ? "border-warning bg-warning/5 ring-1 ring-warning"
                                            : "border-gray-700 bg-surfaceHover hover:border-gray-600"
                                    )}
                                >
                                    <div className="block text-xs font-bold text-white mb-1">3DES (Legacy)</div>
                                    <div className="text-[10px] text-gray-500">Heavy Simulation</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAlgorithm('cp-abe')}
                                    className={cn(
                                        "p-2 rounded-lg border text-left transition-all",
                                        algorithm === 'cp-abe'
                                            ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500"
                                            : "border-gray-700 bg-surfaceHover hover:border-gray-600"
                                    )}
                                >
                                    <div className="block text-xs font-bold text-white mb-1">CP-ABE</div>
                                    <div className="text-[10px] text-gray-500">Research / Parallel</div>
                                </button>
                            </div>

                            {/* Access Policy Input for CP-ABE */}
                            {algorithm === 'cp-abe' && (
                                <div className="bg-purple-900/10 border border-purple-500/30 rounded-lg p-3 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-medium text-purple-300 mb-1">
                                        Access Structure (Policy)
                                    </label>
                                    <input
                                        type="text"
                                        value={policy}
                                        onChange={(e) => setPolicy(e.target.value)}
                                        className="w-full bg-black/30 border border-purple-500/50 rounded px-2 py-1 text-sm text-purple-100 placeholder-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        placeholder="(Dept:IT AND Role:Admin) OR Region:US"
                                    />
                                    <p className="text-[10px] text-purple-400 mt-1">
                                        Users must satisfy this boolean logic to decrypt.
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={uploading || !selectedFile}
                                className="w-full py-3 bg-primary hover:bg-primaryHover text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2 "
                            >
                                {uploading ? 'Processing...' : 'Encrypt & Upload Now'}
                            </button>
                        </form>
                    </div>

                    {/* Recent Files */}
                    <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-gray-800">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FileText size={18} className="text-gray-400" /> Recent Files
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-surfaceHover text-gray-400 text-xs uppercase">
                                    <tr>
                                        <th className="p-4 font-medium">Filename</th>
                                        <th className="p-4 font-medium">Algorithm / Policy</th>
                                        <th className="p-4 font-medium">Risk Status</th>
                                        <th className="p-4 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {files.map(file => (
                                        <tr key={file._id} className="hover:bg-surfaceHover/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-800 rounded">
                                                        <FileText size={16} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{file.originalName}</p>
                                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {file.encryptionScheme === 'cp-abe' ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-purple-400">CP-ABE</span>
                                                        <span className="text-[10px] text-gray-500 max-w-[150px] truncate" title={file.accessPolicy}>{file.accessPolicy}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-mono text-gray-400 bg-gray-900 px-2 py-1 rounded">
                                                        {file.encryptionAlgorithm}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {file.geminiAnalysis?.riskScore > 50 ?
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-danger/10 text-danger">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-danger"></span> High Risk
                                                    </span> :
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Secure
                                                    </span>
                                                }
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDownload(file._id, file.originalName)}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                                >
                                                    <Download size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {files.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-500">
                                                No encrypted files found in the network.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
