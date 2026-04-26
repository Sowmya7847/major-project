const { MongoMemoryServer } = require('mongodb-memory-server');

const run = async () => {
    console.log('Starting MongoMemoryServer...');
    try {
        const mongod = await MongoMemoryServer.create();
        console.log('✅ Success! URI:', mongod.getUri());
        await mongod.stop();
    } catch (err) {
        console.error('❌ Failed:', err);
    }
};

run();
