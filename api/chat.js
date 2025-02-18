import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export const config = {
  runtime: "edge", // ✅ Use Edge functions (Vercel supports streaming here)
};

export default async function handler(req) {
    if (req.method !== "POST") {
        return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in Vercel
    });

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant. Generate responses in a conversational manner." },
                ...req.body.messages
            ],
            temperature: 0.7,
            stream: true,  // ✅ Enables streaming
        });

        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();

        (async () => {
            for await (const chunk of completion) {
                await writer.write(encoder.encode(chunk.choices[0]?.delta?.content || ""));
            }
            writer.close();
        })();

        return new Response(readable, {
            headers: {
                "Content-Type": "text/plain",
            },
        });

    } catch (error) {
        console.error("❌ OpenAI API Error:", error);
        return NextResponse.json({ 
            error: "Failed to fetch OpenAI response", 
            details: error.message 
        }, { status: 500 });
    }
}
