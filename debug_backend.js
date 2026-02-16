const path = require('path');

console.log('Starting Comprehensive Debug...');

try {
    // Utils
    console.log('Requiring utils/generateToken...');
    require('./utils/generateToken');
    console.log('Success.');

    // Models
    console.log('Requiring models/User...');
    require('./models/User');
    console.log('Success.');
    console.log('Requiring models/Key...');
    require('./models/Key');
    console.log('Success.');
    console.log('Requiring models/VirtualNode...');
    require('./models/VirtualNode');
    console.log('Success.');
    console.log('Requiring models/FileRecord...');
    require('./models/FileRecord');
    console.log('Success.');
    console.log('Requiring models/SystemMetric...');
    require('./models/SystemMetric');
    console.log('Success.');

    // Services
    console.log('Requiring services/encryptionService...');
    require('./services/encryptionService');
    console.log('Success.');
    console.log('Requiring services/geminiService...');
    require('./services/geminiService'); // Likely to fail if pkg missing
    console.log('Success.');
    console.log('Requiring services/nodeService...');
    require('./services/nodeService');
    console.log('Success.');

    // Controllers
    console.log('Requiring controllers/authController...');
    require('./controllers/authController');
    console.log('Success.');
    console.log('Requiring controllers/keyController...');
    require('./controllers/keyController');
    console.log('Success.');
    console.log('Requiring controllers/fileController...');
    require('./controllers/fileController');
    console.log('Success.');

    // Routes
    console.log('Requiring routes/authRoutes...');
    require('./routes/authRoutes');
    console.log('Success.');
    console.log('Requiring routes/keyRoutes...');
    require('./routes/keyRoutes');
    console.log('Success.');
    console.log('Requiring routes/fileRoutes...');
    require('./routes/fileRoutes');
    console.log('Success.');

    console.log('ALL MODULES LOADED SUCCESSFULLY');

} catch (error) {
    console.error('DEBUG ERROR:', error);
}
