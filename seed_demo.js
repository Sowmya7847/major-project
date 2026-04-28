/**
 * Demo Data Seeder — fills MongoDB with realistic SecureCloud data
 * Run: node seed_demo.js
 */
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/securecloud';

/* ── inline schemas (avoid import issues) ── */
const AuditLog = mongoose.model('AuditLog', new mongoose.Schema({
    eventType: String, user: mongoose.Schema.Types.ObjectId,
    severity: String, message: String, node: String,
    metadata: Object, timestamp: { type: Date, default: Date.now }
}, { timestamps: false }));

const VirtualNode = mongoose.model('VirtualNode', new mongoose.Schema({
    nodeId: String, name: String, url: String,
    status: { type: String, default: 'active' },
    load: Number, latencyMs: Number, storageUsed: Number,
    totalStorage: Number, lastHeartbeat: Date
}));

const SystemMetric = mongoose.model('SystemMetric', new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    cpuUsage: Number, memoryUsage: Number,
    encryptionThroughput: Number, activeConnections: Number,
    requestsPerSecond: Number, latencyMs: Number
}));

const FileRecord = mongoose.model('FileRecord', new mongoose.Schema({
    originalName: String, size: Number,
    encryptionScheme: String, encryptionAlgorithm: String,
    status: String, accessPolicy: String,
    user: mongoose.Schema.Types.ObjectId,
    geminiAnalysis: Object
}, { timestamps: true }));

const Key = mongoose.model('Key', new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    keyMaterial: String, algorithm: String,
    isActive: Boolean, status: String, expiryDate: Date
}, { timestamps: true }));

