import { GoogleGenAI } from '@google/genai';

export const chatController = async (req, res) => {
    try {
        const { message, history, userName } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
             return res.status(500).json({ success: false, message: "Gemini API Key missing in backend" });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const systemInstruction = `You are a strict, professional, and friendly AI assistant EXCLUSIVELY for the "Flossie Clothing" e-commerce website.
        The user you are currently talking to is named: ${userName || "Guest"}. Be polite and use their name when appropriate.
        
        YOUR STRICT RULES:
        1. YOU MUST ONLY ANSWER QUESTIONS RELATED TO FLOSSIE CLOTHING, FASHION, ORDERS, OR THE WEBSITE.
        2. IF A USER ASKS ABOUT CODING, PROGRAMMING, MATH, HISTORY, OR ANY GENERAL KNOWLEDGE NOT RELATED TO FLOSSIE CLOTHING, YOU MUST POLITELY REFUSE AND SAY YOUR ONLY JOB IS TO HELP WITH THE CLOTHING STORE.
        3. Do not act like a generic AI like ChatGPT or Gemini. You are the Flossie Assistant.
        4. Reply in Roman Urdu if the user writes in Roman Urdu. Reply in English if the user writes in English.

        WEBSITE KNOWLEDGE YOU POSSESS:
        - Brand: Flossie Clothing (Premium women's fashion in Pakistan, delivering globally).
        - Collections/Categories: New Arrivals, Kohinoor, Customer Favorites (Restocked), Flossie Executive, Safeera, Velvet, Dastaan.
        - Current Promos: Flat 10% OFF on first purchase (Code: FIRST10), Free Shipping in Pakistan.
        - Contact/WhatsApp: 03022228021
        - Features: Users can track orders, add items to cart, use the wishlist (heart icon), and create accounts.
        
        Keep answers short, direct, and human-like. Do not provide code under any circumstances.`;

        // Format history for the new GenAI SDK
        // Frontend sends: { role: 'user' | 'model', text: '...' }
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'model' || msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
            },
            history: formattedHistory
        });

        const response = await chat.sendMessage({ message });
        
        res.status(200).json({ success: true, reply: response.text });
    } catch (error) {
        console.error("CHATBOT_ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to communicate with AI" });
    }
};
