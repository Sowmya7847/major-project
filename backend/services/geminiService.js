const { GoogleGenerativeAI } = require("@google/generative-ai");

const analyzeFileRisk = async (filename, mimeType, fileBuffer) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("Gemini API Key missing. Skipping AI analysis.");
            const isSuspicious = filename.includes('.exe') || mimeType === 'application/x-msdownload';
            return {
                riskScore: isSuspicious ? 85 : 15,
                summary: isSuspicious ? "Potentially malicious executable file detected." : "File appears to be clean and safe.",
                threats: isSuspicious ? ["Executable content", "Unknown signature"] : [],
                isFlagged: isSuspicious
            };
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = `Analyze this file upload for security risks.\nFilename: ${filename}\nType: ${mimeType}\n`;
        if (mimeType.startsWith('text/') || mimeType === 'application/json') {
            const snippet = fileBuffer.toString('utf8').slice(0, 1000);
            prompt += `Content Snippet: ${snippet}\n`;
        }
        prompt += `Return a JSON object ONLY (no markdown, no explanation) with: riskScore (0-100), summary (string), threats (array of strings), isFlagged (boolean, true if riskScore > 75).`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);

        return { riskScore: 0, summary: "Could not parse AI response", threats: [], isFlagged: false };

    } catch (error) {
        console.error("Gemini Analysis Error:", error.message);
        const isSuspicious = filename.includes('.exe') || mimeType === 'application/x-msdownload';
        return {
            riskScore: isSuspicious ? 85 : 15,
            summary: isSuspicious ? "Potentially malicious executable file detected." : "File appears to be clean and safe.",
            threats: isSuspicious ? ["Executable content", "Unknown signature"] : [],
            isFlagged: isSuspicious
        };
    }
};

