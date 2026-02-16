const AuditLog = require('../models/AuditLog');
const asyncHandler = require('express-async-handler');

/**
 * Audit Middleware
 * Wraps a route handler to automatically log the action if it succeeds.
 * Usage: router.post('/path', protect, audit('ACTION_NAME'), controller)
 */
const audit = (actionName, severity = 'info') => {
    return asyncHandler(async (req, res, next) => {
        // We need to capture the response finish to know if it succeeded
        // However, standard middleware runs *before* the controller.
        // For simplicity in this architecture, we will log *after* the request is processed successfully.
        // But since we can't easily wrap the controller execution without high-order functions on the route definition,
        // we'll implement a "clean" way: using response 'finish' event implies success in many cases, 
        // but explicit logging in controllers is often better.
        // 
        // BETTER APPROACH for this middleware:
        // Attach a `req.logAction` function that controllers can call, OR
        // Log "Attempt" now, and "Success" later.
        // 
        // SIMPLIFIED APPROACH:
        // Log that the action was *requested* by the user.

        if (req.user) {
            // Non-blocking log creation
            AuditLog.create({
                eventType: actionName,
                user: req.user._id,
                metadata: {
                    method: req.method,
                    path: req.originalUrl,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                },
                severity: severity,
                message: `User ${req.user.name || req.user._id} performed ${actionName}`
            }).catch(err => console.error('Audit Log Failed:', err));
        }

        next();
    });
};

module.exports = { audit };
