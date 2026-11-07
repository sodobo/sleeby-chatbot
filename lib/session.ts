// (주)슬리피 챗봇 세션/컨텍스트 공용 유틸 (브라우저·서버 양쪽에서 import 가능, 모듈 로드 시 브라우저 API 미사용)

export const SESSION_STORAGE_KEY = "sleeby_chat_session";
/** LLM context 로 전달하는 최근 메시지 수 (Sliding Window) */
export const HISTORY_WINDOW = 10;

export interface ContextUser {
  user_name: string | null;
  /** 문의 중인 제품 목록 (1개 이상, 예: ["밴드형", "거치대형"]) */
  active_products: string[];
}

export interface HistoryItem {
  role: "user" | "assistant";
  content: string;
}

export const EMPTY_CONTEXT_USER: ContextUser = { user_name: null, active_products: [] };

/** 같은 IP 의 여러 사용자를 구분하기 위한 세션 ID (탭 단위로 sessionStorage 에 보관) */
export function newSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "s-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

export function isValidSessionId(id: unknown): id is string {
  return typeof id === "string" && SESSION_ID_PATTERN.test(id);
}

/** 최근 N개 메시지만 남김 */
export function windowHistory<T>(history: T[], size: number = HISTORY_WINDOW): T[] {
  return history.length > size ? history.slice(history.length - size) : history;
}

const PRODUCT_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: "밴드형", pattern: /밴드\s*형?/ },
  { name: "거치대형", pattern: /거치대\s*형?/ },
];

/** 사용자 발화에서 제품명을 추출해 active_products 배열에 중복 없이 누적 */
export function detectProducts(text: string, current: string[] = []): string[] {
  const next = [...current];
  for (const { name, pattern } of PRODUCT_PATTERNS) {
    if (pattern.test(text) && !next.includes(name)) next.push(name);
  }
  return next;
}

/** "저는 홍길동입니다" / "이름은 홍길동" 형태에서 이름 추출 (없으면 null) */
export function detectUserName(text: string): string | null {
  const m = text.match(/(?:저는|제 이름은|이름은)\s*([가-힣A-Za-z]{2,10})\s*(?:입니다|이에요|예요|이야|이라고)/);
  return m ? m[1] : null;
}

export function updateContextUser(prev: ContextUser, userText: string): ContextUser {
  return {
    user_name: detectUserName(userText) ?? prev.user_name,
    active_products: detectProducts(userText, prev.active_products),
  };
}

/** 요청 본문에서 세션 ID·최근 10개 히스토리·사용자 컨텍스트를 안전하게 정규화 (서버용) */
export function normalizeRequestContext(body: unknown): {
  session_id: string | null;
  history: HistoryItem[];
  context_user: ContextUser;
} {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const rawHistory = Array.isArray(b.history) ? b.history : [];
  const history: HistoryItem[] = rawHistory
    .filter(
      (h): h is HistoryItem =>
        !!h &&
        typeof h === "object" &&
        ((h as HistoryItem).role === "user" || (h as HistoryItem).role === "assistant") &&
        typeof (h as HistoryItem).content === "string"
    )
    .map((h) => ({ role: h.role, content: h.content.slice(0, 2000) }));

  const cu = (b.context_user && typeof b.context_user === "object" ? b.context_user : {}) as Partial<ContextUser>;
  const products = Array.isArray(cu.active_products)
    ? cu.active_products.filter((p): p is string => typeof p === "string").slice(0, 10)
    : [];

  return {
    session_id: isValidSessionId(b.session_id) ? b.session_id : null,
    history: windowHistory(history),
    context_user: {
      user_name: typeof cu.user_name === "string" ? cu.user_name.slice(0, 20) : null,
      active_products: products,
    },
  };
}