async function seed() {
    console.log('Connecting to', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected. Seeding...');

    const fakeUserId = new mongoose.Types.ObjectId();

    /* ── 1. Clear old demo data ── */
    await Promise.all([
        AuditLog.deleteMany({}),
        VirtualNode.deleteMany({}),
        SystemMetric.deleteMany({}),
        FileRecord.deleteMany({}),
        Key.deleteMany({})
    ]);

    /* ── 2. Virtual Nodes ── */
    const nodes = [
        { nodeId: 'node-alpha-01', name: 'Node Alpha-01', url: 'http://localhost:5100', status: 'active', load: 42, latencyMs: 12, storageUsed: 128, totalStorage: 512, lastHeartbeat: new Date() },
        { nodeId: 'node-beta-02',  name: 'Node Beta-02',  url: 'http://localhost:5101', status: 'active', load: 67, latencyMs: 18, storageUsed: 256, totalStorage: 512, lastHeartbeat: new Date() },
        { nodeId: 'node-gamma-03', name: 'Node Gamma-03', url: 'http://localhost:5102', status: 'active', load: 31, latencyMs: 9,  storageUsed: 64,  totalStorage: 512, lastHeartbeat: new Date() },
        { nodeId: 'node-delta-04', name: 'Node Delta-04', url: 'http://localhost:5103', status: 'active', load: 88, latencyMs: 25, storageUsed: 420, totalStorage: 512, lastHeartbeat: new Date() },
        { nodeId: 'node-eps-05',   name: 'Node Epsilon-05', url: 'http://localhost:5104', status: 'inactive', load: 0, latencyMs: 0, storageUsed: 180, totalStorage: 512, lastHeartbeat: new Date(Date.now() - 300000) },
        { nodeId: 'node-zeta-06',  name: 'Node Zeta-06',  url: 'http://localhost:5105', status: 'active', load: 55, latencyMs: 14, storageUsed: 310, totalStorage: 512, lastHeartbeat: new Date() },
    ];
    await VirtualNode.insertMany(nodes);
    console.log('✓ Nodes seeded:', nodes.length);

    /* ── 3. Encryption Keys ── */
    const keys = [
        { user: fakeUserId, keyMaterial: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', algorithm: 'aes-256-gcm', isActive: true,  status: 'active',  expiryDate: new Date(Date.now() + 60*24*3600*1000) },
        { user: fakeUserId, keyMaterial: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5', algorithm: 'aes-256-gcm', isActive: false, status: 'rotated', expiryDate: new Date(Date.now() - 10*24*3600*1000) },
        { user: fakeUserId, keyMaterial: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6', algorithm: 'aes-256-gcm', isActive: false, status: 'rotated', expiryDate: new Date(Date.now() - 30*24*3600*1000) },
        { user: fakeUserId, keyMaterial: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1', algorithm: 'chacha20',    isActive: false, status: 'revoked', expiryDate: new Date(Date.now() - 90*24*3600*1000) },
    ];
    await Key.insertMany(keys);
    console.log('✓ Keys seeded:', keys.length);

    /* ── 4. File Records ── */
    const files = [
        { originalName: 'financial_report_Q1.pdf', size: 2457600, encryptionScheme: 'aes', encryptionAlgorithm: 'aes-256-gcm', status: 'stored', user: fakeUserId, geminiAnalysis: { riskScore: 12, summary: 'Clean financial document.', threats: [], isFlagged: false } },
        { originalName: 'employee_database.csv',   size: 5120000, encryptionScheme: 'cp-abe', accessPolicy: 'Role:HR AND Dept:Management', status: 'stored', user: fakeUserId, geminiAnalysis: { riskScore: 8, summary: 'Sensitive HR data, access restricted.', threats: [], isFlagged: false } },
        { originalName: 'security_audit_2024.docx', size: 1048576, encryptionScheme: 'aes', encryptionAlgorithm: 'aes-256-gcm', status: 'stored', user: fakeUserId, geminiAnalysis: { riskScore: 5, summary: 'Internal audit document.', threats: [], isFlagged: false } },
        { originalName: 'network_config_backup.zip', size: 838860, encryptionScheme: 'aes', encryptionAlgorithm: 'aes-256-gcm', status: 'stored', user: fakeUserId, geminiAnalysis: { riskScore: 35, summary: 'Config file with potential sensitive data.', threats: ['Configuration exposure'], isFlagged: false } },
        { originalName: 'malware_sample.exe',       size: 204800, encryptionScheme: 'aes', encryptionAlgorithm: 'aes-256-gcm', status: 'stored', user: fakeUserId, geminiAnalysis: { riskScore: 92, summary: 'Executable flagged as potentially malicious.', threats: ['Executable content', 'Unknown signature', 'High entropy'], isFlagged: true } },
        { originalName: 'research_data_v3.xlsx',   size: 3145728, encryptionScheme: 'cp-abe', accessPolicy: 'Role:Researcher OR Dept:Science', status: 'stored', user: fakeUserId, geminiAnalysis: { riskScore: 10, summary: 'Research data, clean.', threats: [], isFlagged: false } },
        { originalName: 'patient_records_2024.pdf', size: 7340032, encryptionScheme: 'cp-abe', accessPolicy: 'Role:Doctor AND Dept:Medical', status: 'stored', user: fakeUserId, geminiAnalysis: { riskScore: 15, summary: 'HIPAA protected medical records.', threats: [], isFlagged: false } },
    ];
    await FileRecord.insertMany(files);
    console.log('✓ Files seeded:', files.length);

    /* ── 5. System Metrics (last 24 hours) ── */
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
    console.log('✓ System metrics seeded:', metrics.length);

    /* ── 6. Audit Logs (varied, realistic) ── */
    const eventTypes = [
        { type: 'USER_LOGIN',        sev: 'info',     msg: 'Successful login from 192.168.1.101' },
        { type: 'FILE_UPLOAD',       sev: 'info',     msg: 'File financial_report_Q1.pdf encrypted and stored (AES-256-GCM)' },
        { type: 'FILE_UPLOAD',       sev: 'info',     msg: 'File employee_database.csv encrypted with CP-ABE policy' },
        { type: 'KEY_ROTATION',      sev: 'critical', msg: 'Master key rotated — previous key archived' },
        { type: 'ACCESS_DENIED',     sev: 'warning',  msg: 'Unauthorized access attempt on patient_records_2024.pdf from user role: viewer' },
        { type: 'FILE_DOWNLOAD',     sev: 'info',     msg: 'File security_audit_2024.docx downloaded by Admin User' },
        { type: 'NODE_OFFLINE',      sev: 'critical', msg: 'Node Epsilon-05 went offline — heartbeat timeout after 300s' },
        { type: 'THREAT_DETECTED',   sev: 'critical', msg: 'High-risk file malware_sample.exe flagged (risk score: 92/100)' },
        { type: 'GENERATE_KEY',      sev: 'critical', msg: 'New AES-256-GCM master key generated by Admin User' },
        { type: 'ACCESS_DENIED',     sev: 'warning',  msg: 'Failed login attempt from IP 203.45.67.89 (brute force detected)' },
        { type: 'FILE_UPLOAD',       sev: 'info',     msg: 'File research_data_v3.xlsx encrypted (CP-ABE policy: Researcher OR Science)' },
        { type: 'SYSTEM_CONFIG',     sev: 'warning',  msg: 'Encryption mode changed from AES-GCM to ChaCha20 by Admin' },
        { type: 'USER_LOGIN',        sev: 'info',     msg: 'Successful login from 10.0.0.45' },
        { type: 'FILE_DOWNLOAD',     sev: 'info',     msg: 'File patient_records_2024.pdf accessed by Dr. Johnson (Doctor role)' },
        { type: 'ACCESS_DENIED',     sev: 'critical', msg: 'Multiple failed decryption attempts on employee_database.csv — policy violation' },
        { type: 'AI_CHAT_INTERACTION', sev: 'info',   msg: 'AI assistant queried about CP-ABE encryption policies' },
        { type: 'KEY_ROTATION',      sev: 'critical', msg: 'Emergency key rotation triggered due to policy violation alert' },
        { type: 'USER_LOGIN',        sev: 'warning',  msg: 'Login from unrecognized device — 2FA challenge issued' },
        { type: 'HMAC_VERIFY',       sev: 'info',     msg: 'HMAC integrity check passed for all 7 stored files' },
        { type: 'NODE_ONLINE',       sev: 'info',     msg: 'Node Alpha-01 reconnected after maintenance window' },
    ];

    const logs = eventTypes.map((e, i) => ({
        eventType: e.type,
        user: fakeUserId,
        severity: e.sev,
        message: e.msg,
        node: ['node-alpha-01','node-beta-02','node-gamma-03','System_Global'][i % 4],
        timestamp: new Date(Date.now() - (i * 18 + Math.random() * 10) * 60000),
        metadata: { ip: `192.168.${Math.floor(Math.random()*5)}.${Math.floor(Math.random()*254)}` }
    }));
    await AuditLog.insertMany(logs);
    console.log('✓ Audit logs seeded:', logs.length);

    console.log('\n🎉 All demo data seeded successfully!');
    await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
