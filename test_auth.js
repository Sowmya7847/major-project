const axios = require('axios');

const testRegistration = async () => {
    console.log('--- Testing Registration via Gateway ---');
    try {
        const res = await axios.post('http://127.0.0.1:4000/api/auth/register', {
            name: 'Test Node',
            email: `node_test_${Date.now()}@test.com`,
            password: 'password123'
        }, { timeout: 10000 });
        console.log('✅ Registration success:', res.data);
    } catch (error) {
        console.error('❌ Registration failed:', error.response ? error.response.data : error.message);
        if (error.code === 'ECONNABORTED') {
            console.error('   Error: Request timed out');
        }
    }
};

const testBackendDirect = async () => {
    console.log('\n--- Testing Backend Directly ---');
    try {
        const res = await axios.get('http://127.0.0.1:5000/', { timeout: 5000 });
        console.log('✅ Backend direct success:', res.data);
    } catch (error) {
        console.error('❌ Backend direct failed:', error.response ? error.response.data : error.message);
    }
};

const runTests = async () => {
    await testBackendDirect();
    await testRegistration();
};

runTests();
