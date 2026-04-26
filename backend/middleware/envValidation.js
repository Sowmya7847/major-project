const validateEnv = (req, res, next) => {
    const requiredVars = [
        'MONGO_URI',
        'JWT_SECRET',
        'GEMINI_API_KEY'
    ];

    const missing = requiredVars.filter(v => !process.env[v]);

    if (missing.length > 0) {
        console.error(`[CRITICAL] Missing Env Vars: ${missing.join(', ')}`);
        // We don't block the request in dev, but in prod we might
        if (process.env.NODE_ENV === 'production') {
            return res.status(500).json({ message: 'System configuration error' });
        }
    }
    next();
};

module.exports = validateEnv;
