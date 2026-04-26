const asyncHandler = require('express-async-handler');
const { getChatResponse } = require('../services/geminiService');
const AuditLog = require('../models/AuditLog');
const VirtualNode = require('../models/VirtualNode');
const FileRecord = require('../models/FileRecord');

/**
 * COMPREHENSIVE PROJECT KNOWLEDGE BASE
 * This context is injected into every AI request to ensure it can answer 
 * questions about any part of the SecureCloud project.
 */
const PROJECT_CONTEXT = `
PROJET ARCHITECTURE & COMPONENTS:
1. API Gateway (Port 4000): The entry point. Handles routing, rate limiting, and WebSockets (Socket.io) for real-time metrics. Proxies requests to Backend and ML services.
2. Backend Service (Port 5000): Core logic. Handles User Auth, Key Management, Node Management, and database interactions (MongoDB).
3. ML Service (Port 5001 - Fast API/Simulated): Analyzes file features (entropy, headers, size) for threat detection and anomaly scoring.
4. Workers (Distributed): Individual nodes that perform the actual encryption/decryption and chunked storage. They communicate with the Gateway via heartbeats.

KEY SECURITY FIELDS & CONCEPTS:
- Encryption Schemes: 
  * AES-256-GCM: Standard high-performance symmetric encryption.
  * CP-ABE (Ciphertext-Policy Attribute-Based Encryption): Advanced role-based encryption where policies (e.g., "Role:admin") are embedded in the ciphertext.
- Distributed Storage: Files are split into "Chunks" and distributed across multiple "Virtual Nodes" for redundancy and security.
- Audit Logging: Every sensitive action (upload, download, re-login) is logged in the AuditLog model with severity levels (info, warning, critical).
- HMAC Verification: Ensures data integrity during transmission and storage.
- Key Rotation: Policies for rotating encryption keys to minimize impact of potential leaks.

DATA MODELS:
- User: name, email, password, role (user, admin, auditor), securityScore.
- FileRecord: originalName, size, chunks[], encryptionScheme, accessPolicy, status (pending, processing, encrypted).
- VirtualNode: nodeId, name, url, status (active, inactive), load, latencyMs.
- AuditLog: eventType, user, message, severity, timestamp.
- Key: keyMaterial, algorithm, version, status.
`;

// @desc    Process chatbot message
// @route   POST /api/chatbot
// @access  Private
const processChat = asyncHandler(async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Please provide a message');
    }

    // Fetch real-time system stats
    const activeNodes = await VirtualNode.countDocuments({ status: 'active' });
    const totalNodes = await VirtualNode.countDocuments();
    const userFiles = await FileRecord.countDocuments({ user: req.user._id });

    // Build the dynamic and knowledge-rich prompt
    const systemContext = `
${PROJECT_CONTEXT}
CURRENT USER CONTEXT:
- Name: ${req.user.name}
- Role: ${req.user.role}
- Current Session Stats: ${userFiles} files uploaded by you.
SYSTEM REAL-TIME STATUS:
- Distributed Nodes: ${activeNodes} active out of ${totalNodes} total.
`;

    const enhancedMessage = `[Knowledge Base & Status: ${systemContext}] User Request: ${message}`;

    const aiResponse = await getChatResponse(enhancedMessage, history || [], message);

    // Log AI interactions
    await AuditLog.create({
        eventType: 'AI_CHAT_INTERACTION',
        user: req.user._id,
        severity: 'info',
        message: `User ${req.user.name} queried the AI assistant`,
        metadata: {
            query: message.substring(0, 100),
            nodesActive: activeNodes
        }
    });

    res.status(200).json({
        response: aiResponse
    });
});

module.exports = { processChat };
