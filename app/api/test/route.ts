import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API Key가 없습니다." });
  }

  // 구글에게 직접 "모델 리스트"를 요청합니다 (SDK 없이 직접 호출)
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );
  
  const data = await response.json();

  return NextResponse.json(data);
}