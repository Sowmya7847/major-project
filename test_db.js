const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const testDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB Atlas...');
        console.log('URI:', process.env.MONGO_URI ? 'Defined (Hidden)' : 'Undefined');

        await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (error) {
        console.error('DB Connection Failed:', error.message);
        process.exit(1);
    }
};

testDB();
