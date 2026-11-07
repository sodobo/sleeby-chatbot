"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, MessageSquare, ExternalLink, HelpCircle, AlertCircle, CheckCircle2 } from "lucide-react";

interface SourceItem {
  document_id: string;
  title: string;
  faq_id: string | null;
  location: string | null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "answered" | "clarification_needed" | "insufficient_context" | "support_required";
  sources?: SourceItem[];
  needs_support?: boolean;
  support_url?: string | null;
  follow_up_question?: string | null;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "안녕하세요! (주)슬리피 고객상담 AI 에이전트입니다. 수면/이완 보조 기기 SLEEBY에 대해 궁금하신 점을 자유롭게 질문해 주세요.",
      status: "answered",
      sources: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // 대화 초기화
  const handleReset = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "대화가 초기화되었습니다. SLEEBY 제품에 대해 궁금한 점을 질문해 주세요.",
        status: "answered",
        sources: [],
      },
    ]);
    setInput("");
  };

  // 질문 전송
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 대화 히스토리 구성
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data?.error?.message || "요청을 처리하는 중 오류가 발생했습니다.",
            status: "insufficient_context",
            needs_support: true,
          },
        ]);
        return;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        status: data.status,
        sources: data.sources || [],
        needs_support: data.needs_support,
        support_url: data.support_url,
        follow_up_question: data.follow_up_question,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "네트워크 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.",
          status: "insufficient_context",
          needs_support: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 빠른 질문 예시 선택
  const handleQuickQuestion = (q: string) => {
    setInput(q);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-xl border-x border-slate-100">
      {/* 상단 안내 바 (Vercel 프로토타입 시연 명시) */}
      <div className="bg-pastel-50 border-b border-pastel-200 px-4 py-2 text-center text-xs text-pastel-700 font-medium">
        ※ 현재 배포는 Vercel 프로토타입 시연용 목업 응답 모드입니다.
      </div>

      {/* 헤더 영역 */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-pastel-100 flex items-center justify-center text-pastel-600 font-bold text-lg shadow-inner">
            🌙
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              (주)슬리피 고객상담 AI
              <span className="text-xs px-2 py-0.5 rounded-full bg-pastel-100 text-pastel-700 font-semibold">
                R02 규격
              </span>
            </h1>
            <p className="text-xs text-slate-500">디지털 수면 & 이완 디바이스 전용 상담</p>
          </div>
        </div>

        {/* 대화 초기화 버튼 */}
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          title="대화 초기화"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>대화 초기화</span>
        </button>
      </header>

      {/* 메시지 리스트 영역 */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                msg.role === "user"
                  ? "bg-pastel-600 text-white rounded-tr-none"
                  : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
              }`}
            >
              {/* 메시지 본문 */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>

              {/* clarification_needed 추가 질문 강조 표시 */}
              {msg.status === "clarification_needed" && msg.follow_up_question && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-amber-800">추가 확인이 필요합니다</div>
                    <div className="text-xs text-amber-700 mt-0.5">{msg.follow_up_question}</div>
                  </div>
                </div>
              )}

              {/* R02 출처 객체 (sources) 태그 표시 */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>답변 근거 출처</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] bg-pastel-50 text-pastel-700 px-2.5 py-1 rounded-md border border-pastel-200 font-medium"
                      >
                        <span className="font-semibold text-pastel-800">[{src.faq_id || src.document_id}]</span>
                        <span>{src.title}</span>
                        {src.location && <span className="text-pastel-500">({src.location})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 상담 유도 버튼 (needs_support or insufficient_context / support_required) */}
              {(msg.needs_support ||
                msg.status === "insufficient_context" ||
                msg.status === "support_required") && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <a
                    href={msg.support_url || "https://sleeby.channel.io"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full md:w-auto px-4 py-2 bg-pastel-50 hover:bg-pastel-100 text-pastel-700 border border-pastel-300 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>공식 고객지원(1:1 상담) 연결</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 로딩 인디케이터 */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-slate-100 shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-pastel-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-pastel-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-pastel-600 animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-xs text-slate-400 ml-2">근거 자료 검색 중...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 추천 질문 (P2 기능: 선택 강제 없이 편의 제공) */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs text-slate-500 scrollbar-none">
        <span className="shrink-0 text-[11px] text-slate-400 font-medium">자주 묻는 질문:</span>
        <button
          onClick={() => handleQuickQuestion("충전이 끝나면 LED가 어떻게 표시되나요?")}
          className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-pastel-50 hover:text-pastel-600 rounded-full transition-colors"
        >
          충전 완료 LED 표시
        </button>
        <button
          onClick={() => handleQuickQuestion("잠든 뒤에도 계속 착용하고 있어도 괜찮나요?")}
          className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-pastel-50 hover:text-pastel-600 rounded-full transition-colors"
        >
          수면 중 착용 여부
        </button>
        <button
          onClick={() => handleQuickQuestion("음악이나 오디오북을 들을 수 있나요?")}
          className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-pastel-50 hover:text-pastel-600 rounded-full transition-colors"
        >
          음악 재생 지원 여부
        </button>
        <button
          onClick={() => handleQuickQuestion("주문 취소 및 환불하고 싶어요")}
          className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-full transition-colors"
        >
          주문/환불 문의
        </button>
      </div>

      {/* 입력 영역 */}
      <footer className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="SLEEBY 제품에 대해 궁금한 점을 입력해 주세요..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pastel-400 focus:bg-white transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 bg-pastel-600 hover:bg-pastel-700 disabled:bg-slate-200 text-white rounded-xl text-sm font-semibold flex items-center justify-center transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-1 text-[11px] text-slate-400 text-center">
          제품 또는 카테고리 선택 없이 자연어로 바로 질문하실 수 있습니다.
        </div>
      </footer>
    </div>
  );
}
