// app/api/gemini/route.js

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  const { prompt } = await req.json();

  if (!prompt) {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return Response.json({ result: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
