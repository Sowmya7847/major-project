const AuditLog = require('../models/AuditLog');
const FileRecord = require('../models/FileRecord');
const VirtualNode = require('../models/VirtualNode');
const SystemMetric = require('../models/SystemMetric');
const monitoringService = require('../services/monitoringService');
const geminiService = require('../services/geminiService');

// @desc    Get dashboard metrics (Traffic, Throughput, Anomalies)
// @route   GET /api/analytics
// @access  Private
const getDashboardMetrics = async (req, res) => {
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

        // 1. Traffic Data (Logs per hour for last 24h)
        const trafficStats = await AuditLog.aggregate([
            { $match: { timestamp: { $gte: twentyFourHoursAgo } } },
            {
                $group: {
                    _id: { $hour: "$timestamp" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const trafficData = Array.from({ length: 24 }).map((_, i) => {
            const hour = (now.getHours() - 23 + i + 24) % 24;
            const stat = trafficStats.find(s => s._id === hour);
            return {
                time: `${hour}:00`,
                value: stat ? stat.count : 0
            };
        });

        // 2. System Status
        const nodes = await VirtualNode.find();
        const fileCount = await FileRecord.countDocuments();
        const metrics = await monitoringService.getSystemMetrics();
        
        const avgLatency = nodes.length > 0 ? nodes.reduce((a, b) => a + (b.latencyMs || 0), 0) / nodes.length : 12;
        
        // 3. Throughput and Security Overhead
        const recentMetrics = await SystemMetric.find().sort({ createdAt: -1 }).limit(100);
        let throughput = 0;
        let securityOverhead = 0;
        
        if (recentMetrics.length > 0) {
            const totalBytes = recentMetrics.reduce((a, b) => a + b.fileSize, 0);
            const totalMs = recentMetrics.reduce((a, b) => a + b.totalTimeMs, 0);
            throughput = totalMs > 0 ? (totalBytes / 1024 / 1024) / (totalMs / 1000) : 0; // MB/s
            
            const totalEncTime = recentMetrics.reduce((a, b) => a + b.encryptionTimeMs, 0);
            securityOverhead = totalMs > 0 ? (totalEncTime / totalMs) * 100 : 0;
        }

        // Throughput bar chart data (mocked from actual aggregate if needed, but we'll generate 7 days/hours for now)
        const throughputData = [40, 60, 30, 80, Math.min(100, throughput * 10), 50, 45]; 

        // 4. AI Insights
        const aiInsights = await geminiService.summarizeLogs(10);

        // 5. Last anomaly event
        const lastAnomaly = await AuditLog.findOne({ severity: 'critical' }).sort({ timestamp: -1 });
        const lastAnomalyMsg = lastAnomaly ? `${lastAnomaly.eventType}: ${lastAnomaly.message?.slice(0, 60)}` : null;

        res.status(200).json({
            trafficData,
            throughputData,
            globalLatency: avgLatency.toFixed(1),
            throughput: throughput.toFixed(2),
            securityOverhead: securityOverhead.toFixed(2),
            stats: {
                totalFiles: fileCount,
                activeNodes: nodes.filter(n => n.status === 'active').length,
                totalLogs: metrics.totalLogs,
                criticalAlerts: metrics.criticalLogs
            },
            nodes: nodes.map(n => ({
                id: n.nodeId,
                name: n.name,
                load: n.load,
                successRate: n.successRate,
                status: n.status
            })),
            aiInsights,
            lastAnomalyMsg,
            anomalyScore: metrics.criticalLogs,
            anomalyStatus: metrics.criticalLogs > 10 ? 'High' : (metrics.criticalLogs > 5 ? 'Medium' : 'Low')
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Failed to fetch analytics' });
    }
};

const getAIRecommendations = async (req, res) => {
    try {
        const nodes = await VirtualNode.find();
        const metrics = await monitoringService.getSystemMetrics();

        const recommendations = await geminiService.getSecurityRecommendations({
            nodeCount: nodes.length,
            avgLoad: nodes.reduce((acc, n) => acc + n.load, 0) / nodes.length || 0,
            criticalAlerts: metrics.criticalLogs
        });

        res.json({ recommendations });
    } catch (error) {
        res.status(500).json({ message: 'AI Recommendation failed' });
    }
};

module.exports = {
    getDashboardMetrics,
    getAIRecommendations
};
