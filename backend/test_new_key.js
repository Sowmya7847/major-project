const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testKey() {
    const key = 'AIzaSyCHTBxFIL19htnta9vyFqHEpsynA1auHxU';
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    try {
        const result = await model.generateContent('ping');
        console.log('KEY_TEST_SUCCESS');
        console.log('Result:', result.response.text());
    } catch (error) {
        console.log('KEY_TEST_FAILED');
        console.error('Error:', error.message);
    }
}

testKey();
