import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key가 없습니다." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // 👇 모델 이름을 최신 버전으로 변경!
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    // 👇 에러가 나면 여기에 자세한 이유가 찍힙니다!
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "API Error" }, { status: 500 });
  }
}