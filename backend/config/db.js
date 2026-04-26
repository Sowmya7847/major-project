const mongoose = require('mongoose');
let mongod = null;

const connectDB = async () => {
    mongoose.set('bufferCommands', false);
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            bufferCommands: false
        });
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.log('Using In-Memory MongoDB for session...');
        try {
            await mongoose.disconnect();
            const { MongoMemoryServer } = require('mongodb-memory-server');
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            console.log(`In-Memory DB Ready: ${mongoose.connection.host}`);
        } catch (fallbackError) {
            console.error(`Critical Fallback Error: ${fallbackError.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