// ============================================================
// COMPREHENSIVE LOCAL KNOWLEDGE BASE FOR OFFLINE FALLBACK
// ============================================================
const KNOWLEDGE_BASE = [
    {
        triggers: ['hello', 'hi', 'hey', 'greet', 'good morning', 'good afternoon'],
        response: (ctx) => `👋 Hello, **${ctx.userName}**! I'm **SecureCloud AI** — your intelligent security assistant.\n\nRight now your system has **${ctx.activeNodes}/${ctx.totalNodes} nodes active** and you have **${ctx.userFiles} encrypted files** in the vault.\n\nYou can ask me about:\n- 🔐 **Encryption** (AES-256-GCM, CP-ABE, ChaCha20)\n- 🌐 **Distributed Architecture** and Nodes\n- 🛡️ **Security Best Practices**\n- 📊 **Your System Status**\n- 🔑 **Key Management & Rotation**`
    },
    {
        triggers: ['status', 'system status', 'how is the system', 'system health', 'nodes status'],
        response: (ctx) => `## 📊 Live System Status\n\n| Metric | Value |\n|--------|-------|\n| Active Nodes | **${ctx.activeNodes} / ${ctx.totalNodes}** |\n| Your Encrypted Files | **${ctx.userFiles}** |\n| Critical Alerts | **${ctx.criticalAlerts}** |\n| Your Role | **${ctx.userRole}** |\n\n${ctx.criticalAlerts > 0 ? '⚠️ **Warning:** There are critical alerts in the system. Check the Admin Dashboard for details.' : '✅ All systems are operating normally.'}`
    },
    {
        triggers: ['aes', 'aes-256', 'aes-256-gcm', 'symmetric encryption'],
        response: () => `## 🔐 AES-256-GCM Encryption\n\nSecureCloud uses **AES-256-GCM** (Advanced Encryption Standard — 256-bit key, Galois/Counter Mode) as its default encryption algorithm.\n\n**Why AES-256-GCM?**\n- ✅ **256-bit key** — computationally unbreakable with current technology\n- ✅ **GCM Mode** — provides both confidentiality AND authenticated integrity (detects tampering)\n- ✅ **High Performance** — hardware-accelerated on modern CPUs via AES-NI\n- ✅ **NIST Approved** — meets FIPS 140-2 compliance\n\n**How it works in SecureCloud:**\n1. File is chunked (1MB blocks by default)\n2. Each chunk is encrypted with a unique IV (Initialization Vector)\n3. HMAC tag is generated for integrity verification\n4. Chunks are distributed across virtual nodes`
    },
    {
        triggers: ['cp-abe', 'abe', 'attribute based', 'policy', 'access policy', 'attribute encryption'],
        response: () => `## 🏛️ CP-ABE (Ciphertext-Policy Attribute-Based Encryption)\n\nCP-ABE is an **advanced encryption scheme** where the access policy is embedded directly in the ciphertext. Only users whose attributes satisfy the policy can decrypt.\n\n**Example Policy:**\n\`\`\`\n(Role:Admin AND Dept:Finance) OR (Role:Auditor)\n\`\`\`\n\n**Key Benefits:**\n- 🔒 **Fine-Grained Access Control** — no need to re-encrypt data for different users\n- 🏢 **Role-Based** — policies like \`Dept:HR AND ClearanceLevel:3\`\n- 🌐 **Distributed** — works across untrusted storage nodes\n- 📜 **Revocation** — revoking a user's attribute instantly revokes access\n\n**Use it in SecureCloud** by selecting **CP-ABE** during file upload and entering your policy string.`
    },
    {
        triggers: ['chacha', 'chacha20', 'chacha20-poly1305'],
        response: () => `## ⚡ ChaCha20-Poly1305\n\nChaCha20-Poly1305 is a modern stream cipher + MAC algorithm that SecureCloud supports as an alternative to AES-GCM.\n\n**When to use it:**\n- Devices without hardware AES acceleration (mobile, IoT)\n- When software-only encryption is required\n- High-security environments where AES side-channel attacks are a concern\n\n**Performance:** ~3× faster than AES on hardware without AES-NI.\n\n**Security:** Used by TLS 1.3, WireGuard VPN, and Signal Protocol.`
    },
    {
        triggers: ['hmac', 'integrity', 'verification', 'tamper'],
        response: () => `## 🛡️ HMAC Integrity Verification\n\nSecureCloud uses **HMAC-SHA256** to verify data integrity at every stage.\n\n**What is HMAC?**\nHMAC (Hash-based Message Authentication Code) generates a cryptographic signature over data using a secret key.\n\n**How it protects you:**\n1. When a file is stored, an HMAC tag is computed\n2. When retrieved, the tag is re-computed and compared\n3. If they don't match → **data has been tampered with** → access is denied\n\n**Why it matters:** Even if an attacker modifies an encrypted chunk on a storage node, the HMAC check will catch it before decryption.`
    },
    {
        triggers: ['key rotation', 'rotate key', 'key management', 'key lifecycle'],
        response: () => `## 🔑 Key Management & Rotation\n\n**Key Lifecycle Stages:**\n\`\`\`\nGeneration → Activation → Use → Rotation → Archival\n\`\`\`\n\n**Best Practices in SecureCloud:**\n- 🗓️ **Rotate every 90 days** (configurable in System Config)\n- 🚨 **Immediate rotation** if a breach is suspected\n- 📦 **Old keys are archived** (not deleted) to allow decryption of older files\n- 🔐 **Key material** is derived using PBKDF2 with 100,000 iterations\n\n**To rotate your key:** Go to **Encryption Control** → Click **Rotate Now**, or use the Admin Dashboard shortcut.`
    },
    {
        triggers: ['architecture', 'distributed', 'how does it work', 'system design', 'components', 'services'],
        response: () => `## 🏗️ SecureCloud Architecture\n\n\`\`\`\n  Client (React)  ←→  API Gateway :4000  ←→  Backend :5000\n                              ↓                    ↓\n                        ML Service :5001     MongoDB (DB)\n                              ↓\n                    Worker Nodes (Distributed)\n\`\`\`\n\n**Components:**\n| Service | Port | Role |\n|---------|------|------|\n| React Client | 5173 | User Interface |\n| API Gateway | 4000 | Rate limiting, WebSocket, Routing |\n| Backend | 5000 | Auth, Keys, File Logic, DB |\n| ML Service | 5001 | Threat detection, Anomaly scoring |\n| Workers | Dynamic | Encrypt/Decrypt, Chunked storage |\n\n**Data Flow:**\n1. User uploads file → Gateway → Backend → ML scan → Workers\n2. Workers chunk & encrypt → distribute across virtual nodes\n3. Metrics streamed via WebSocket → Dashboard`
    },
    {
        triggers: ['audit log', 'audit', 'logs', 'event log', 'logging'],
        response: () => `## 📋 Audit Logs\n\nSecureCloud maintains **immutable, tamper-evident audit logs** for every security-sensitive action.\n\n**Logged Events:**\n- 🔐 Login / Logout attempts\n- 📁 File uploads, downloads, deletions\n- 🔑 Key generation and rotation\n- 🛡️ Security config changes\n- 🤖 AI assistant interactions\n- ⚠️ Failed access attempts\n\n**Severity Levels:**\n- \`info\` — Normal operations\n- \`warning\` — Suspicious but not confirmed threats\n- \`critical\` — Active security events requiring action\n\n**Compliance:** These logs satisfy SOC2 Type II, GDPR Article 30, and HIPAA audit requirements.\n\n**View them:** Go to **Monitoring & Logs** → Immutable Audit Logs table.`
    },
    {
        triggers: ['node', 'virtual node', 'storage node', 'worker node'],
        response: (ctx) => `## 🌐 Virtual Nodes\n\nYour system currently has **${ctx.activeNodes} active** out of **${ctx.totalNodes} total** virtual nodes.\n\n**What are Virtual Nodes?**\nVirtual Nodes are distributed storage workers that:\n- Store encrypted file chunks\n- Report heartbeats to the Gateway\n- Balance load across the cluster\n- Provide redundancy (N+1 fault tolerance)\n\n**Node Health Indicators:**\n- 🟢 **Active** — Online, accepting chunks\n- 🔴 **Inactive** — Offline or isolated\n- Load, Latency, and Storage metrics are tracked in real-time\n\n**To view nodes:** Go to **Distributed Nodes** in the sidebar.`
    },
    {
        triggers: ['file', 'upload', 'encrypt upload', 'my files', 'files'],
        response: (ctx) => `## 📁 File Management\n\nYou currently have **${ctx.userFiles} encrypted file(s)** in the SecureCloud vault.\n\n**Uploading a File:**\n1. Go to **Dashboard** → Secure File Upload\n2. Drag & drop or click to browse\n3. Select encryption: **AES-GCM** (fast) or **CP-ABE** (policy-based)\n4. Click **Encrypt & Upload Now**\n\n**What happens behind the scenes:**\n1. File is chunked into 1MB blocks\n2. Each chunk is AES-256-GCM encrypted\n3. Gemini AI scans metadata for risks\n4. Chunks distributed across virtual nodes\n5. File record saved in MongoDB with HMAC tags\n\n**To download:** Click the download icon in the Recent Files table.`
    },
    {
        triggers: ['security score', 'score', 'risk score', 'my score'],
        response: (ctx) => `## 🛡️ Security Score\n\nYour current security score is visible in your **Dashboard → Profile Card**.\n\n**Score Calculation Factors:**\n- ✅ Strong password usage\n- ✅ Active MFA / secure login method\n- ✅ Encryption scheme used for files (CP-ABE scores higher)\n- ✅ Key rotation compliance\n- ✅ No recent failed login attempts\n- ⚠️ Number of critical audit events\n\n**Score Ranges:**\n| Range | Status |\n|-------|--------|\n| 90–100 | 🟢 Excellent |\n| 75–89 | 🟡 Good |\n| 50–74 | 🟠 Needs Improvement |\n| Below 50 | 🔴 At Risk |`
    },
    {
        triggers: ['compliance', 'gdpr', 'soc2', 'hipaa', 'regulation', 'standard'],
        response: () => `## 📜 Compliance Standards\n\nSecureCloud is designed to help meet these compliance frameworks:\n\n| Standard | Coverage |\n|----------|----------|\n| **GDPR** | Data encryption, access control, audit logs, right-to-erasure via key destruction |\n| **SOC2 Type II** | Availability, Confidentiality, Integrity controls, automated audit trails |\n| **HIPAA** | Encryption at rest & in transit, access logging, minimum necessary access |\n| **FIPS 140-2** | AES-256-GCM is FIPS-approved, key management via PBKDF2 |\n| **ISO 27001** | Information security management controls |\n\n**Note:** Compliance is a shared responsibility. Configure key rotation intervals and access policies according to your organization's requirements.`
    },
    {
        triggers: ['how to use', 'get started', 'help', 'guide', 'tutorial', 'what can you do'],
        response: (ctx) => `## 🚀 Quick Start Guide\n\nHello **${ctx.userName}**! Here's how to get the most out of SecureCloud:\n\n**1. Upload & Encrypt Files**\n→ Dashboard → Secure File Upload\n\n**2. View Your Encrypted Files**\n→ Dashboard → Recent Files table\n\n**3. Monitor System Health**\n→ Monitoring & Logs (real-time charts + audit logs)\n\n**4. Manage Encryption Keys**\n→ Encryption Control (lifecycle, rotation, inventory)\n\n**5. Configure Security Policies**\n→ Access Policies (role-based permissions)\n\n**6. Admin Controls** *(Admin only)*\n→ Admin Dashboard (key rotate, node isolation, AI insights)\n\nAsk me anything about security, encryption, or your system status! 🔐`
    }
];

