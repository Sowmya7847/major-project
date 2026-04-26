const monitoringService = require('../services/monitoringService');

const metricsMiddleware = (req, res, next) => {
    const start = Date.now();

    res.on('finish', async () => {
        const duration = Date.now() - start;

        // Log performance metrics for long-running or critical paths
        if (duration > 500 || req.path.includes('/api/files')) {
            console.log(`[METRICS] ${req.method} ${req.originalUrl} - ${duration}ms`);

            // Log to SystemMetric model if needed, or just AuditLog for now
            if (duration > 1000) {
                await monitoringService.logActivity({
                    userId: req.user?._id,
                    eventType: 'PERFORMANCE_LATENCY',
                    status: 'warning',
                    severity: 'warning',
                    message: `High latency detected on ${req.originalUrl}`,
                    metadata: { duration, path: req.originalUrl }
                });
            }
        }
    });

    next();
};

module.exports = metricsMiddleware;
