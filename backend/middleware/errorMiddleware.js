const monitoringService = require('../services/monitoringService');

const errorHandler = async (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    // Log critical errors to audit logs
    if (statusCode >= 500) {
        await monitoringService.logActivity({
            userId: req.user?._id,
            eventType: 'SYSTEM_ERROR',
            status: 'error',
            severity: 'critical',
            message: err.message,
            metadata: { stack: err.stack, path: req.path }
        });
    }

    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        timestamp: new Date().toISOString()
    });
};

module.exports = { errorHandler };
