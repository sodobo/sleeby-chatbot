import { NextRequest, NextResponse } from "next/server";
import experimentConfig from "@/scripts/experiment_config.json";

// ==============================================================================
// (주)슬리피 공식 승인 21개 FAQ 지식 베이스
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

export interface ChatResponse {
  status: "answered" | "clarification_needed" | "insufficient_context" | "support_required";
  answer: string;
  sources: SourceItem[];
  needs_support: boolean;
  support_url: string | null;
  follow_up_question: string | null;
}

const OFFICIAL_SUPPORT_URL = "https://sleeby.channel.io";

/**
 * scripts/experiment_config.json 설정을 반영한 지능형 RAG 검색 및 출처 랭킹 엔진
 */
function searchFaq(query: string) {
  const cleanQuery = query.toLowerCase().trim();
  const topK = experimentConfig.top_k || 3;
  const strategy = experimentConfig.search_strategy || "hybrid";

  // 1. 고객지원/상담 필요 (support_required) 키워드
  const supportKeywords = ["환불", "교환", "반품", "결제", "배송", "주문 취소", "as 접수", "수리", "영수증", "불량 교환"];
  if (supportKeywords.some((k) => cleanQuery.includes(k))) {
    return {
      type: "support_required" as const,
      answer: "교환·환불·배송 및 AS 등 개별 주문 정보 확인이 필요한 문의입니다. 신속하고 정확한 처리를 위해 (주)슬리피 공식 고객지원 채널로 문의해 주시기 바랍니다.",
      support_url: OFFICIAL_SUPPORT_URL,
      sources: [] as SourceItem[],
    };
  }

  // 2. 모호한 질문 또는 추가 확인 필요 (clarification_needed)
  if (
    cleanQuery === "제품" ||
    cleanQuery === "사용법" ||
    cleanQuery === "기능" ||
    cleanQuery === "어떻게 써요?" ||
    cleanQuery === "어떻게 써요" ||
    cleanQuery === "궁금해요" ||
    cleanQuery === "충전" ||
    cleanQuery.length <= 2
  ) {
    return {
      type: "clarification_needed" as const,
      answer: "어떤 내용에 관한 문의인지 조금 더 구체적으로 확인이 필요합니다.",
      follow_up_question: "사용 중인 상황이나 구체적으로 궁금하신 부분(예: 착용 방법, 충전 LED, 보관법 등)을 알려주시겠어요?",
      sources: [] as SourceItem[],
    };
  }

  // 3. 실험 파라미터(hybrid/dense/sparse)를 반영한 다중 후보 점수 채점 및 Top-K 추출
  const scoredItems: { item: FaqItem; score: number }[] = [];
  const tokens = cleanQuery.split(/\s+/).filter((t) => t.length > 1);

  for (const item of FAQ_KNOWLEDGE_BASE) {
    let score = 0;
    const lowerQ = item.question.toLowerCase();
    const lowerA = item.answer.toLowerCase();

    // 키워드 일치 점수 (Sparse/BM25 요소)
    let keywordScore = 0;
    for (const kw of item.keywords) {
      if (cleanQuery.includes(kw.toLowerCase())) {
        keywordScore += 8;
      }
    }

    // 질의어 토큰 매칭 점수 (Dense 의미적 유사도 시뮬레이션)
    let tokenScore = 0;
    for (const token of tokens) {
      if (lowerQ.includes(token)) tokenScore += 5;
      if (lowerA.includes(token)) tokenScore += 2;
    }

    if (strategy === "sparse") {
      score = keywordScore * 1.5;
    } else if (strategy === "dense") {
      score = tokenScore * 1.8;
    } else {
      // hybrid (기본 권장)
      score = keywordScore + tokenScore;
    }

    if (score >= 5) {
      scoredItems.push({ item, score });
    }
  }

  // 점수 내림차순 정렬 후 Top-K 추출
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
      type: "answered" as const,
      faq: best,
      sources,
    };
  }

  // 4. 근거 부족 (insufficient_context)
  return {
    type: "insufficient_context" as const,
    answer: "현재 확인 가능한 공식 안내 자료에서는 해당 내용을 확인하지 못했습니다. 상세한 확인이 필요하신 경우 공식 고객지원 채널로 문의해 주세요.",
    sources: [] as SourceItem[],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    // 요청 필드 유효성 검사 (R02 TC-06: 공백 입력 시 400 반환)
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
    const searchResult = searchFaq(message);

    if (searchResult.type === "support_required") {
      const response: ChatResponse = {
        status: "support_required",
        answer: searchResult.answer,
        sources: [],
        needs_support: true,
        support_url: searchResult.support_url || OFFICIAL_SUPPORT_URL,
        follow_up_question: null,
      };
      return NextResponse.json(response, { status: 200 });
    }

    if (searchResult.type === "clarification_needed") {
      const response: ChatResponse = {
        status: "clarification_needed",
        answer: searchResult.answer,
        sources: [],
        needs_support: false,
        support_url: null,
        follow_up_question: searchResult.follow_up_question || null,
      };
      return NextResponse.json(response, { status: 200 });
    }

    if (searchResult.type === "answered" && searchResult.faq) {
      const faq = searchResult.faq;
      // R02_STRICT 지침: 엄격한 경어체 및 출처 태그 포맷 준수
      const response: ChatResponse = {
        status: "answered",
        answer: `${faq.answer} [출처: ${faq.faq_id}. ${faq.title}]`,
        sources: searchResult.sources || [
          {
            document_id: faq.document_id,
            title: `${faq.faq_id}. ${faq.title}`,
            faq_id: faq.faq_id,
            location: faq.category,
          },
        ],
        needs_support: false,
        support_url: null,
        follow_up_question: null,
      };
      return NextResponse.json(response, { status: 200 });
    }

    // insufficient_context
    const response: ChatResponse = {
      status: "insufficient_context",
      answer: searchResult.answer || "현재 확인 가능한 자료에서는 해당 내용을 확인하지 못했습니다. 정확한 안내는 고객지원 채널로 문의해 주세요.",
      sources: [],
      needs_support: true,
      support_url: OFFICIAL_SUPPORT_URL,
      follow_up_question: null,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "서버 내부 처리 중 오류가 발생했습니다.",
        },
      },
      { status: 500 }
    );
  }
}
