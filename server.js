const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Use an environment variable

app.post('/chat', async (req, res) => {
    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4-turbo",
            messages: req.body.messages,
            temperature: 0.7
        }, {
            headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` }
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch OpenAI response" });
    }
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
