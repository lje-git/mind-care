"use client";
import { useState, useRef, useEffect } from "react"; // 👈 useRef, useEffect 추가

export default function Home() {
  // 1. 대화 목록 (배열)
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);

  // 2. 현재 입력 중인 글자 (문자열)
  const [input, setInput] = useState("");
  // ... (기존 useState 코드들 아래에 추가)

  // 1. 스크롤할 위치를 가리키는 '이름표' 만들기
  const scrollRef = useRef<HTMLDivElement>(null);

  // 2. 메시지 목록(messages)이 바뀔 때마다 실행되는 '감시자'
  useEffect(() => {
    // 이름표가 붙은 곳(맨 아래)으로 부드럽게 스크롤 이동!
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. 전송 버튼을 눌렀을 때 실행되는 함수 (수정됨)
  const handleSendMessage = () => {
    if (!input.trim()) return;

    // 1) 사용자 메시지 추가
    const newMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput(""); // 입력창 비우기

    // 2) 가짜 AI 응답 (1초 뒤에 실행) -> 무작위 답변 버전
    setTimeout(() => {
      // 답변 리스트 (여기에 원하는 위로의 말을 잔뜩 넣어보세요!)
      const comfortMessages = [
        "당신의 마음을 이해해요. 조금 더 이야기해 주시겠어요? 🌿",
        "많이 힘드셨겠어요. 제가 여기 있으니 편하게 말씀하세요. ☕️",
        "그 마음 충분히 이해합니다. 천천히 이야기해 주세요.",
        "듣고 있어요. 당신은 혼자가 아니에요. 🤍",
        "반려동물과의 추억을 이야기해주시면 마음이 조금 편해질 거예요.",
      ];

      // 제비뽑기: 0번부터 리스트 개수 사이의 숫자를 랜덤으로 뽑음
      const randomText = comfortMessages[Math.floor(Math.random() * comfortMessages.length)];

      const aiMessage = {
        role: "assistant",
        text: randomText, // 뽑은 답변을 넣기
      };
      setMessages((prev) => [...prev, aiMessage]);
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
          messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-indigo-100 text-indigo-900 self-end" // 내 말풍선 (오른쪽)
                  : "bg-gray-100 text-gray-800 self-start" // 상대방 말풍선 (왼쪽)
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
        {/* 👇 여기에 투명한 바닥을 만들고 이름표(ref)를 붙입니다! */}
        <div ref={scrollRef} />
      </div>

      {/* 입력창 영역 */}
      <div className="w-full max-w-md flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
          placeholder="여기에 고민을 적어주세요..."
          value={input} // 👈 뇌(State)와 연결됨
          onChange={(e) => setInput(e.target.value)} // 👈 타자 칠 때마다 기억함
          onKeyDown={(e) => {
  if (e.nativeEvent.isComposing) return; // 👈 글자 조립 중이면 무시해!
  if (e.key === "Enter") handleSendMessage();
}} // 👈 엔터키 쳐도 전송됨
        />
        <button
          onClick={handleSendMessage} // 👈 클릭하면 함수 실행
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
        >
          전송
        </button>
      </div>
    </main>
  );
}