import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. 프론트엔드에서 보낸 메시지를 받아요
    const { message } = await req.json();

    // 2. Gemini를 깨웁니다 (비밀 금고에 있는 키 사용!)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 3. Gemini에게 질문하고 대답을 듣습니다
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    // 4. 들은 대답을 프론트엔드에게 전달합니다
    return NextResponse.json({ reply: text });

  } catch (error) {
    return NextResponse.json({ error: "Gemini가 아프대요 ㅠㅠ" }, { status: 500 });
  }
}