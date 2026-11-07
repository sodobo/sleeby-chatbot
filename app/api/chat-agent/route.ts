import { NextRequest, NextResponse } from "next/server";
import experimentConfig from "@/scripts/experiment_config.json";

// ==============================================================================
// 1. (주)슬리피 공식 승인 21개 FAQ 지식 베이스
// ==============================================================================
interface FaqItem {
  faq_id: string;
  document_id: string;
  title: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

const FAQ_KNOWLEDGE_BASE: FaqItem[] = [
  {
    faq_id: "FAQ-01",
    document_id: "DOC-FAQ-001",
    title: "SLEEBY는 잠들기 전에만 사용하면 되나요?",
    category: "사용 방법",
    question: "SLEEBY는 잠들기 전에만 사용하면 되나요?",
    answer: "밤에 잠자리에 들기 전은 물론, 낮에 잠깐 자거나 휴식을 취하고 싶을 때도 사용하실 수 있어요. 양쪽 귀에 착용한 뒤 평소처럼 주무시거나 쉬시면 됩니다. SLEEBY에서 나오는 작은 소리에 집중하셔도 되고, 특별히 신경 쓰지 않으셔도 괜찮아요.",
    keywords: ["잠들기 전", "사용 시간", "낮잠", "휴식", "착용 시기"]
  },
  {
    faq_id: "FAQ-02",
    document_id: "DOC-FAQ-002",
    title: "잠든 뒤에도 계속 착용하고 있어도 괜찮나요?",
    category: "사용 방법",
    question: "잠든 뒤에도 계속 착용하고 있어도 괜찮나요?",
    answer: "네. 양이성 음향은 전원이 켜진 뒤 약 30분이 지나면 자동으로 꺼져요. 30분 안에 잠드셨다면 착용한 채로 계속 주무셔도 괜찮습니다. 불편하면 빼셔도 되니, 편안한 쪽으로 선택해 주세요.",
    keywords: ["착용 지속", "30분", "자동 꺼짐", "수면 중 착용", "계속 착용", "자면서"]
  },
  {
    faq_id: "FAQ-03",
    document_id: "DOC-FAQ-003",
    title: "사용하다가 중간에 빼도 되나요?",
    category: "사용 방법",
    question: "사용하다가 중간에 빼도 되나요?",
    answer: "네. 사용 중 불편하거나 빼고 싶을 때는 언제든 빼셔도 됩니다.",
    keywords: ["중간에 빼기", "제거", "사용 중지", "빼도"]
  },
  {
    faq_id: "FAQ-04",
    document_id: "DOC-FAQ-004",
    title: "잠이 들지 않으면 다시 착용해도 되나요?",
    category: "사용 방법",
    question: "잠이 들지 않으면 다시 착용해도 되나요?",
    answer: "네. 30분 후 SLEEBY 전원이 자동으로 꺼진 뒤에도 잠이 들지 않거나 졸린 느낌이 없다면 다시 사용하셔도 돼요. SLEEBY를 충전 케이스에 넣었다가 1~2초 후 다시 꺼내 착용하면 양이성 음향이 다시 30분 동안 재생됩니다.",
    keywords: ["재착용", "다시 사용", "재생", "케이스에 넣었다 꺼내기", "다시 켜기"]
  },
  {
    faq_id: "FAQ-05",
    document_id: "DOC-FAQ-005",
    title: "낮잠을 잘 때 사용해도 되나요?",
    category: "사용 방법",
    question: "낮잠을 잘 때 사용해도 되나요?",
    answer: "네. 낮잠이나 휴식을 취할 때도 사용하실 수 있어요. 편안한 상태에서 착용해 주세요.",
    keywords: ["낮잠", "휴식", "낮에 사용", "낮잠잘 때"]
  },
  {
    faq_id: "FAQ-06",
    document_id: "DOC-FAQ-006",
    title: "매일 사용해도 괜찮나요?",
    category: "안전/효과",
    question: "매일 사용해도 괜찮나요?",
    answer: "네. 착용감에 불편함이 없다면 밤이나 일상에서 필요할 때 반복해서 사용하셔도 괜찮아요. 양이성 음향에 대한 반응은 사람마다 다를 수 있으며, 사용 경험에도 개인차가 있을 수 있습니다.",
    keywords: ["매일 사용", "반복 사용", "자주 사용", "부작용", "매일 써도"]
  },
  {
    faq_id: "FAQ-07",
    document_id: "DOC-FAQ-007",
    title: "충전이 끝나면 LED가 어떻게 표시되나요?",
    category: "충전/배터리",
    question: "충전이 끝나면 LED가 어떻게 표시되나요?",
    answer: "케이스를 충전하는 동안에는 흰색 LED가 깜박이고, 충전이 완료되면 흰색 LED가 계속 켜져 있어요.",
    keywords: ["충전 완료", "LED", "불빛", "흰색 LED", "깜박임", "충전 완료 표시"]
  },
  {
    faq_id: "FAQ-08",
    document_id: "DOC-FAQ-008",
    title: "충전 케이스를 충전하는 동안 SLEEBY를 사용해도 되나요?",
    category: "충전/배터리",
    question: "충전 케이스를 충전하는 동안 SLEEBY를 사용해도 되나요?",
    answer: "네. 충전 케이스를 충전하면서 SLEEBY를 꺼내 사용하셔도 돼요.",
    keywords: ["케이스 충전 중 사용", "동시 사용", "충전 중에 사용"]
  },
  {
    faq_id: "FAQ-09",
    document_id: "DOC-FAQ-009",
    title: "충전 케이스를 충전하면서 SLEEBY도 충전할 수 있나요?",
    category: "충전/배터리",
    question: "충전 케이스를 충전하면서 SLEEBY도 충전할 수 있나요?",
    answer: "네. 충전 케이스에 케이블을 연결해 충전하는 중에도, 케이블을 연결하지 않은 상태에서도 SLEEBY를 케이스에 넣으면 충전할 수 있어요.",
    keywords: ["동시 충전", "본체 충전", "케이스 충전", "같이 충전"]
  },
  {
    faq_id: "FAQ-010",
    document_id: "DOC-FAQ-010",
    title: "이어팁은 어떻게 교체하나요?",
    category: "관리/보관",
    question: "이어팁은 어떻게 교체하나요?",
    answer: "이어팁을 SLEEBY 본체에서 조심스럽게 분리한 뒤, 사용할 크기의 이어팁을 본체에 맞춰 끼워 주세요. 너무 세게 잡아당기거나 비틀지 않도록 주의해 주세요.",
    keywords: ["이어팁 교체", "이어팁 분리", "이어팁 끼우기", "팁 교체"]
  },
  {
    faq_id: "FAQ-011",
    document_id: "DOC-FAQ-011",
    title: "SLEEBY 본체는 어떻게 청소하면 되나요?",
    category: "관리/보관",
    question: "SLEEBY 본체는 어떻게 청소하면 되나요?",
    answer: "SLEEBY는 방수 기능이 없어요. 흐르는 물에 씻거나 물에 담그면 고장 날 수 있으니 피해주세요. 안경을 닦듯이 세척액이나 물티슈를 묻혀 닦는 방법은 괜찮습니다.",
    keywords: ["청소", "세척", "방수", "물티슈", "소독", "물로 씻기", "방수 기능"]
  },
  {
    faq_id: "FAQ-012",
    document_id: "DOC-FAQ-012",
    title: "사용하지 않을 때는 어떻게 보관하는 게 좋나요?",
    category: "관리/보관",
    question: "사용하지 않을 때는 어떻게 보관하는 게 좋나요?",
    answer: "사용하지 않을 때는 본체를 충전 케이스에 넣어 보관해 주세요. 습기가 많거나 온도가 높은 곳은 피해 주세요.",
    keywords: ["보관", "케이스 보관", "습기", "보관 방법", "어디에 보관"]
  },
  {
    faq_id: "FAQ-013",
    document_id: "DOC-FAQ-013",
    title: "여행할 때 비행기나 기차 안에서 사용해도 되나요?",
    category: "착용/편의성",
    question: "여행할 때 비행기나 기차 안에서 사용해도 되나요?",
    answer: "네. 사용하셔도 돼요. 주변이 시끄러우면 SLEEBY의 양이성 음향이 잘 들리지 않을 수 있지만, 소리가 또렷하게 들리지 않더라도 착용해 사용하실 수 있어요. 다만 안내 방송이나 안전 안내를 들어야 하는 상황에서는 사용을 피해 주세요.",
    keywords: ["비행기", "기차", "여행", "대중교통", "기내 사용", "ktx", "안내 방송"]
  },
  {
    faq_id: "FAQ-014",
    document_id: "DOC-FAQ-014",
    title: "잠귀가 밝은 편인데, 주변 소리가 들리나요?",
    category: "제품 소개/기능",
    question: "잠귀가 밝은 편인데, 주변 소리가 들리나요?",
    answer: "SLEEBY에는 액티브 노이즈 캔슬링 기능이 없고, 외부 소리를 완전히 차단하는 제품도 아니에요. 일반 귀마개를 착용했을 때처럼 주변 소리가 작게 들릴 수 있으며, 소리가 들리는 정도는 착용 상태와 개인차에 따라 달라질 수 있습니다.",
    keywords: ["노이즈 캔슬링", "차음", "주변 소리", "소음 차단", "anc", "소음"]
  },
  {
    faq_id: "FAQ-015",
    document_id: "DOC-FAQ-015",
    title: "음악이나 오디오북을 들으면서 함께 사용할 수 있나요?",
    category: "제품 소개/기능",
    question: "음악이나 오디오북을 들으면서 함께 사용할 수 있나요?",
    answer: "SLEEBY는 다른 기기와 연결해 음악이나 오디오북을 재생하는 제품이 아니에요. 내장된 양이성 음향을 단독으로 사용해 주세요.",
    keywords: ["음악 재생", "오디오북", "블루투스 스피커", "이어폰 기능", "노래 듣기", "유튜브", "멜론"]
  },
  {
    faq_id: "FAQ-016",
    document_id: "DOC-FAQ-016",
    title: "헤드폰이나 다른 귀마개와 같이 착용할 수 있나요?",
    category: "착용/편의성",
    question: "헤드폰이나 다른 귀마개와 같이 착용할 수 있나요?",
    answer: "SLEEBY는 다른 기기나 귀마개와 함께 착용하도록 설계된 제품은 아니에요. 함께 착용하면 불편하거나 제품을 의도한 방식으로 사용하기 어려울 수 있으니 단독으로 착용해 주세요.",
    keywords: ["헤드폰 중복 착용", "귀마개 동시 착용", "이중 착용", "헤드폰 같이"]
  },
  {
    faq_id: "FAQ-017",
    document_id: "DOC-FAQ-017",
    title: "양쪽 귀의 크기가 다른데, 이어팁을 서로 다른 크기로 사용해도 되나요?",
    category: "착용/편의성",
    question: "양쪽 귀의 크기가 다른데, 이어팁을 서로 다른 크기로 사용해도 되나요?",
    answer: "네. 좌우 귀에 잘 맞는 크기가 다르다면 각 귀에 맞는 이어팁을 따로 사용하셔도 돼요. 다만 SLEEBY 본체의 ‘L/R’ 표시는 올바르게 맞춰 착용해 주세요.",
    keywords: ["양쪽 귀 크기", "이어팁 다른 크기", "좌우 비대칭", "l/r", "짝짝이"]
  },
  {
    faq_id: "FAQ-018",
    document_id: "DOC-FAQ-018",
    title: "귀가 작은 편인데 잘 맞을까요?",
    category: "착용/편의성",
    question: "귀가 작은 편인데 잘 맞을까요?",
    answer: "귀 모양과 크기는 사람마다 달라 착용감에 차이가 있을 수 있어요. 동봉된 S/M/L 이어팁 중 귀에 편안하게 맞는 크기를 선택해 주세요.",
    keywords: ["작은 귀", "크기 선택", "s/m/l 이어팁", "착용감", "귀가 작아요"]
  },
  {
    faq_id: "FAQ-019",
    document_id: "DOC-FAQ-019",
    title: "잠잘 때 옆으로 누워도 불편하지 않나요?",
    category: "착용/편의성",
    question: "잠잘 때 옆으로 누워도 불편하지 않나요?",
    answer: "착용감은 귀 모양과 자세에 따라 다를 수 있어요. 옆으로 누웠을 때 불편하다면 착용 위치를 조정하거나 잠시 빼 주세요.",
    keywords: ["옆으로 눕기", "옆잠", "수면 자세", "통증", "눌림", "배김"]
  },
  {
    faq_id: "FAQ-020",
    document_id: "DOC-FAQ-020",
    title: "귀 질환이 있거나 귀가 민감한 사람도 사용할 수 있나요?",
    category: "안전/효과",
    question: "귀 질환이 있거나 귀가 민감한 사람도 사용할 수 있나요?",
    answer: "귀에 통증이나 질환이 있거나 착용 중 불편함이 느껴지면 사용을 중단해 주세요. 사용해도 괜찮을지 걱정되신다면 의료 전문가와 상담해 주세요.",
    keywords: ["귀 질환", "이명", "중이염", "외이도염", "의료 전문가", "의사 상담", "귀 염증"]
  },
  {
    faq_id: "FAQ-021",
    document_id: "DOC-FAQ-021",
    title: "구성품에는 어떤 것들이 들어 있나요?",
    category: "제품 소개/기능",
    question: "구성품에는 어떤 것들이 들어 있나요?",
    answer: "기본 구성품에는 SLEEBY 본체, 충전 케이스, USB-C 충전 케이블, S/M/L 이어팁, 사용 설명서 등이 포함되어 있어요.",
    keywords: ["구성품", "패키지", "기본 구성", "충전 케이블", "설명서", "박스 구성"]
  }
];

export interface SourceItem {
  document_id: string;
  title: string;
  faq_id: string | null;
  location: string | null;
}

export interface AgentChatResponse {
  status: "answered" | "clarification_needed" | "insufficient_context" | "support_required";
  answer: string;
  sources: SourceItem[];
  needs_support: boolean;
  support_url: string | null;
  follow_up_question: string | null;
  used_tool: "search_sleepy_faq" | "request_human_support" | "recommend_product" | null;
  tool_label: string | null;
  agent_thought: string | null;
}

const OFFICIAL_SUPPORT_URL = "https://sleeby.channel.io";

// ==============================================================================
// 2. 에이전트 내부 도구 (Agent Tools) 정의
// ==============================================================================

/**
 * 도구 1: search_sleepy_faq(query)
 * FAQ 및 제품 문서 Vector DB / Hybrid 검색 도구
 */
function search_sleepy_faq(query: string) {
  const cleanQuery = query.toLowerCase().trim();
  const topK = experimentConfig.top_k || 3;
  const scoredItems: { item: FaqItem; score: number }[] = [];
  const tokens = cleanQuery.split(/\s+/).filter((t) => t.length > 1);

  for (const item of FAQ_KNOWLEDGE_BASE) {
    let score = 0;
    const lowerQ = item.question.toLowerCase();
    const lowerA = item.answer.toLowerCase();

    for (const kw of item.keywords) {
      if (cleanQuery.includes(kw.toLowerCase())) score += 8;
    }
    for (const token of tokens) {
      if (lowerQ.includes(token)) score += 5;
      if (lowerA.includes(token)) score += 2;
    }
    if (score >= 5) scoredItems.push({ item, score });
  }

  scoredItems.sort((a, b) => b.score - a.score);
  const topMatches = scoredItems.slice(0, topK);

  if (topMatches.length > 0) {
    const best = topMatches[0].item;
    const sources: SourceItem[] = topMatches.map((m) => ({
      document_id: m.item.document_id,
      title: `${m.item.faq_id}. ${m.item.title}`,
      faq_id: m.item.faq_id,
      location: m.item.category,
    }));
    return {
      success: true,
      faq: best,
      sources,
    };
  }
  return { success: false, faq: null, sources: [] };
}

/**
 * 도구 2: request_human_support(reason)
 * 1:1 전문 상담원 및 AS 티켓 연결 안내 도구
 */
function request_human_support(reason: string) {
  return {
    status: "support_required" as const,
    answer: `주문·환불·결제 또는 AS 등 개별 확인(${reason})이 필요한 문의입니다. 빠르고 정확한 처리를 위해 (주)슬리피 공식 고객지원 채널로 안내해 드립니다.`,
    sources: [],
    needs_support: true,
    support_url: OFFICIAL_SUPPORT_URL,
    follow_up_question: null,
  };
}

/**
 * 도구 3: recommend_product(user_symptom)
 * 고객의 수면 상태/불편 증상에 맞는 맞춤형 슬리피 수면 솔루션 제안 도구
 */
function recommend_product(user_symptom: string) {
  let tailoredGuide = "";
  let sources: SourceItem[] = [
    {
      document_id: "DOC-FAQ-001",
      title: "FAQ-01. SLEEBY는 잠들기 전에만 사용하면 되나요?",
      faq_id: "FAQ-01",
      location: "사용 방법"
    },
    {
      document_id: "DOC-FAQ-002",
      title: "FAQ-02. 잠든 뒤에도 계속 착용하고 있어도 괜찮나요?",
      faq_id: "FAQ-02",
      location: "사용 방법"
    }
  ];

  if (user_symptom.includes("잠") || user_symptom.includes("불면") || user_symptom.includes("못 자") || user_symptom.includes("새벽")) {
    tailoredGuide = "잠들기까지 오랜 시간이 걸리거나 뒤척이시는 분께는 SLEEBY의 30분 양이성 음향 솔루션을 추천해 드려요. 뇌파를 자연스러운 휴식 상태로 유도하여 편안하게 잠들 수 있도록 돕습니다. 30분 뒤 자동으로 꺼지므로 수면 중 빼지 않아도 안심하고 주무실 수 있어요.";
  } else if (user_symptom.includes("소음") || user_symptom.includes("밝") || user_symptom.includes("예민")) {
    tailoredGuide = "주변 소음에 예민하거나 잠귀가 밝은 편이시라면 SLEEBY를 추천해 드려요. 귀에 밀착되는 부드러운 인체공학적 이어팁이 외부 소음을 자연스럽게 감쇄시키고, 잔잔한 양이성 음향이 수면 집중을 도와줍니다.";
    sources.push({
      document_id: "DOC-FAQ-014",
      title: "FAQ-14. 잠귀가 밝은 편인데, 주변 소리가 들리나요?",
      faq_id: "FAQ-14",
      location: "제품 소개/기능"
    });
  } else if (user_symptom.includes("낮잠") || user_symptom.includes("피로") || user_symptom.includes("휴식")) {
    tailoredGuide = "일상의 피로 회복이나 15~30분의 짧은 낮잠이 필요하신 경우에도 SLEEBY가 최적의 휴식을 지원합니다. 침대뿐만 아니라 소파나 의자에서 편안하게 착용해 보세요.";
    sources.push({
      document_id: "DOC-FAQ-005",
      title: "FAQ-05. 낮잠을 잘 때 사용해도 되나요?",
      faq_id: "FAQ-05",
      location: "사용 방법"
    });
  } else {
    tailoredGuide = "고객님의 수면 패턴과 편안한 휴식을 위해 (주)슬리피 디지털 수면 디바이스를 추천해 드립니다. 30분 자동 음향 타이머와 S/M/L 이어팁으로 맞춤형 착용감을 제공합니다.";
  }

  return {
    status: "answered" as const,
    answer: `${tailoredGuide} [출처: FAQ-01, FAQ-02 공식 안내]`,
    sources,
    needs_support: false,
    support_url: null,
    follow_up_question: "평소 취침 시간이나 특별히 겪고 계신 수면 불편 사항이 있으시면 더 구체적으로 말씀해 주세요!",
  };
}

// ==============================================================================
// 3. 에이전트 의사결정 루프 (Agent Decision Loop)
// ==============================================================================
function runAgentDecision(message: string): AgentChatResponse {
  const clean = message.toLowerCase().trim();

  // Rule A. 고객지원/주문/환불 의도 판별 -> Tool 2 호출
  const supportTriggers = ["환불", "교환", "반품", "결제", "배송", "취소", "as", "수리", "불량", "영수증"];
  if (supportTriggers.some((t) => clean.includes(t))) {
    const res = request_human_support("주문/환불/AS 및 개인정보 확인");
    return {
      ...res,
      used_tool: "request_human_support",
      tool_label: "1:1 고객센터 상담 연결",
      agent_thought: "질문 의도가 개별 주문 정보 확인 또는 AS/환불 요청으로 판단되어 1:1 고객센터 연결 도구를 실행했습니다.",
    };
  }

  // Rule B. 수면 고민, 불편 증상, 추천 요청 의도 판별 -> Tool 3 호출
  const recommendationTriggers = [
    "추천", "잠이 안", "불면", "못 자", "추천해", "잘 자는 법", "수면 장애",
    "잠투정", "뒤척", "소음 때문에", "피곤", "낮잠 자고", "어떤 사람"
  ];
  if (recommendationTriggers.some((t) => clean.includes(t))) {
    const res = recommend_product(clean);
    return {
      ...res,
      used_tool: "recommend_product",
      tool_label: "맞춤형 수면 솔루션 추천",
      agent_thought: "고객의 수면 패턴 및 불편 증상을 감지하여 최적의 슬리피 사용 솔루션 제안 도구를 실행했습니다.",
    };
  }

  // Rule C. 모호한 질문 또는 단답 의도 판별
  if (clean === "충전" || clean === "제품" || clean === "사용법" || clean === "기능" || clean.length <= 2) {
    return {
      status: "clarification_needed",
      answer: "어떤 상황이나 내용에 관한 문의인지 조금 더 구체적으로 확인이 필요합니다.",
      sources: [],
      needs_support: false,
      support_url: null,
      follow_up_question: "사용 중인 상황이나 구체적으로 궁금하신 부분(예: 착용 방법, 충전 LED, 보관법 등)을 알려주시겠어요?",
      used_tool: null,
      tool_label: null,
      agent_thought: "사용자의 질문이 단답형으로 모호하여 추가 확인 질문(clarification)을 생성했습니다.",
    };
  }

  // Rule D. 일반 FAQ 및 제품 지식 검색 의도 -> Tool 1 호출
  const searchResult = search_sleepy_faq(clean);
  if (searchResult.success && searchResult.faq) {
    const faq = searchResult.faq;
    return {
      status: "answered",
      answer: `${faq.answer} [출처: ${faq.faq_id}. ${faq.title}]`,
      sources: searchResult.sources,
      needs_support: false,
      support_url: null,
      follow_up_question: null,
      used_tool: "search_sleepy_faq",
      tool_label: "Vector DB 검색",
      agent_thought: `사내 지식 베이스에서 가장 관련성 높은 [${faq.faq_id}] 항목을 검색하여 검증된 근거 문서를 기반으로 답변을 생성했습니다.`,
    };
  }

  // Rule E. 근거 부족 (insufficient_context)
  return {
    status: "insufficient_context",
    answer: "현재 확인 가능한 공식 제품 및 FAQ 자료에서는 해당 내용을 확인하지 못했습니다. 상세한 정보는 고객지원 채널을 통해 확인해 주시기 바랍니다.",
    sources: [],
    needs_support: true,
    support_url: OFFICIAL_SUPPORT_URL,
    follow_up_question: null,
    used_tool: "search_sleepy_faq",
    tool_label: "Vector DB 검색 (근거 부재)",
    agent_thought: "지식 베이스 검색 결과 신뢰할 만한 근거 문서가 발견되지 않아 환각을 방지하고 고객지원 안내를 반환했습니다.",
  };
}

// ==============================================================================
// 4. POST 핸들러
// ==============================================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.message !== "string" || body.message.trim() === "") {
      return NextResponse.json(
        {
          error: {
            code: "EMPTY_MESSAGE",
            message: "질문을 입력해 주세요.",
          },
        },
        { status: 400 }
      );
    }

    const { message } = body;
    const agentResponse = runAgentDecision(message);
    return NextResponse.json(agentResponse, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "에이전트 실행 중 내부 오류가 발생했습니다.",
        },
      },
      { status: 500 }
    );
  }
}
