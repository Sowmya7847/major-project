const asyncHandler = require('express-async-handler');
const { getChatResponse } = require('../services/geminiService');
const AuditLog = require('../models/AuditLog');
const VirtualNode = require('../models/VirtualNode');
const FileRecord = require('../models/FileRecord');
const Key = require('../models/Key');

/**
 * COMPREHENSIVE PROJECT KNOWLEDGE BASE
 * Injected into every AI request for context-aware responses.
 */
const PROJECT_CONTEXT = `
SECURECLOUD DISTRIBUTED SYSTEM — FULL PROJECT KNOWLEDGE BASE:

ARCHITECTURE:
1. API Gateway (Port 4000): Single entry point. Handles routing, rate limiting, WebSockets (Socket.io) for real-time metrics. Proxies all requests to Backend and ML Service.
2. Backend Service (Port 5000): Core logic — User Auth (JWT + bcrypt), Key Management, File/Node/Role Management, MongoDB interactions.
3. ML Service (Port 5001 — FastAPI + scikit-learn): Analyzes file features (entropy, MIME type, size) for threat detection and anomaly scoring using a pre-trained IDS model.
4. Worker Nodes (Distributed — Node.js): Perform actual AES-256-GCM encryption/decryption and chunked storage. Register via heartbeats to Gateway.

ENCRYPTION SCHEMES SUPPORTED:
- AES-256-GCM: High-performance, NIST-approved, authenticated encryption. Default scheme.
- CP-ABE (Ciphertext-Policy Attribute-Based Encryption): Policy embedded in ciphertext. Users must satisfy policy (e.g., "Role:Admin AND Dept:Finance") to decrypt. Implemented via custom JavaScript simulation.
- ChaCha20-Poly1305: Available via config. Preferred on hardware without AES-NI acceleration.

SECURITY FEATURES:
- HMAC-SHA256 verification on every file chunk
- Key rotation with configurable interval (default 90 days)
- Immutable audit logs with severity levels (info/warning/critical)
- ML-based threat detection on file uploads (entropy, signature scanning)
- Rate limiting on all API endpoints
- Session-based JWT authentication
- Role-based access control (user/admin/auditor)

COMPLIANCE: GDPR, SOC2 Type II, HIPAA, FIPS 140-2, ISO 27001

DATA MODELS:
- User: name, email, password (bcrypt), role, department, securityScore
- FileRecord: originalName, size, chunks[], encryptionScheme, accessPolicy, status, geminiAnalysis (riskScore, summary, threats)
- VirtualNode: nodeId, name, url, status (active/inactive), load, latencyMs, storageUsed
- AuditLog: eventType, user, message, severity, timestamp, metadata
- Key: keyMaterial, algorithm, isActive, status (active/rotated/revoked), expiryDate
- SecurityConfig: encryptionMode, chunkSize, parallelismLevel, workerCount, keyRotationInterval, sessionTimeout

PAGES & NAVIGATION:
- Dashboard: File upload (AES-GCM / CP-ABE), encrypted file list with AI risk scores
- Encryption Control: Key lifecycle, generation, rotation, inventory table, usage heatmap
- Data Security: Live encryption preview, toggle HMAC/E2E/auto-rotation, compliance check
- Distributed Nodes: Real-time node health grid with storage, latency, load metrics
- Monitoring & Logs: Recharts graphs (traffic, throughput), anomaly score gauge, audit log table
- Admin Dashboard: Node map, key controls, AI insights, Gemini recommendations
- Access Policies: Role-based permission matrix with JSON policy viewer
- System Config: Encryption mode, parallelism, session timeout, worker count
`;

// @desc    Process chatbot message with full dynamic context
// @route   POST /api/chatbot
// @access  Private
const processChat = asyncHandler(async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Please provide a message');
    }

    // Fetch real-time system stats concurrently
    const [activeNodes, totalNodes, userFiles, criticalAlerts, activeKeys] = await Promise.all([
        VirtualNode.countDocuments({ status: 'active' }),
        VirtualNode.countDocuments(),
        FileRecord.countDocuments({ user: req.user._id }),
        AuditLog.countDocuments({ severity: 'critical' }),
        Key.countDocuments({ user: req.user._id, isActive: true })
    ]);

    const systemContext = {
        userName: req.user.name,
        userRole: req.user.role,
        userFiles,
        activeNodes,
        totalNodes,
        criticalAlerts,
        activeKeys
    };

    // Build rich, structured prompt for AI
    const enhancedMessage = `[SECURECLOUD KNOWLEDGE BASE & REAL-TIME STATUS]
${PROJECT_CONTEXT}

LIVE SYSTEM DATA:
- Logged-in User: ${req.user.name} (Role: ${req.user.role}, Dept: ${req.user.department || 'N/A'})
- User's Encrypted Files: ${userFiles}
- User's Active Keys: ${activeKeys}
- Network: ${activeNodes}/${totalNodes} nodes active
- Critical Security Alerts: ${criticalAlerts}

USER'S QUESTION: ${message}`;

    const aiResponse = await getChatResponse(enhancedMessage, history || [], message, systemContext);

    // Log the interaction
    await AuditLog.create({
        eventType: 'AI_CHAT_INTERACTION',
        user: req.user._id,
        severity: 'info',
        message: `AI chatbot query by ${req.user.name}`,
        metadata: {
            query: message.substring(0, 200),
            nodesActive: activeNodes,
            responseLength: aiResponse.length
        }
    });

    res.status(200).json({
        response: aiResponse,
        context: {
            activeNodes,
            totalNodes,
            userFiles,
            criticalAlerts
        }
    });
});

// @desc    Get suggested questions based on system state
// @route   GET /api/chatbot/suggestions
// @access  Private
const getSuggestions = asyncHandler(async (req, res) => {
    const criticalAlerts = await AuditLog.countDocuments({ severity: 'critical' });
    const totalNodes = await VirtualNode.countDocuments();
    const activeNodes = await VirtualNode.countDocuments({ status: 'active' });
    const userFiles = await FileRecord.countDocuments({ user: req.user._id });
    const activeKeys = await Key.countDocuments({ user: req.user._id, isActive: true });

    const suggestions = [
        "What is the current system status?",
        "How does AES-256-GCM encryption work?",
        "Explain CP-ABE and how to set an access policy",
        "How do I rotate my encryption keys?",
    ];

    if (criticalAlerts > 0) suggestions.unshift(`⚠️ There are ${criticalAlerts} critical alerts — what should I do?`);
    if (activeNodes < totalNodes) suggestions.unshift(`🔴 ${totalNodes - activeNodes} node(s) are offline — what does that mean?`);
    if (userFiles === 0) suggestions.unshift("How do I upload and encrypt my first file?");
    if (activeKeys === 0) suggestions.unshift("I have no active encryption keys — how do I generate one?");

    res.json({ suggestions: suggestions.slice(0, 5) });
});

module.exports = { processChat, getSuggestions };
