const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testKey() {
    const key = 'AIzaSyCHTBxFIL19htnta9vyFqHEpsynA1auHxU';
    const genAI = new GoogleGenerativeAI(key);

    const models = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro'
    ];

    for (const modelName of models) {
        console.log(`Testing model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('ping');
            console.log(`SUCCESS [${modelName}]:`, result.response.text());
        } catch (error) {
            console.log(`FAILED [${modelName}]:`, error.message);
        }
    }
}

testKey();
