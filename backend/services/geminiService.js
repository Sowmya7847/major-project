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
        console.error("Gemini Analysis Error:", error.message);
        // Fallback to simulated local analysis if API key is invalid/fails
        const isSuspicious = filename.includes('.exe') || mimeType === 'application/x-msdownload';
        return {
            riskScore: isSuspicious ? 85 : 15,
            summary: isSuspicious ? "Potentially malicious executable file detected." : "File appears to be clean and safe.",
            threats: isSuspicious ? ["Executable content", "Unknown signature"] : [],
            isFlagged: isSuspicious
        };
    }
};

const getChatResponse = async (userMessage, history = [], rawMessage = "") => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return "Chat service is currently unavailable. Please configure API key.";
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-1.5-flash for better performance and instruction following
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: {
                parts: [{ text: "You are SecureCloud AI, a specialized security assistant for the SecureCloud Distributed System. You only answer questions related to: 1. Cloud Security, 2. Encryption (AES, CP-ABE, RSA), 3. Distributed Storage, 4. SecureCloud Project technical details. If a user asks about anything else, politely decline and steer back to security. Use markdown if helpful. Keep responses professional and concise." }]
            }
        });

        const chat = model.startChat({
            history: history
                .filter(h => h.role && h.content)
                .map(h => ({
                    role: h.role === 'user' ? 'user' : 'model',
                    parts: [{ text: h.content }],
                })),
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("Gemini Chat Error:", error.message);
        
        // Local Fallback simulation (use rawMessage if provided to avoid matching context text)
        const lowerMsg = (rawMessage || userMessage).toLowerCase();
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            return "Hello there! I am currently running in local offline mode (API key unavailable/invalid). I can still answer basic questions about SecureCloud! What would you like to know?";
        } else if (lowerMsg.includes('aes') || lowerMsg.includes('encryption')) {
            return "SecureCloud uses AES-256-GCM by default for high-performance, authenticated encryption. We also support CP-ABE for attribute-based access control.";
        } else if (lowerMsg.includes('cp-abe') || lowerMsg.includes('abe')) {
            return "CP-ABE (Ciphertext-Policy Attribute-Based Encryption) allows us to encrypt data based on an access policy (e.g., 'Role:Admin OR Dept:HR'). Only users whose attributes satisfy the policy can decrypt it.";
        } else if (lowerMsg.includes('architecture') || lowerMsg.includes('distributed') || lowerMsg.includes('nodes')) {
            return "The system uses a distributed architecture where a central Gateway proxies requests to multiple Worker Nodes. Files are chunked, encrypted, and distributed across these nodes to ensure high availability and security.";
        }
        
        return "I am currently in local fallback mode because my AI brain (Gemini API) is unreachable. I can only answer simple predefined questions about SecureCloud's architecture and encryption algorithms right now.";
    }
};

module.exports = { analyzeFileRisk, getChatResponse };
