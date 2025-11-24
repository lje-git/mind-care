"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase"; // 👈 우리가 만든 도구 가져오기

export default function Home() {
  // 대화 목록 (DB에서 가져온 내용들)
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. 처음 들어왔을 때: 옛날 대화 가져오기 + 실시간 구독 시작
  useEffect(() => {
    // (1) 옛날 대화 가져오는 함수
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true }); // 오래된 순서대로

      if (data) setMessages(data);
    };

    fetchMessages(); // 실행!

    // (2) 실시간 대화 감시자 (Realtime)
    const channel = supabase
      .channel("chat_room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          // 누군가 DB에 새 글을 쓰면 여기로 알림이 옵니다!
          const newMessage = payload.new;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // 나가면 감시 끝
    };
  }, []);

  // 스크롤 자동 이동
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 전송 버튼 눌렀을 때
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput(""); // 입력창 바로 비우기

    // 1) 내 메시지를 DB에 저장 (화면 수정 X -> 감시자가 알아서 업데이트해줌)
    await supabase.from("messages").insert({ role: "user", text: userText });

    // 2) 가짜 AI 답장도 DB에 저장
    setTimeout(async () => {
      const comfortMessages = [
        "당신의 마음을 이해해요. 조금 더 이야기해 주시겠어요? 🌿",
        "많이 힘드셨겠어요. 제가 여기 있으니 편하게 말씀하세요. ☕️",
        "그 마음 충분히 이해합니다. 천천히 이야기해 주세요.",
        "듣고 있어요. 당신은 혼자가 아니에요. 🤍",
        "반려동물과의 추억을 이야기해주시면 마음이 조금 편해질 거예요.",
      ];
      const randomText = comfortMessages[Math.floor(Math.random() * comfortMessages.length)];

      await supabase.from("messages").insert({ role: "assistant", text: randomText });
    }, 1000);
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

      {/* 채팅 내용 영역 */}
      <div className="flex-1 w-full max-w-md bg-white rounded-xl shadow-lg p-4 mb-4 overflow-y-auto min-h-[400px] flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 text-sm">
            <p>아직 대화 내용이 없습니다.</p>
            <p>편안하게 이야기를 시작해보세요.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id} // DB의 고유 ID 사용
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

      {/* 입력창 영역 */}
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
          전송
        </button>
      </div>
    </main>
  );
}