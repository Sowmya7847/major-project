const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const validateEnv = require('./middleware/envValidation');

// Load env vars
dotenv.config();

// Connect to database
// Connect to database
// connectDB() called inside startServer

const app = express();

// Request Logger (TOP)
app.use((req, res, next) => {
    console.log(`>>> [BACKEND] ${req.method} ${req.url}`);
    next();
});

// Environment Validation
app.use(validateEnv);

const metricsMiddleware = require('./middleware/metricsMiddleware');
app.use(metricsMiddleware);

// Heartbeat Logger
setInterval(() => {
    // console.log('[BACKEND] Event loop heartbeat...');
}, 1000);

// Middleware
console.log('[BACKEND] Initializing middleware...');
app.use(helmet());
app.use(cors());
app.use(express.json());

// Passport Config
console.log('[BACKEND] Loading passport config...');
const passport = require('./config/passport');
app.use(passport.initialize());

// Rate Limiting
console.log('[BACKEND] Loading rate limiter...');
const { limiter } = require('./middleware/rateLimiter');
app.use('/api', limiter);

// Basic Route
app.get('/', (req, res) => {
    res.send('Distributed Cloud Security API is running...');
});

// Routes
console.log('[BACKEND] Loading routes...');
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/keys', require('./routes/keyRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/security', require('./routes/securityRoutes'));

// Dynamic Data Routes
const { getDashboardMetrics, getAIRecommendations } = require('./controllers/analyticsController');
const { getNodesStatus, isolateNode } = require('./controllers/nodeController');
const { protect, authorize } = require('./middleware/authMiddleware');

app.get('/api/analytics', protect, authorize('admin'), getDashboardMetrics);
app.get('/api/analytics/recommendations', protect, authorize('admin'), getAIRecommendations);
app.get('/api/nodes', protect, getNodesStatus);
app.post('/api/nodes/isolate', protect, authorize('admin'), isolateNode);

// Role Management Routes
app.use('/api/roles', require('./routes/roleRoutes'));

// Dynamic Config Routes
app.use('/api/config', require('./routes/configRoutes'));

// Chatbot Routes
app.use('/api/chatbot', require('./routes/chatbotRoutes'));

// ML Integration Routes
app.use('/api/security', require('./routes/mlRoutes'));

// Init Nodes
const { initNodes } = require('./services/nodeService');

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        console.log('[BACKEND] Connecting to DB...');
        await connectDB();
        console.log('[BACKEND] Initializing Nodes...');
        await initNodes();

        // Run Seeder
        const seedData = require('./utils/seeder');
        await seedData();

        console.log('[BACKEND] Starting listener...');
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error('Core Server Startup Error:', error);
        process.exit(1);
    }
};

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

startServer();
