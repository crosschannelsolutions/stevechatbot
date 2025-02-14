import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Read API Key from Vercel

    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4-turbo",
            messages: req.body.messages,
            temperature: 0.7
        }, {
            headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` }
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch OpenAI response", details: error.message });
    }
}
