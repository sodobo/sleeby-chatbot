"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  RotateCcw,
  MessageSquare,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Cpu,
  FileText,
  Sparkles,
  Phone,
  Clock,
} from "lucide-react";
import {
  SESSION_STORAGE_KEY,
  EMPTY_CONTEXT_USER,
  newSessionId,
  windowHistory,
  updateContextUser,
  type ContextUser,
} from "@/lib/session";

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
  used_tool?: string | null;
  tool_label?: string | null;
  agent_thought?: string | null;
  mode?: "standard" | "agent";
}

const KAKAO_CHANNEL_URL = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || "";
const EXPECTED_WAIT_TEXT = "예상 대기 시간: 약 3~5분";

// 상담 연결 패널: 대기 시간 안내 + 전화 상담 신청 + 카카오톡 1:1 상담 + 공식 고객지원
function SupportPanel({ supportUrl, sessionId }: { supportUrl: string; sessionId: string }) {
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const submitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), session_id: sessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setState("done");
        setFeedback(`${data.message} (접수번호 ${data.ticket_id})`);
      } else {
        setState("error");
        setFeedback(data?.error?.message || "전화 상담 신청에 실패했습니다.");
      }
    } catch {
      setState("error");
      setFeedback("네트워크 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <Clock className="w-3.5 h-3.5" />
        <span>{EXPECTED_WAIT_TEXT}</span>
      </div>

      {state === "done" ? (
        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {feedback}
        </div>
      ) : (
        <form onSubmit={submitPhone} className="flex flex-col sm:flex-row gap-2">
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="연락받을 전화번호 (예: 010-1234-5678)"
            aria-label="전화번호"
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-400"
          />
          <button
            type="submit"
            disabled={!phone.trim() || state === "sending"}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-pastel-600 hover:bg-pastel-700 disabled:bg-slate-200 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{state === "sending" ? "접수 중..." : "전화 상담 신청"}</span>
          </button>
        </form>
      )}
      {state === "error" && <div className="text-xs text-rose-600">{feedback}</div>}

      <div className="flex flex-col sm:flex-row gap-2">
        {KAKAO_CHANNEL_URL ? (
          <a
            href={KAKAO_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 flex-1 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>카카오톡 1:1 상담 연결</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="카카오톡 채널 URL 미설정 (.env 의 NEXT_PUBLIC_KAKAO_CHANNEL_URL)"
            className="inline-flex items-center justify-center gap-1.5 flex-1 px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold cursor-not-allowed"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>카카오톡 1:1 상담 연결 (채널 URL 설정 필요)</span>
          </button>
        )}
        <a
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 flex-1 px-4 py-2 bg-pastel-50 hover:bg-pastel-100 text-pastel-700 border border-pastel-300 rounded-lg text-xs font-semibold transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>공식 고객지원(1:1 상담) 연결</span>
        </a>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [chatMode, setChatMode] = useState<"standard" | "agent">("agent");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "안녕하세요! (주)슬리피 고객상담 AI 서비스입니다. 기본 RAG 검색 및 스스로 판단하여 도구를 실행하는 AI 에이전트 모드를 모두 지원합니다. 수면 디바이스 SLEEBY에 대해 무엇이든 질문해 주세요.",
      status: "answered",
      sources: [],
      tool_label: "지식 베이스 준비 완료",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [contextUser, setContextUser] = useState<ContextUser>(EMPTY_CONTEXT_USER);
  const [showResetModal, setShowResetModal] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // 세션 복원: sessionStorage 는 탭/창을 닫으면 브라우저가 자동 삭제
  useEffect(() => {
    let restored = false;
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (typeof saved.session_id === "string" && Array.isArray(saved.messages) && saved.messages.length > 0) {
          setSessionId(saved.session_id);
          setMessages(saved.messages);
          setContextUser({
            user_name: saved.context_user?.user_name ?? null,
            active_products: Array.isArray(saved.context_user?.active_products)
              ? saved.context_user.active_products
              : [],
          });
          restored = true;
        }
      }
    } catch {
      /* 저장소 접근 불가 시 새 세션으로 시작 */
    }
    if (!restored) setSessionId(newSessionId());
    setHydrated(true);
  }, []);

  // 세션 저장
  useEffect(() => {
    if (!hydrated || !sessionId) return;
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ session_id: sessionId, messages, context_user: contextUser })
      );
    } catch {
      /* ignore */
    }
  }, [hydrated, sessionId, messages, contextUser]);

  // 대화 초기화 버튼 → 확인 모달만 띄움 (즉시 삭제하지 않음)
  const requestReset = () => setShowResetModal(true);

  // 모달에서 [확인]을 눌렀을 때만 sessionStorage 와 상태(history) 초기화
  const handleReset = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `대화가 초기화되었습니다. [${
          chatMode === "agent" ? "AI 에이전트 모드" : "기본 RAG 모드"
        }]로 질문을 접수합니다.`,
        status: "answered",
        sources: [],
      },
    ]);
    setContextUser(EMPTY_CONTEXT_USER);
    setSessionId(newSessionId());
    setInput("");
    setShowResetModal(false);
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

    const nextContext = updateContextUser(contextUser, trimmed);
    setContextUser(nextContext);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const endpoint = chatMode === "agent" ? "/api/chat-agent" : "/api/chat";

    try {
      // 최근 10개 메시지(Sliding Window)만 context 로 전달
      const history = windowHistory(
        messages.map((m) => ({
          role: m.role,
          content: m.content,
        }))
      );

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
        body: JSON.stringify({
          message: trimmed,
          history,
          session_id: sessionId,
          context_user: nextContext,
        }),
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
        used_tool: data.used_tool || null,
        tool_label: data.tool_label || null,
        agent_thought: data.agent_thought || null,
        mode: chatMode,
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

  const handleQuickQuestion = (q: string) => {
    setInput(q);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-xl border-x border-slate-100">
      {/* 상단 안내 바 */}
      <div className="bg-pastel-50 border-b border-pastel-200 px-4 py-2 text-center text-xs text-pastel-700 font-medium">
        ※ 현재 배포는 Vercel 프로토타입 시연용 목업 응답 모드입니다.
      </div>

      {/* 헤더 영역 */}
      <header className="px-6 py-4 bg-white border-b border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
            <p className="text-xs text-slate-500">디지털 수면 & 이완 디바이스 전용 어시스턴트</p>
          </div>
        </div>

        {/* 맞춤 큐레이션 버튼 & 모드 전환 탭 & 대화 초기화 버튼 */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/curation"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-pastel-700 bg-pastel-50 hover:bg-pastel-100 border border-pastel-200 rounded-xl transition-all shadow-sm"
          >
            <span>🌙 내게 맞는 수면 제품 찾기</span>
          </Link>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setChatMode("standard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                chatMode === "standard"
                  ? "bg-white text-pastel-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>기본 RAG</span>
            </button>
            <button
              onClick={() => setChatMode("agent")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                chatMode === "agent"
                  ? "bg-pastel-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>AI 에이전트</span>
            </button>
          </div>

          <button
            onClick={requestReset}
            className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="대화 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 현재 모드 안내 서브바 */}
      <div className="px-6 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          {chatMode === "agent" ? (
            <>
              <Sparkles className="w-4 h-4 text-pastel-600" />
              <span className="font-semibold text-pastel-800">Agentic RAG 모드 가동 중:</span>
              <span className="text-slate-500 hidden sm:inline">
                질문 의도에 따라 [Vector DB 검색], [1:1 상담 연결], [맞춤 솔루션 추천] 도구를 스스로 선택합니다.
              </span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-700">기본 RAG 모드:</span>
              <span className="text-slate-500 hidden sm:inline">
                공식 21개 FAQ 데이터베이스를 기반으로 정확한 답변과 출처를 제공합니다.
              </span>
            </>
          )}
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono">
          {chatMode === "agent" ? "POST /api/chat-agent" : "POST /api/chat"}
        </span>
      </div>

      {/* 문의 제품 컨텍스트 (context_user.active_products) */}
      {(contextUser.active_products.length > 0 || contextUser.user_name) && (
        <div className="px-6 py-1.5 bg-white border-b border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
          {contextUser.user_name && <span>👤 {contextUser.user_name}님</span>}
          {contextUser.active_products.length > 0 && <span className="font-medium">문의 제품:</span>}
          {contextUser.active_products.map((p) => (
            <span key={p} className="px-2 py-0.5 rounded-full bg-pastel-50 border border-pastel-200 text-pastel-700 font-semibold">
              {p}
            </span>
          ))}
        </div>
      )}

      {/* 메시지 리스트 영역 */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] md:max-w-[78%] rounded-2xl p-4 shadow-sm ${
                msg.role === "user"
                  ? "bg-pastel-600 text-white rounded-tr-none"
                  : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
              }`}
            >
              {/* 에이전트 실행 도구 배지 (Agent Badge) */}
              {msg.role === "assistant" && msg.tool_label && (
                <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                  <span>🤖 실행된 AI 도구:</span>
                  <span className="text-indigo-900 font-bold">{msg.tool_label}</span>
                </div>
              )}

              {/* 에이전트 사고 과정 (Thought Process) */}
              {msg.role === "assistant" && msg.agent_thought && (
                <div className="mb-2.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                  <span className="font-semibold text-slate-700">💭 에이전트 판단: </span>
                  {msg.agent_thought}
                </div>
              )}

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

              {/* 상담 연결: 대기 시간 안내 + 전화 상담 신청 + 카카오톡 1:1 상담 */}
              {(msg.needs_support ||
                msg.status === "insufficient_context" ||
                msg.status === "support_required") && (
                <SupportPanel
                  supportUrl={msg.support_url || "https://sleeby.channel.io"}
                  sessionId={sessionId}
                />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-slate-100 shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-pastel-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-pastel-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-pastel-600 animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-xs text-slate-400 ml-2">
                {chatMode === "agent" ? "에이전트가 도구를 선택하고 분석 중..." : "근거 자료 검색 중..."}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 대화 초기화 확인 모달 */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
            <h2 id="reset-modal-title" className="text-base font-bold text-slate-800">
              대화 내역을 모두 지우시겠습니까?
            </h2>
            <p className="mt-1.5 text-xs text-slate-500">지운 대화는 복구할 수 없습니다.</p>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 추천 질문 (P2 기능) */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs text-slate-500 scrollbar-none">
        <span className="shrink-0 text-[11px] text-slate-400 font-medium">테스트 질문:</span>
        <button
          onClick={() => handleQuickQuestion("잠이 잘 안 오고 뒤척이는데 어떤 제품을 써야 하나요?")}
          className="shrink-0 px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full transition-colors font-medium"
        >
          🤖 [맞춤 추천] 잠이 잘 안 와요
        </button>
        <button
          onClick={() => handleQuickQuestion("충전이 끝나면 LED가 어떻게 표시되나요?")}
          className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-pastel-50 hover:text-pastel-600 rounded-full transition-colors"
        >
          🔍 [FAQ 검색] 충전 LED 안내
        </button>
        <button
          onClick={() => handleQuickQuestion("주문 취소하고 환불받고 싶어요")}
          className="shrink-0 px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-full transition-colors font-medium"
        >
          💬 [상담 연결] 환불 요청
        </button>
      </div>

      {/* 입력 영역 */}
      <footer className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              chatMode === "agent"
                ? "에이전트에게 수면 증상 상담, 제품 추천, FAQ 등을 자유롭게 질문해 보세요..."
                : "SLEEBY 제품에 대해 궁금하신 점을 입력해 주세요..."
            }
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
          제품/카테고리 선택 없이 자연어로 바로 질문하실 수 있으며, 상단 탭에서 모드를 언제든 변경할 수 있습니다.
        </div>
      </footer>
    </div>
  );
}
