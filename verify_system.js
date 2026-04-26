const axios = require('axios');

const API_URL = 'http://localhost:4000/api/auth';

const testUser = {
    name: 'Test Verify',
    email: `test_${Date.now()}@verify.com`,
    password: 'password123'
};

const runVerification = async () => {
    console.log('--- Starting System Verification ---');

    // 1. Test Registration
    try {
        console.log(`1. Attempting Registration for ${testUser.email}...`);
        const regRes = await axios.post(`${API_URL}/register`, testUser);
        console.log('✅ Registration Successful!');
        console.log('   ID:', regRes.data._id);
    } catch (error) {
        console.error('❌ Registration Failed:', error.response ? error.response.data : error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('   CRITICAL: Gateway (Port 4000) is not reachable.');
        }
        return;
    }

    // 2. Test Login
    try {
        console.log(`\n2. Attempting Login for ${testUser.email}...`);
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('✅ Login Successful!');
        console.log('   Token received:', !!loginRes.data.token);
    } catch (error) {
        console.error('❌ Login Failed:', error.response ? error.response.data : error.message);
    }
};

runVerification();
