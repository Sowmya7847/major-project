const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/distributed-cloud-security', {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Local Connection Failed: ${error.message}`);
        console.log('Attempting to start In-Memory MongoDB (Fallback)...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            const conn = await mongoose.connect(uri);
            console.log(`Fallback MongoDB Connected: ${conn.connection.host}`);
            console.log('WARNING: Running in In-Memory Mode. Data will be lost on server restart.');
        } catch (fallbackError) {
            console.error(`Fallback Failed: ${fallbackError.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
