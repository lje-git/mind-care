"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel("chat_room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    // 1. 내 메시지를 DB에 저장
    await supabase.from("messages").insert({ role: "user", text: userText });

    try {
      // 2. 비밀 요원(/api/chat)에게 내 메시지를 보내고 대답 기다리기
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await response.json();

      if (data.reply) {
        // 3. Gemini의 대답을 DB에 저장 (화면은 자동으로 업데이트됨!)
        await supabase.from("messages").insert({ role: "assistant", text: data.reply });
      }
    } catch (error) {
      console.error("에러 발생:", error);
      alert("Gemini와 연결 중 문제가 생겼어요.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-50">
      <header className="mb-6 text-center mt-10">
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">
          마음 챙김 (Mind Care) 🐾
        </h1>
        <p className="text-gray-600 text-sm">
          반려동물을 떠나보낸 당신을 위한 따뜻한 AI 상담소
        </p>
      </header>

      <div className="flex-1 w-full max-w-md bg-white rounded-xl shadow-lg p-4 mb-4 overflow-y-auto min-h-[400px] flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 text-sm">
            <p>아직 대화 내용이 없습니다.</p>
            <p>편안하게 이야기를 시작해보세요.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-indigo-100 text-indigo-900 self-end"
                  : "bg-gray-100 text-gray-800 self-start"
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      <div className="w-full max-w-md flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
          placeholder="여기에 고민을 적어주세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter") handleSendMessage();
          }}
        />
        <button
          onClick={handleSendMessage}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
        >
          전송 🚀
        </button>
      </div>
    </main>
  );
}