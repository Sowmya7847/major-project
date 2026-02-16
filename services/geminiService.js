const { GoogleGenerativeAI } = require("@google/generative-ai");

const analyzeFileRisk = async (filename, mimeType, fileBuffer) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("Gemini API Key missing. Skipping AI analysis.");
            return {
                riskScore: 0,
                summary: "AI Analysis skipped (No API Key).",
                threats: [],
                isFlagged: false
            };
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // For this demo, we can't easily upload huge files to Gemini direct in 'pro' model without File API.
        // We will sample the first 2KB of text if it's text, or just analyze name/metadata if binary.

        let prompt = `Analyze this file upload for security risks. 
        Filename: ${filename}
        Type: ${mimeType}
        `;

        // If simple text data, add snippet
        if (mimeType.startsWith('text/') || mimeType === 'application/json') {
            const snippet = fileBuffer.toString('utf8').slice(0, 1000);
            prompt += `Content Snippet: ${snippet}\n`;
        }

        prompt += `
        Return a JSON response with:
        - riskScore (0-100)
        - summary (short text)
        - threats (array of strings)
        - isFlagged (boolean, true if riskScore > 75)
        Do not acknowledge, just return the JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return {
            riskScore: 0,
            summary: "Could not parse AI response",
            threats: [],
            isFlagged: false
        };

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return {
            riskScore: 0,
            summary: "AI Analysis Failed",
            threats: ["System Error during Analysis"],
            isFlagged: false
        };
    }
};

module.exports = { analyzeFileRisk };
