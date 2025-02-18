import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method Not Allowed" });
        return;
    }

    if (!process.env.OPENAI_API_KEY) {
        res.status(500).json({ error: "OpenAI API Key is missing" });
        return;
    }

    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4-turbo",
            messages: req.body.messages,
            temperature: 0.7,
            stream: true  // ✅ Enables streaming
        }, {
            headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
            responseType: "stream"
        });

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const stream = response.data;
        let buffer = "";

        stream.on("data", (chunk) => {
            buffer += chunk.toString();
            const parts = buffer.split("\n");

            for (let part of parts) {
                if (part.trim().startsWith("data: ")) {
                    try {
                        const json = JSON.parse(part.replace("data: ", ""));
                        if (json.choices && json.choices[0].delta && json.choices[0].delta.content) {
                            const newText = json.choices[0].delta.content;
                            res.write(`data: ${newText}\n\n`);  // ✅ Send only the new text
                        }
                    } catch (e) {
                        console.error("Error parsing JSON chunk:", e);
                    }
                }
            }
        });

        stream.on("end", () => res.end());

    } catch (error) {
        console.error("❌ OpenAI API Error:", error);
        res.status(500).json({ 
            error: "Failed to fetch OpenAI response", 
            details: error.message 
        });
    }
}
