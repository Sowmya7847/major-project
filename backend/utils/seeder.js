const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const VirtualNode = require('../models/VirtualNode');
const SystemMetric = require('../models/SystemMetric');
const FileRecord = require('../models/FileRecord');
const Key = require('../models/Key');

const seedData = async () => {
    try {
        console.log('[SEEDER] Starting data seeding...');
        const fakeUserId = new mongoose.Types.ObjectId();

        await Promise.all([
            AuditLog.deleteMany({}),
            VirtualNode.deleteMany({}),
            SystemMetric.deleteMany({}),
            FileRecord.deleteMany({}),
            Key.deleteMany({})
        ]);

        const nodes = [
            { nodeId: 'node-alpha-01', name: 'Node Alpha-01', url: 'http://localhost:5100', status: 'active', load: 42, latencyMs: 12, storageUsed: 128, totalStorage: 512, lastHeartbeat: new Date() },
            { nodeId: 'node-beta-02',  name: 'Node Beta-02',  url: 'http://localhost:5101', status: 'active', load: 67, latencyMs: 18, storageUsed: 256, totalStorage: 512, lastHeartbeat: new Date() },
            { nodeId: 'node-gamma-03', name: 'Node Gamma-03', url: 'http://localhost:5102', status: 'active', load: 31, latencyMs: 9,  storageUsed: 64,  totalStorage: 512, lastHeartbeat: new Date() },
            { nodeId: 'node-delta-04', name: 'Node Delta-04', url: 'http://localhost:5103', status: 'active', load: 88, latencyMs: 25, storageUsed: 420, totalStorage: 512, lastHeartbeat: new Date() },
            { nodeId: 'node-eps-05',   name: 'Node Epsilon-05', url: 'http://localhost:5104', status: 'inactive', load: 0, latencyMs: 0, storageUsed: 180, totalStorage: 512, lastHeartbeat: new Date(Date.now() - 300000) },
            { nodeId: 'node-zeta-06',  name: 'Node Zeta-06',  url: 'http://localhost:5105', status: 'active', load: 55, latencyMs: 14, storageUsed: 310, totalStorage: 512, lastHeartbeat: new Date() },
        ];
        await VirtualNode.insertMany(nodes);

        const keys = [
            { user: fakeUserId, keyMaterial: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', algorithm: 'aes-256-gcm', isActive: true,  status: 'active',  expiryDate: new Date(Date.now() + 60*24*3600*1000) },
            { user: fakeUserId, keyMaterial: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5', algorithm: 'aes-256-gcm', isActive: false, status: 'rotated', expiryDate: new Date(Date.now() - 10*24*3600*1000) },
        ];
        await Key.insertMany(keys);

        const files = [
            { originalName: 'financial_report_Q1.pdf', size: 2457600, encryptionScheme: 'aes', encryptionAlgorithm: 'aes-256-gcm', status: 'stored', user: fakeUserId, geminiAnalysis: { riskScore: 12, summary: 'Clean financial document.', threats: [], isFlagged: false } },
            { originalName: 'employee_database.csv',   size: 5120000, encryptionScheme: 'cp-abe', accessPolicy: 'Role:HR AND Dept:Management', status: 'stored', user: fakeUserId, geminiAnalysis: { riskScore: 8, summary: 'Sensitive HR data, access restricted.', threats: [], isFlagged: false } },
            { originalName: 'security_audit_2024.docx', size: 1048576, encryptionScheme: 'aes', encryptionAlgorithm: 'aes-256-gcm', status: 'stored', user: fakeUserId, geminiAnalysis: { riskScore: 5, summary: 'Internal audit document.', threats: [], isFlagged: false } },
            { originalName: 'network_config_backup.zip', size: 838860, encryptionScheme: 'aes', encryptionAlgorithm: 'aes-256-gcm', status: 'stored', user: fakeUserId, geminiAnalysis: { riskScore: 35, summary: 'Config file with potential sensitive data.', threats: ['Configuration exposure'], isFlagged: false } },
        ];
        await FileRecord.insertMany(files);

        const metrics = [];
        for (let h = 23; h >= 0; h--) {
            metrics.push({
                timestamp: new Date(Date.now() - h * 3600000),
                cpuUsage: Math.floor(25 + Math.random() * 55),
                memoryUsage: Math.floor(40 + Math.random() * 35),
                encryptionThroughput: parseFloat((1.2 + Math.random() * 3.8).toFixed(2)),
                activeConnections: Math.floor(10 + Math.random() * 90),
                requestsPerSecond: Math.floor(5 + Math.random() * 45),
                latencyMs: parseFloat((0.4 + Math.random() * 2.1).toFixed(1))
            });
        }
        await SystemMetric.insertMany(metrics);

        const eventTypes = [
            { type: 'USER_LOGIN',        sev: 'info',     msg: 'Successful login from 192.168.1.101' },
            { type: 'FILE_UPLOAD',       sev: 'info',     msg: 'File financial_report_Q1.pdf encrypted and stored (AES-256-GCM)' },
            { type: 'KEY_ROTATION',      sev: 'critical', msg: 'Master key rotated — previous key archived' },
            { type: 'ACCESS_DENIED',     sev: 'warning',  msg: 'Unauthorized access attempt on patient_records_2024.pdf' },
            { type: 'NODE_OFFLINE',      sev: 'critical', msg: 'Node Epsilon-05 went offline — heartbeat timeout after 300s' },
            { type: 'THREAT_DETECTED',   sev: 'critical', msg: 'High-risk file malware_sample.exe flagged' },
        ];
        const logs = eventTypes.map((e, i) => ({
            eventType: e.type, user: fakeUserId, severity: e.sev, message: e.msg,
            node: ['node-alpha-01','node-beta-02','System_Global'][i % 3],
            timestamp: new Date(Date.now() - (i * 18 + Math.random() * 10) * 60000),
            metadata: { ip: '192.168.1.1' }
        }));
        await AuditLog.insertMany(logs);

        console.log('[SEEDER] Seeding complete! Database populated with demo data.');
    } catch (error) {
        console.error('[SEEDER] Seeding failed:', error);
    }
};

module.exports = seedData;