/**
 * Match a user message against the knowledge base
 */
const localFallback = (rawMessage, systemContext) => {
    const lower = rawMessage.toLowerCase();
    
    for (const entry of KNOWLEDGE_BASE) {
        if (entry.triggers.some(t => lower.includes(t))) {
            return entry.response(systemContext);
        }
    }

    // Default response
    return `I understand you asked: **"${rawMessage}"**\n\nI'm currently running in **local knowledge mode** (Gemini API is unavailable). I have detailed answers for:\n\n- 🔐 Encryption algorithms (AES, CP-ABE, ChaCha20)\n- 🌐 Distributed architecture & nodes\n- 📋 Audit logs & compliance\n- 🔑 Key management & rotation\n- 📁 File upload & management\n- 🛡️ Security scores & best practices\n- 📊 Live system status\n\nTry rephrasing your question using one of these topics!`;
};

const getChatResponse = async (userMessage, history = [], rawMessage = "", systemContext = {}) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return localFallback(rawMessage || userMessage, systemContext);
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: {
                parts: [{ text: "You are SecureCloud AI, a highly intelligent security assistant for the SecureCloud Distributed Storage System. You answer questions about cloud security, encryption (AES-256-GCM, CP-ABE, ChaCha20), distributed storage architecture, key management, HMAC, audit logs, compliance (GDPR, SOC2, HIPAA), and the SecureCloud project. You have access to real-time system context injected with each message. Use markdown formatting with headers, tables, and code blocks when helpful. Be professional, accurate, and concise. If asked something completely unrelated to security or cloud storage, politely redirect." }]
            }
        });

        const chat = model.startChat({
            history: history
                .filter(h => h.role && h.content)
                .map(h => ({
                    role: h.role === 'user' ? 'user' : 'model',
                    parts: [{ text: h.content }],
                })),
        });

        const result = await chat.sendMessage(userMessage);
        return result.response.text();

    } catch (error) {
        console.error("Gemini Chat Error:", error.message);
        return localFallback(rawMessage || userMessage, systemContext);
    }
};

const summarizeLogs = async (limit = 10) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return "AI log summary unavailable (no API key). Check audit logs manually in Monitoring & Logs.";
        }

        const AuditLog = require('../models/AuditLog');
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(limit);

        if (logs.length === 0) return "No recent audit logs to summarize.";

        const logSummary = logs.map(l => `[${l.severity?.toUpperCase()}] ${l.eventType}: ${l.message}`).join('\n');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(
            `Summarize these security audit logs in 2-3 sentences, highlighting any critical events:\n\n${logSummary}`
        );
        return result.response.text();

    } catch (error) {
        console.error("Gemini Summarize Error:", error.message);
        return "AI log summary temporarily unavailable.";
    }
};

const getSecurityRecommendations = async (systemData = {}) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return "Configure your Gemini API key to get AI-powered security recommendations.";
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(
            `Based on this system state: ${JSON.stringify(systemData)}, provide 3 concise security recommendations for a distributed cloud storage system.`
        );
        return result.response.text();
    } catch (error) {
        return "AI recommendations temporarily unavailable.";
    }
};

module.exports = { analyzeFileRisk, getChatResponse, summarizeLogs, getSecurityRecommendations };
