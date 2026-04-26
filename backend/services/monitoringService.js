const AuditLog = require('../models/AuditLog');
const SecurityConfig = require('../models/SecurityConfig');
const User = require('../models/User');

class MonitoringService {
    constructor() {
        this.threatScores = new Map(); // userId -> currentScore
        this.threshold = 10; // Default threshold for blocking
    }

    /**
     * Log an activity and evaluate threat score
     */
    async logActivity(data) {
        const { userId, eventType, status, message, metadata, severity = 'info' } = data;

        // Create audit log matching the schema
        const log = await AuditLog.create({
            user: { id: userId },
            eventType,
            status,
            message: message || `${eventType} ${status}`,
            metadata,
            severity,
            ipAddress: data.ipAddress || 'internal'
        });

        // Evaluate threat if status is failure or severity is high/critical
        if (status === 'failure' || severity === 'critical' || severity === 'warning') {
            await this.evaluateThreat(userId, eventType, severity);
        }

        return log;
    }

    /**
     * Evaluate and update threat score for a user
     */
    async evaluateThreat(userId, action, severity) {
        if (!userId) return;

        let score = this.threatScores.get(userId) || 0;

        // Scoring Rules
        if (action === 'login' && severity === 'low') score += 1; // Failed login
        if (action === 'unauthorized_access') score += 5;
        if (severity === 'high') score += 3;
        if (severity === 'critical') score += 10;

        this.threatScores.set(userId, score);

        // Check against threshold from config
        const config = await SecurityConfig.getConfig();
        const blockThreshold = config.mlThreshold * 10 || this.threshold;

        if (score >= blockThreshold) {
            console.log(`[MONITORING] CRITICAL: User ${userId} exceeded threat threshold (${score}). Potential block required.`);
            // In a real system, we might automatically disable the user or trigger an alert.
            await this.triggerAlert(userId, score, action);
        }
    }

    async triggerAlert(userId, score, lastAction) {
        // Log critical threat
        await AuditLog.create({
            user: userId,
            action: 'THREAT_THRESHOLD_EXCEEDED',
            status: 'alert',
            severity: 'critical',
            metadata: { score, lastAction }
        });
    }

    /**
     * Get system-wide metrics for analytics
     */
    async getSystemMetrics() {
        const totalLogs = await AuditLog.countDocuments();
        const criticalLogs = await AuditLog.countDocuments({ severity: 'critical' });
        const recentLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email');

        return {
            totalLogs,
            criticalLogs,
            recentLogs,
            threatScores: Object.fromEntries(this.threatScores)
        };
    }
}

module.exports = new MonitoringService();
