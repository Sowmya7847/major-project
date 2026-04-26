const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Request Logger (TOP)
app.use((req, res, next) => {
    console.log(`>>> [GATEWAY] ${req.method} ${req.url}`);
    next();
});

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(helmet());

// Dynamic Service Registry
const services = {
    backend: process.env.BACKEND_URL || "http://localhost:5000",
    ml: process.env.ML_SERVICE_URL || "http://localhost:5001",
    workers: new Map() // nodeId -> { url, lastHeartbeat, load }
};

// WebSocket Metrics Stream
io.on('connection', (socket) => {
    console.log('Client connected to metrics stream:', socket.id);

    // Send initial active nodes
    socket.emit('nodes_update', Array.from(services.workers.values()));

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Prune Dead Workers (Every 30s)
setInterval(() => {
    const now = Date.now();
    let changed = false;
    for (const [id, worker] of services.workers.entries()) {
        if (now - worker.lastHeartbeat > 30000) { // 30s timeout
            console.log(`Worker ${id} timed out. Removing.`);
            services.workers.delete(id);
            changed = true;
        }
    }
    if (changed) {
        io.emit('nodes_update', Array.from(services.workers.values()));
    }
}, 30000);

// Proxy Routes (MUST BE ABOVE express.json())
// ML Service
app.use('/ml', createProxyMiddleware({
    target: services.ml,
    changeOrigin: true,
    pathRewrite: { '^/ml': '' }
}));

// Backend API
app.use('/api', createProxyMiddleware({
    target: services.backend,
    changeOrigin: true,
    pathRewrite: { '^/': '/api/' } // Ensure /api is preserved when reaching backend
}));

// Body Parser (Below proxies)
app.use(express.json());

// Worker Registration Endpoint
app.post('/register-worker', (req, res) => {
    const { nodeId, url, load } = req.body;
    services.workers.set(nodeId, {
        nodeId,
        url,
        lastHeartbeat: Date.now(),
        load
    });
    console.log(`Worker registered: ${nodeId} at ${url}`);
    io.emit('nodes_update', Array.from(services.workers.values()));
    res.json({ status: 'registered' });
});

// Worker Heartbeat & Metrics
app.post('/worker-heartbeat', (req, res) => {
    const { nodeId, load, metrics } = req.body;
    if (services.workers.has(nodeId)) {
        const worker = services.workers.get(nodeId);
        worker.lastHeartbeat = Date.now();
        worker.load = load;
        services.workers.set(nodeId, worker);

        // Broadcast metrics to dashboard
        if (metrics) {
            io.emit('metrics_update', metrics);
        }
    }
    res.json({ status: 'ok' });
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'gateway_up', services: Object.keys(services), activeWorkers: services.workers.size });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
