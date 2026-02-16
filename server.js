const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
// Connect to database
// connectDB() called inside startServer

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const { limiter } = require('./middleware/rateLimiter');
app.use('/api', limiter);

// Basic Route
app.get('/', (req, res) => {
    res.send('Distributed Cloud Security API is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/keys', require('./routes/keyRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/security', require('./routes/securityRoutes'));

// Init Nodes
const { initNodes } = require('./services/nodeService');

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        await initNodes();

        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server Startup Error:', error);
        process.exit(1);
    }
};

startServer();
