import { useState, useEffect } from 'react';
import { Shield, Users, Eye, FileText, Download, Plus, Search, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import API from '../services/api';

const AccessPolicies = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const { data } = await API.get('/roles');
            setRoles(data);
            if (data.length > 0 && !selectedRole) {
                setSelectedRole(data[0].roleId);
            }
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIconForRole = (roleId) => {
        switch (roleId) {
            case 'super-admin': return Shield;
            case 'devops': return Users;
            case 'auditor': return Eye;
            case 'storage-manager': return FileText;
            default: return Shield;
        }
    };

    const currentRole = roles.find(r => r.roleId === selectedRole);
    const currentPermissions = currentRole?.permissions || [];
    const currentPolicy = currentRole?.policy || { version: '2.0', statement: [], condition: {} };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="text-center py-20 text-gray-400">Loading roles...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Access Policies & Roles</h1>
                    <p className="text-gray-400 text-sm">Manage distributed node permissions and granular security rules.</p>
                </div>
                <button className="px-4 py-2 bg-danger hover:bg-red-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm">
                    <Plus size={16} /> New Role
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Roles List */}
                <div className="bg-surface border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold text-sm">Roles</h3>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search roles..."
                                className="bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        {roles.map(role => {
                            const Icon = getIconForRole(role.roleId);
                            return (
                                <div
                                    key={role.roleId}
                                    onClick={() => setSelectedRole(role.roleId)}
                                    className={cn(
                                        "p-4 rounded-lg border cursor-pointer transition-all",
                                        selectedRole === role.roleId
                                            ? "bg-primary/10 border-primary"
                                            : "bg-gray-900 border-gray-800 hover:border-gray-700"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            selectedRole === role.roleId ? "bg-primary/20" : "bg-gray-800"
                                        )}>
                                            <Icon size={16} className={selectedRole === role.roleId ? "text-primary" : "text-gray-400"} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-white text-sm font-bold">{role.name}</h4>
                                                {role.status === 'active' && (
                                                    <div className="w-2 h-2 rounded-full bg-success"></div>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button className="w-full mt-4 py-2 text-xs text-gray-400 hover:text-white border border-gray-800 rounded-lg hover:border-gray-700 transition-colors flex items-center justify-center gap-2">
                        <Download size={14} /> Export Roles CSV
                    </button>
                </div>

                {/* Permissions Matrix */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div className="bg-surface border border-gray-800 rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-white font-bold">Permissions: <span className="text-danger">{currentRole?.name || 'N/A'}</span></h3>
                                </div>
                                <p className="text-xs text-gray-500">Last updated {currentRole?.updatedAt ? new Date(currentRole.updatedAt).toLocaleString() : 'N/A'}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 text-xs border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:border-gray-700 transition-colors flex items-center gap-1">
                                    <FileText size={12} /> History
                                </button>
                            </div>
                        </div>

                        {/* Risk Warning */}
                        {currentPermissions.some(p => p.delete) && (
                            <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-3">
                                <AlertTriangle size={16} className="text-warning mt-0.5" />
                                <div>
                                    <p className="text-warning text-xs font-bold">High Risk Permission Detected</p>
                                    <p className="text-gray-400 text-xs mt-1">
                                        This role has <span className="text-white font-mono">DELETE</span> permissions enabled.
                                        It can permanently remove critical resources.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Permissions Table */}
                    <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-500 uppercase font-bold">Resource Group</span>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-success/10 text-success text-xs rounded">All Resources</span>
                                </div>
                            </div>
                            <div className="flex gap-8 text-xs text-gray-500 uppercase font-bold">
                                <span>Read</span>
                                <span>Write</span>
                                <span>Execute</span>
                                <span className="text-danger">Delete</span>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-800">
                            {currentPermissions.map((resource, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-900/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                <FileText size={16} className="text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-white text-sm font-medium">{resource.resourceName}</h4>
                                                <p className="text-xs text-gray-500">{resource.resourceGroup}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-8 items-center">
                                            <input type="checkbox" checked={resource.read} readOnly className="w-4 h-4 accent-success" />
                                            <input type="checkbox" checked={resource.write} readOnly className="w-4 h-4 accent-success" />
                                            <input type="checkbox" checked={resource.execute} readOnly className="w-4 h-4 accent-success" />
                                            <input type="checkbox" checked={resource.delete} readOnly className="w-4 h-4 accent-danger" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {currentPermissions.length === 0 && (
                                <div className="p-8 text-center text-gray-500">No permissions configured</div>
                            )}
                        </div>
                    </div>

                    {/* Policy JSON Viewer */}
                    <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-primary" />
                                <span className="text-white text-sm font-bold">POLICY.JSON</span>
                            </div>
                            <button className="px-3 py-1.5 bg-danger hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors">
                                Save Policy
                            </button>
                        </div>
                        <div className="p-4 bg-black/50">
                            <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                                {JSON.stringify(currentPolicy, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessPolicies;
