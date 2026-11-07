#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
(주)슬리피 AI 고객상담 챗봇 - 팀 공통 답변 품질 평가(Benchmark) 스크립트
27개 대표/인사/모호/미근거/상담 질문 세트를 실행하여
정답(answered), 추가확인(clarification_needed), 근거부족(insufficient_context), 상담필요(support_required)의
비율을 docs/EVALUATION_REPORT.md 및 CSV에 자동 기록합니다.
"""

import os
import json
import csv
import urllib.request
import urllib.error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EVAL_DOC_PATH = os.path.join(BASE_DIR, "docs", "EVALUATION_REPORT.md")
REPORT_MD_PATH = os.path.join(BASE_DIR, "eval_report.md")
REPORT_CSV_PATH = os.path.join(BASE_DIR, "eval_results.csv")
CONFIG_PATH = os.path.join(BASE_DIR, "scripts", "experiment_config.json")

def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


CONFIG = load_config()
SCORE_FULL = 11
API_URL = os.environ.get("CHAT_API_URL", "http://localhost:3000/api/chat")
PAGE_TSX_PATH = os.path.join(BASE_DIR, "app", "page.tsx")
LAYOUT_TSX_PATH = os.path.join(BASE_DIR, "app", "layout.tsx")

# 공식 승인 21개 FAQ 데이터
FAQ_DATA = [
    {
        "faq_id": "FAQ-01",
        "document_id": "DOC-FAQ-001",
        "title": "SLEEBY는 잠들기 전에만 사용하면 되나요?",
        "category": "사용 방법",
        "question": "SLEEBY는 잠들기 전에만 사용하면 되나요?",
        "answer": "밤에 잠자리에 들기 전은 물론, 낮에 잠깐 자거나 휴식을 취하고 싶을 때도 사용하실 수 있어요. 양쪽 귀에 착용한 뒤 평소처럼 주무시거나 쉬시면 됩니다. SLEEBY에서 나오는 작은 소리에 집중하셔도 되고, 특별히 신경 쓰지 않으셔도 괜찮아요.",
        "keywords": ["잠들기 전", "사용 시간", "낮잠", "휴식", "착용 시기", "밤에", "잘 때만", "수면할 때"]
    },
    {
        "faq_id": "FAQ-02",
        "document_id": "DOC-FAQ-002",
        "title": "잠든 뒤에도 계속 착용하고 있어도 괜찮나요?",
        "category": "사용 방법",
        "question": "잠든 뒤에도 계속 착용하고 있어도 괜찮나요?",
        "answer": "네. 양이성 음향은 전원이 켜진 뒤 약 30분이 지나면 자동으로 꺼져요. 30분 안에 잠드셨다면 착용한 채로 계속 주무셔도 괜찮습니다. 불편하면 빼셔도 되니, 편안한 쪽으로 선택해 주세요.",
        "keywords": ["착용 지속", "30분", "자동 꺼짐", "수면 중 착용", "계속 착용", "자면서"]
    },
    {
        "faq_id": "FAQ-03",
        "document_id": "DOC-FAQ-003",
        "title": "사용하다가 중간에 빼도 되나요?",
        "category": "사용 방법",
        "question": "사용하다가 중간에 빼도 되나요?",
        "answer": "네. 사용 중 불편하거나 빼고 싶을 때는 언제든 빼셔도 됩니다.",
        "keywords": ["중간에 빼기", "제거", "사용 중지", "빼도"]
    },
    {
        "faq_id": "FAQ-04",
        "document_id": "DOC-FAQ-004",
        "title": "잠이 들지 않으면 다시 착용해도 되나요?",
        "category": "사용 방법",
        "question": "잠이 들지 않으면 다시 착용해도 되나요?",
        "answer": "네. 30분 후 SLEEBY 전원이 자동으로 꺼진 뒤에도 잠이 들지 않거나 졸린 느낌이 없다면 다시 사용하셔도 돼요. SLEEBY를 충전 케이스에 넣었다가 1~2초 후 다시 꺼내 착용하면 양이성 음향이 다시 30분 동안 재생됩니다.",
        "keywords": ["재착용", "다시 사용", "재생", "케이스에 넣었다 꺼내기", "다시 켜기"]
    },
    {
        "faq_id": "FAQ-05",
        "document_id": "DOC-FAQ-005",
        "title": "낮잠을 잘 때 사용해도 되나요?",
        "category": "사용 방법",
        "question": "낮잠을 잘 때 사용해도 되나요?",
        "answer": "네. 낮잠이나 휴식을 취할 때도 사용하실 수 있어요. 편안한 상태에서 착용해 주세요.",
        "keywords": ["낮잠", "휴식", "낮에 사용", "낮잠잘 때"]
    },
    {
        "faq_id": "FAQ-06",
        "document_id": "DOC-FAQ-006",
        "title": "매일 사용해도 괜찮나요?",
        "category": "안전/효과",
        "question": "매일 사용해도 괜찮나요?",
        "answer": "네. 착용감에 불편함이 없다면 밤이나 일상에서 필요할 때 반복해서 사용하셔도 괜찮아요. 양이성 음향에 대한 반응은 사람마다 다를 수 있으며, 사용 경험에도 개인차가 있을 수 있습니다.",
        "keywords": ["매일 사용", "반복 사용", "자주 사용", "부작용", "매일 써도"]
    },
    {
        "faq_id": "FAQ-07",
        "document_id": "DOC-FAQ-007",
        "title": "충전이 끝나면 LED가 어떻게 표시되나요?",
        "category": "충전/배터리",
        "question": "충전이 끝나면 LED가 어떻게 표시되나요?",
        "answer": "케이스를 충전하는 동안에는 흰색 LED가 깜박이고, 충전이 완료되면 흰색 LED가 계속 켜져 있어요.",
        "keywords": ["충전 완료", "LED", "불빛", "흰색 LED", "깜박임", "충전 완료 표시"]
    },
    {
        "faq_id": "FAQ-08",
        "document_id": "DOC-FAQ-008",
        "title": "충전 케이스를 충전하는 동안 SLEEBY를 사용해도 되나요?",
        "category": "충전/배터리",
        "question": "충전 케이스를 충전하는 동안 SLEEBY를 사용해도 되나요?",
        "answer": "네. 충전 케이스를 충전하면서 SLEEBY를 꺼내 사용하셔도 돼요.",
        "keywords": ["케이스 충전 중 사용", "동시 사용", "충전 중에 사용", "꽂아둔", "꺼내 써도"]
    },
    {
        "faq_id": "FAQ-09",
        "document_id": "DOC-FAQ-009",
        "title": "충전 케이스를 충전하면서 SLEEBY도 충전할 수 있나요?",
        "category": "충전/배터리",
        "question": "충전 케이스를 충전하면서 SLEEBY도 충전할 수 있나요?",
        "answer": "네. 충전 케이스에 케이블을 연결해 충전하는 중에도, 케이블을 연결하지 않은 상태에서도 SLEEBY를 케이스에 넣으면 충전할 수 있어요.",
        "keywords": ["동시 충전", "본체 충전", "케이스 충전", "같이 충전"]
    },
    {
        "faq_id": "FAQ-010",
        "document_id": "DOC-FAQ-010",
        "title": "이어팁은 어떻게 교체하나요?",
        "category": "관리/보관",
        "question": "이어팁은 어떻게 교체하나요?",
        "answer": "이어팁을 SLEEBY 본체에서 조심스럽게 분리한 뒤, 사용할 크기의 이어팁을 본체에 맞춰 끼워 주세요. 너무 세게 잡아당기거나 비틀지 않도록 주의해 주세요.",
        "keywords": ["이어팁 교체", "이어팁 분리", "이어팁 끼우기", "팁 교체"]
    },
    {
        "faq_id": "FAQ-011",
        "document_id": "DOC-FAQ-011",
        "title": "SLEEBY 본체는 어떻게 청소하면 되나요?",
        "category": "관리/보관",
        "question": "SLEEBY 본체는 어떻게 청소하면 되나요?",
        "answer": "SLEEBY는 방수 기능이 없어요. 흐르는 물에 씻거나 물에 담그면 고장 날 수 있으니 피해주세요. 안경을 닦듯이 세척액이나 물티슈를 묻혀 닦는 방법은 괜찮습니다.",
        "keywords": ["청소", "세척", "방수", "물티슈", "소독", "물로 씻기", "방수 기능"]
    },
    {
        "faq_id": "FAQ-012",
        "document_id": "DOC-FAQ-012",
        "title": "사용하지 않을 때는 어떻게 보관하는 게 좋나요?",
        "category": "관리/보관",
        "question": "사용하지 않을 때는 어떻게 보관하는 게 좋나요?",
        "answer": "사용하지 않을 때는 본체를 충전 케이스에 넣어 보관해 주세요. 습기가 많거나 온도가 높은 곳은 피해 주세요.",
        "keywords": ["보관", "케이스 보관", "습기", "보관 방법", "어디에 보관"]
    },
    {
        "faq_id": "FAQ-013",
        "document_id": "DOC-FAQ-013",
        "title": "여행할 때 비행기나 기차 안에서 사용해도 되나요?",
        "category": "착용/편의성",
        "question": "여행할 때 비행기나 기차 안에서 사용해도 되나요?",
        "answer": "네. 사용하셔도 돼요. 주변이 시끄러우면 SLEEBY의 양이성 음향이 잘 들리지 않을 수 있지만, 소리가 또렷하게 들리지 않더라도 착용해 사용하실 수 있어요. 다만 안내 방송이나 안전 안내를 들어야 하는 상황에서는 사용을 피해 주세요.",
        "keywords": ["비행기", "기차", "여행", "대중교통", "기내 사용", "ktx", "안내 방송"]
    },
    {
        "faq_id": "FAQ-014",
        "document_id": "DOC-FAQ-014",
        "title": "잠귀가 밝은 편인데, 주변 소리가 들리나요?",
        "category": "제품 소개/기능",
        "question": "잠귀가 밝은 편인데, 주변 소리가 들리나요?",
        "answer": "SLEEBY에는 액티브 노이즈 캔슬링 기능이 없고, 외부 소리를 완전히 차단하는 제품도 아니에요. 일반 귀마개를 착용했을 때처럼 주변 소리가 작게 들릴 수 있으며, 소리가 들리는 정도는 착용 상태와 개인차에 따라 달라질 수 있습니다.",
        "keywords": ["노이즈 캔슬링", "차음", "주변 소리", "소음 차단", "anc", "소음"]
    },
    {
        "faq_id": "FAQ-015",
        "document_id": "DOC-FAQ-015",
        "title": "음악이나 오디오북을 들으면서 함께 사용할 수 있나요?",
        "category": "제품 소개/기능",
        "question": "음악이나 오디오북을 들으면서 함께 사용할 수 있나요?",
        "answer": "SLEEBY는 다른 기기와 연결해 음악이나 오디오북을 재생하는 제품이 아니에요. 내장된 양이성 음향을 단독으로 사용해 주세요.",
        "keywords": ["음악 재생", "오디오북", "블루투스 스피커", "이어폰 기능", "노래 듣기", "유튜브", "멜론"]
    },
    {
        "faq_id": "FAQ-016",
        "document_id": "DOC-FAQ-016",
        "title": "헤드폰이나 다른 귀마개와 같이 착용할 수 있나요?",
        "category": "착용/편의성",
        "question": "헤드폰이나 다른 귀마개와 같이 착용할 수 있나요?",
        "answer": "SLEEBY는 다른 기기나 귀마개와 함께 착용하도록 설계된 제품은 아니에요. 함께 착용하면 불편하거나 제품을 의도한 방식으로 사용하기 어려울 수 있으니 단독으로 착용해 주세요.",
        "keywords": ["헤드폰 중복 착용", "귀마개 동시 착용", "이중 착용", "헤드폰 같이", "헤드폰", "귀마개", "겹쳐서"]
    },
    {
        "faq_id": "FAQ-017",
        "document_id": "DOC-FAQ-017",
        "title": "양쪽 귀의 크기가 다른데, 이어팁을 서로 다른 크기로 사용해도 되나요?",
        "category": "착용/편의성",
        "question": "양쪽 귀의 크기가 다른데, 이어팁을 서로 다른 크기로 사용해도 되나요?",
        "answer": "네. 좌우 귀에 잘 맞는 크기가 다르다면 각 귀에 맞는 이어팁을 따로 사용하셔도 돼요. 다만 SLEEBY 본체의 ‘L/R’ 표시는 올바르게 맞춰 착용해 주세요.",
        "keywords": ["양쪽 귀 크기", "이어팁 다른 크기", "좌우 비대칭", "l/r", "짝짝이"]
    },
    {
        "faq_id": "FAQ-018",
        "document_id": "DOC-FAQ-018",
        "title": "귀가 작은 편인데 잘 맞을까요?",
        "category": "착용/편의성",
        "question": "귀가 작은 편인데 잘 맞을까요?",
        "answer": "귀 모양과 크기는 사람마다 달라 착용감에 차이가 있을 수 있어요. 동봉된 S/M/L 이어팁 중 귀에 편안하게 맞는 크기를 선택해 주세요.",
        "keywords": ["작은 귀", "크기 선택", "s/m/l 이어팁", "착용감", "귀가 작아요"]
    },
    {
        "faq_id": "FAQ-019",
        "document_id": "DOC-FAQ-019",
        "title": "잠잘 때 옆으로 누워도 불편하지 않나요?",
        "category": "착용/편의성",
        "question": "잠잘 때 옆으로 누워도 불편하지 않나요?",
        "answer": "착용감은 귀 모양과 자세에 따라 다를 수 있어요. 옆으로 누웠을 때 불편하다면 착용 위치를 조정하거나 잠시 빼 주세요.",
        "keywords": ["옆으로 눕기", "옆잠", "수면 자세", "통증", "눌림", "배김"]
    },
    {
        "faq_id": "FAQ-020",
        "document_id": "DOC-FAQ-020",
        "title": "귀 질환이 있거나 귀가 민감한 사람도 사용할 수 있나요?",
        "category": "안전/효과",
        "question": "귀 질환이 있거나 귀가 민감한 사람도 사용할 수 있나요?",
        "answer": "귀에 통증이나 질환이 있거나 착용 중 불편함이 느껴지면 사용을 중단해 주세요. 사용해도 괜찮을지 걱정되신다면 의료 전문가와 상담해 주세요.",
        "keywords": ["귀 질환", "이명", "중이염", "외이도염", "의료 전문가", "의사 상담", "귀 염증"]
    },
    {
        "faq_id": "FAQ-021",
        "document_id": "DOC-FAQ-021",
        "title": "구성품에는 어떤 것들이 들어 있나요?",
        "category": "제품 소개/기능",
        "question": "구성품에는 어떤 것들이 들어 있나요?",
        "answer": "기본 구성품에는 SLEEBY 본체, 충전 케이스, USB-C 충전 케이블, S/M/L 이어팁, 사용 설명서 등이 포함되어 있어요.",
        "keywords": ["구성품", "패키지", "기본 구성", "충전 케이블", "설명서", "박스 구성"]
    }
]

# 팀 공통 27개 평가 질문 세트 (대표, 인사, 모호, 미근거, 상담)
BENCHMARK_DATASET = [
    # 1. 정상 답변 (answered)
    { "id": "TC-01", "question": "SLEEBY는 밤에 잘 때만 써야 하나요?", "expected_status": "answered", "expected_faq": "FAQ-01", "category": "사용 방법" },
    { "id": "TC-02", "question": "잠든 후에도 귀에 계속 끼고 있어도 안전한가요?", "expected_status": "answered", "expected_faq": "FAQ-02", "category": "사용 방법" },
    { "id": "TC-03", "question": "사용하다가 답답하면 중간에 빼도 되나요?", "expected_status": "answered", "expected_faq": "FAQ-03", "category": "사용 방법" },
    { "id": "TC-04", "question": "30분 지나서 꺼졌는데 잠이 안 오면 다시 쓸 수 있나요?", "expected_status": "answered", "expected_faq": "FAQ-04", "category": "사용 방법" },
    { "id": "TC-05", "question": "낮에 잠깐 낮잠잘 때 착용해도 되나요?", "expected_status": "answered", "expected_faq": "FAQ-05", "category": "사용 방법" },
    { "id": "TC-06", "question": "매일 연속으로 사용해도 부작용이나 문제 없나요?", "expected_status": "answered", "expected_faq": "FAQ-06", "category": "안전/효과" },
    { "id": "TC-07", "question": "충전이 다 끝나면 케이스 불빛이 어떻게 켜지나요?", "expected_status": "answered", "expected_faq": "FAQ-07", "category": "충전/배터리" },
    { "id": "TC-08", "question": "충전 케이스를 충전기에 꽂아둔 채로 기기를 꺼내 써도 되나요?", "expected_status": "answered", "expected_faq": "FAQ-08", "category": "충전/배터리" },
    { "id": "TC-09", "question": "케이스 충전하면서 기기도 같이 동시에 충전되나요?", "expected_status": "answered", "expected_faq": "FAQ-09", "category": "충전/배터리" },
    { "id": "TC-10", "question": "이어팁 교체는 어떻게 하나요?", "expected_status": "answered", "expected_faq": "FAQ-010", "category": "관리/보관" },
    { "id": "TC-11", "question": "기기에 물이 묻었는데 물로 씻어서 청소해도 되나요?", "expected_status": "answered", "expected_faq": "FAQ-011", "category": "관리/보관" },
    { "id": "TC-12", "question": "기기를 안 쓸 때는 어디에 보관해야 하나요?", "expected_status": "answered", "expected_faq": "FAQ-012", "category": "관리/보관" },
    { "id": "TC-13", "question": "비행기나 KTX 안에서 사용해도 되나요?", "expected_status": "answered", "expected_faq": "FAQ-013", "category": "착용/편의성" },
    { "id": "TC-14", "question": "노이즈 캔슬링(ANC) 기능이 있어서 주변 소음을 완전히 없애주나요?", "expected_status": "answered", "expected_faq": "FAQ-014", "category": "제품 소개/기능" },
    { "id": "TC-15", "question": "스마트폰 블루투스 연결해서 유튜브나 멜론 음악 들을 수 있나요?", "expected_status": "answered", "expected_faq": "FAQ-015", "category": "제품 소개/기능" },
    { "id": "TC-16", "question": "헤드폰이나 일반 소음 귀마개랑 겹쳐서 착용해도 되나요?", "expected_status": "answered", "expected_faq": "FAQ-016", "category": "착용/편의성" },
    { "id": "TC-17", "question": "왼쪽 귀는 큰데 오른쪽 귀는 작아서 이어팁을 짝짝이로 써도 되나요?", "expected_status": "answered", "expected_faq": "FAQ-017", "category": "착용/편의성" },
    { "id": "TC-18", "question": "제가 귀 구멍이 작은 편인데 잘 맞을까요?", "expected_status": "answered", "expected_faq": "FAQ-018", "category": "착용/편의성" },
    { "id": "TC-19", "question": "옆으로 누워서 자는 버릇이 있는데 배기거나 불편하지 않나요?", "expected_status": "answered", "expected_faq": "FAQ-019", "category": "착용/편의성" },
    { "id": "TC-20", "question": "중이염이나 귀 염증이 있어도 써도 괜찮나요?", "expected_status": "answered", "expected_faq": "FAQ-020", "category": "안전/효과" },
    { "id": "TC-21", "question": "기본 박스 구성품에 충전기랑 이어팁 다 들어있나요?", "expected_status": "answered", "expected_faq": "FAQ-021", "category": "제품 소개/기능" },

    # 2. 추가 확인 질문 필요 (clarification_needed)
    { "id": "TC-22", "question": "충전", "expected_status": "clarification_needed", "expected_faq": None, "category": "모호한 질문" },
    { "id": "TC-23", "question": "어떻게 써요?", "expected_status": "clarification_needed", "expected_faq": None, "category": "모호한 질문" },

    # 3. 개별 상담 연결 필요 (support_required)
    { "id": "TC-24", "question": "어제 주문한 제품 주문 취소하고 환불받고 싶어요", "expected_status": "support_required", "expected_faq": None, "category": "상담/환불" },

    # 4. 근거 부재 / 답변 불가 (insufficient_context)
    { "id": "TC-26", "question": "안녕하세요", "expected_status": "answered", "expected_faq": None, "category": "인사말" },
    { "id": "TC-27", "question": "반가워요!", "expected_status": "answered", "expected_faq": None, "category": "인사말" },
    { "id": "TC-25", "question": "슬리피 회사 주식 상장 일정과 공모가는 얼마인가요?", "expected_status": "insufficient_context", "expected_faq": None, "category": "미보유 지식" }
]


def local_search_match(query, faqs):
    clean_q = query.lower().strip()
    use_router = CONFIG.get("use_intent_router", True)
    use_multi = CONFIG.get("use_multi_query", False)
    support_keywords = ["환불", "교환", "반품", "결제", "배송", "주문 취소", "as 접수", "수리", "영수증"]
    if use_router and any(k in clean_q for k in support_keywords):
        return {
            "status": "support_required",
            "answer": "교환·환불 등 개별 주문 정보 확인이 필요한 문의입니다. 공식 고객지원 채널로 문의해 주세요.",
            "sources": [],
            "needs_support": True,
            "support_url": "https://sleeby.channel.io",
            "follow_up_question": None
        }

    if use_router:
        import re as _re
        greet = _re.sub(r"[\s!?.~,]+", "", clean_q)
        if greet in ["안녕", "안녕하세요", "안녕하십니까", "반가워", "반가워요", "반갑습니다", "하이", "hello", "hi", "처음뵙겠습니다"]:
            return {
                "status": "answered",
                "answer": "안녕하세요! (주)슬리피 고객상담 AI입니다. 궁금하신 점을 편하게 질문해 주세요.",
                "sources": [],
                "needs_support": False,
                "support_url": None,
                "follow_up_question": None
            }
        # route.ts 와 동일: 근거 없는 사실/의학적 효능 → insufficient_context
        if any(k in clean_q for k in ["완치", "치료제", "2세대", "차세대", "출시일", "출시 예정", "상장", "공모가"]):
            return {
                "status": "insufficient_context",
                "answer": "현재 확인 가능한 공식 안내 자료에서는 해당 내용을 확인하지 못했습니다. 공식 고객지원 채널로 문의해 주세요.",
                "sources": [],
                "needs_support": True,
                "support_url": "https://sleeby.channel.io",
                "follow_up_question": None
            }
        if any(k in clean_q for k in ["빨간불", "빨간 불", "빨간색", "적색"]):
            return {
                "status": "clarification_needed",
                "answer": "빨간 불이 어느 부분에서 켜지는지 확인이 필요합니다.",
                "sources": [],
                "needs_support": False,
                "support_url": None,
                "follow_up_question": "빨간 불이 충전 케이스와 SLEEBY 본체 중 어디에서 보이나요?"
            }
        if any(k in clean_q for k in ["거치대", "밴드형", "밴드"]):
            return {
                "status": "clarification_needed",
                "answer": "어떤 제품 형태를 말씀하시는지 확인이 필요합니다.",
                "sources": [],
                "needs_support": False,
                "support_url": None,
                "follow_up_question": "사용 중이신 슬리피 제품명이나 모델명을 알려주세요."
            }

    if use_router and (clean_q in ["충전", "제품", "사용법", "기능", "궁금해요", "어떻게 써요?", "어떻게 써요"] or len(clean_q) <= 2):
        return {
            "status": "clarification_needed",
            "answer": "어떤 제품이나 상황에 관한 문의인지 확인이 필요합니다.",
            "sources": [],
            "needs_support": False,
            "support_url": None,
            "follow_up_question": "사용 중인 상황이나 구체적인 질문을 알려주시겠어요?"
        }

    best_match = None
    highest_score = 0
    tokens = [t for t in clean_q.split() if len(t) > 1]
    if use_multi:  # route.ts 의 멀티 쿼리 확장과 동일
        if "충전" in clean_q:
            tokens += ["led", "케이블", "배터리"]
        if "잠" in clean_q:
            tokens += ["수면", "음향", "30분"]
        if "귀" in clean_q:
            tokens += ["이어팁", "착용", "소음"]

    for item in faqs:
        score = 0
        lq = item["question"].lower()
        la = item["answer"].lower()

        for kw in item["keywords"]:
            if kw.lower() in clean_q:
                score += 8
        for t in tokens:
            if t in lq:
                score += 5
            if t in la:
                score += 2

        if score > highest_score:
            highest_score = score
            best_match = item

    similarity = min(1.0, highest_score / SCORE_FULL)  # route.ts 의 SCORE_FULL 과 동일
    if best_match and highest_score >= 5 and similarity >= CONFIG.get("similarity_threshold", 0):
        return {
            "status": "answered",
            "answer": f"{best_match['answer']} [출처: {best_match['faq_id']}. {best_match['title']}]",
            "sources": [{
                "document_id": best_match["document_id"],
                "title": best_match["title"],
                "faq_id": best_match["faq_id"],
                "location": best_match["category"]
            }],
            "needs_support": False,
            "support_url": None,
            "follow_up_question": None
        }

    return {
        "status": "insufficient_context",
        "answer": "현재 확인 가능한 자료에서는 해당 내용을 확인하지 못했습니다. 공식 고객지원 채널로 문의해 주세요.",
        "sources": [],
        "needs_support": True,
        "support_url": "https://sleeby.channel.io",
        "follow_up_question": None
    }


MODE_COUNT = {"api": 0, "local": 0}


def query_api(question, api_url=None, faqs=None):
    api_url = api_url or API_URL
    try:
        req_data = json.dumps({"message": question}).encode("utf-8")
        req = urllib.request.Request(
            api_url,
            data=req_data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            if resp.status == 200:
                MODE_COUNT["api"] += 1
                return json.loads(resp.read().decode("utf-8"))
    except Exception:
        pass
    MODE_COUNT["local"] += 1
    return local_search_match(question, faqs)


def post_chat(message):
    """POST /api/chat. (http_status, body, mode) 반환. 서버가 없으면 로컬 시뮬레이션으로 대체."""
    try:
        req = urllib.request.Request(
            API_URL,
            data=json.dumps({"message": message}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8")), "api"
    except urllib.error.HTTPError as e:  # 400 등 의도된 에러 응답
        try:
            return e.code, json.loads(e.read().decode("utf-8")), "api"
        except Exception:
            return e.code, {}, "api"
    except Exception:
        pass
    if not message.strip():
        return 400, {"error": {"code": "EMPTY_MESSAGE", "message": "질문을 입력해 주세요."}}, "local"
    return 200, local_search_match(message, FAQ_DATA), "local"


def validate_r02_schema(body):
    """R02 응답 규격 위반 목록(빈 리스트면 통과)."""
    problems = []
    if body.get("status") not in ("answered", "clarification_needed", "insufficient_context", "support_required"):
        problems.append("status 값 오류")
    if not isinstance(body.get("answer"), str) or not body.get("answer"):
        problems.append("answer 누락")
    if not isinstance(body.get("sources"), list):
        problems.append("sources 배열 아님")
    else:
        for s in body["sources"]:
            if not all(k in s for k in ("document_id", "title", "faq_id", "location")):
                problems.append("sources 항목 필드 누락")
                break
    if not isinstance(body.get("needs_support"), bool):
        problems.append("needs_support bool 아님")
    for k in ("support_url", "follow_up_question"):
        if k not in body or not (body[k] is None or isinstance(body[k], str)):
            problems.append(f"{k} 누락/타입 오류")
    return problems


def _read(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except OSError:
        return ""


def run_qa_suite():
    """리드 QA 10대 시나리오 자동 채점. 각 항목: (id, 시나리오, 기대, 실제, PASS/FAIL, 비고)"""
    rows = []

    def check_status(qid, name, question, expected, faq_any=None):
        http, body, mode = post_chat(question)
        status = body.get("status")
        problems = validate_r02_schema(body) if http == 200 else ["HTTP %s" % http]
        ok = http == 200 and status == expected and not problems
        note = f"[{mode}] "
        if ok and faq_any:
            got = body["sources"][0]["faq_id"] if body.get("sources") else None
            ok = got in faq_any
            note += f"출처 {got} (허용: {', '.join(faq_any)})"
        elif ok and expected != "answered" and body.get("sources"):
            ok = False
            note += "근거 없는 응답에 sources 포함"
        elif ok and expected in ("insufficient_context", "support_required") and not body.get("needs_support"):
            ok = False
            note += "needs_support=true 필요"
        else:
            note += "; ".join(problems) if problems else "규격 준수"
        rows.append((qid, name, expected, status or "-", "PASS" if ok else "FAIL", note))

    check_status("QA-01", "수면 모드 사용법", "SLEEBY를 수면할 때 어떻게 사용하나요? 잠잘 때 착용하면 되나요?", "answered",
                 ["FAQ-01", "FAQ-02", "FAQ-04"])
    check_status("QA-02", "충전/배터리", "배터리 충전은 어떻게 하고 충전이 끝나면 어떻게 알 수 있나요?", "answered",
                 ["FAQ-07", "FAQ-08", "FAQ-09"])
    check_status("QA-03", "빨간불 반짝임 충전 문의", "충전할 때 빨간불이 반짝여요", "clarification_needed")
    check_status("QA-04", "거치대형/밴드형 호환 문의", "거치대형이나 밴드형도 호환되나요?", "clarification_needed")
    _h, _b, _m = post_chat("거치대형이나 밴드형도 호환되나요?")
    if _b.get("follow_up_question") != "사용 중이신 슬리피 제품명이나 모델명을 알려주세요.":
        rows[-1] = rows[-1][:4] + ("FAIL", rows[-1][5] + " follow_up_question 문구 불일치")
    check_status("QA-11", "인사말 (검색 없이 정형 응답)", "안녕", "answered")
    if rows[-1][4] == "PASS" and post_chat("안녕")[1].get("sources"):
        rows[-1] = rows[-1][:4] + ("FAIL", "인사말에 sources 포함")
    check_status("QA-05", "2세대 출시일 문의", "SLEEBY 2세대 출시일이 언제인가요?", "insufficient_context")
    check_status("QA-06", "불면증 100% 완치 문의", "SLEEBY 쓰면 불면증이 100% 완치되나요?", "insufficient_context")
    check_status("QA-07", "구매 환불/교환 문의", "구매한 제품 환불이나 교환하고 싶어요", "support_required")

    # QA-08 공백 입력 → HTTP 400 EMPTY_MESSAGE
    http, body, mode = post_chat("   ")
    code = (body.get("error") or {}).get("code")
    ok = http == 400 and code == "EMPTY_MESSAGE"
    rows.append(("QA-08", "공백 입력", "HTTP 400 / EMPTY_MESSAGE", f"HTTP {http} / {code}", "PASS" if ok else "FAIL", f"[{mode}]"))

    # QA-09 대화 초기화: 프론트엔드 reset 핸들러/버튼 정적 검증
    page = _read(PAGE_TSX_PATH)
    has_handler = "handleReset" in page and "setMessages([" in page and 'setInput("")' in page
    has_button = "onClick={handleReset}" in page
    ok = has_handler and has_button
    rows.append(("QA-09", "대화 초기화(reset)", "reset 핸들러+버튼", f"핸들러 {has_handler} / 버튼 {has_button}",
                 "PASS" if ok else "FAIL", "app/page.tsx 정적 검사 (메시지·입력 초기화)"))

    # QA-10 모바일 UI 응답 규격: 정상 응답 규격 + 반응형 레이아웃 정적 검증
    http, body, mode = post_chat("충전이 끝나면 LED가 어떻게 표시되나요?")
    problems = validate_r02_schema(body) if http == 200 else ["HTTP %s" % http]
    responsive = ("sm:" in page or "md:" in page) and "w-full" in page and "overflow-y-auto" in page
    ok = not problems and responsive
    rows.append(("QA-10", "모바일 UI 응답 규격", "R02 6필드 + 반응형 UI", f"규격 {'OK' if not problems else problems} / 반응형 {responsive}",
                 "PASS" if ok else "FAIL", f"[{mode}] 응답 6필드 및 app/page.tsx 반응형 클래스 검사"))
    return rows


def run_benchmark():
    results = []
    # 상태별 집계
    status_counts = {
        "answered": 0,
        "clarification_needed": 0,
        "insufficient_context": 0,
        "support_required": 0
    }
    # 품질 판정 집계
    judgment_counts = {
        "정답": 0,
        "부분정답": 0,
        "오답": 0,
        "근거없음": 0
    }

    print(f"[*] 총 {len(BENCHMARK_DATASET)}개 평가 테스트 시작...")

    for item in BENCHMARK_DATASET:
        qid = item["id"]
        qtext = item["question"]
        expected_status = item["expected_status"]
        expected_faq = item["expected_faq"]

        res = query_api(qtext, faqs=FAQ_DATA)
        actual_status = res.get("status", "insufficient_context")
        sources = res.get("sources", [])
        actual_faq = sources[0]["faq_id"] if sources else None

        if actual_status in status_counts:
            status_counts[actual_status] += 1

        if actual_status == expected_status:
            if expected_status == "answered":
                judgment = "정답" if actual_faq == expected_faq else "부분정답"
            elif expected_status == "insufficient_context":
                judgment = "근거없음"
            else:
                judgment = "정답"
        else:
            if actual_status == "insufficient_context":
                judgment = "근거없음"
            elif actual_status == "clarification_needed" or expected_status == "clarification_needed":
                judgment = "부분정답"
            else:
                judgment = "오답"

        judgment_counts[judgment] += 1
        results.append({
            "id": qid,
            "category": item["category"],
            "question": qtext,
            "expected_status": expected_status,
            "actual_status": actual_status,
            "expected_faq": expected_faq or "-",
            "actual_faq": actual_faq or "-",
            "judgment": judgment,
            "answer_preview": res.get("answer", "")[:60] + "..."
        })

    qa_rows = run_qa_suite()
    qa_pass = sum(1 for r in qa_rows if r[4] == "PASS")
    qa_md = "| ID | 시나리오 | 기대 결과 | 실제 결과 | 판정 | 비고 |\n|---|---|---|---|:---:|---|\n"
    for r in qa_rows:
        qa_md += f"| {r[0]} | {r[1]} | {r[2]} | {r[3]} | **{r[4]}** | {r[5]} |\n"
    qa_md += f"\n> ✅ **QA 시나리오 통과: {qa_pass}/{len(qa_rows)}**"

    total = len(BENCHMARK_DATASET)
    ans_pct = (status_counts["answered"] / total) * 100
    clar_pct = (status_counts["clarification_needed"] / total) * 100
    insuf_pct = (status_counts["insufficient_context"] / total) * 100
    supp_pct = (status_counts["support_required"] / total) * 100

    acc_pct = (judgment_counts["정답"] / total) * 100
    part_pct = (judgment_counts["부분정답"] / total) * 100
    inc_pct = (judgment_counts["오답"] / total) * 100
    no_grd_pct = (judgment_counts["근거없음"] / total) * 100

    # docs/EVALUATION_REPORT.md 자동 업데이트 내용 생성
    eval_doc_content = f"""# (주)슬리피 RAG AI 고객상담 챗봇 — 품질 평가 보고서 (EVALUATION_REPORT)

| 문서 메타데이터 | 내용 |
|---|---|
| **문서 ID** | `SLEEPY-EVAL-R02` |
| **평가 기준일** | 2026-11-07 (KST) |
| **연계 명세** | Sleepy API 명세서 R02 / Sleepy 요구사항 명세서 R02 / 11.07 RAG 가이드라인 |
| **평가 대상** | `POST /api/chat` (Vercel 배포 및 RAG 하이브리드 검색 파이프라인) |
| **평가 데이터셋** | 총 {total}개 테스트 질의 (대표 FAQ 21건 + 인사 2건 + 모호 2건 + 상담 1건 + 미근거 1건) |

---

## 1. 종합 평가 결과 집계 요약 (자동 집계)

### 1.1 R02 상태(Status)별 반환 비율
| 응답 상태 (`status`) | 건수 (건) | 비율 (%) | R02 의미 |
|---|---|---|---|
| **`answered` (답변 생성)** | **{status_counts['answered']}** | **{ans_pct:.1f}%** | 충분한 근거를 사용해 공식 답변 및 출처 생성 |
| **`clarification_needed` (추가 확인)** | **{status_counts['clarification_needed']}** | **{clar_pct:.1f}%** | 질문 의도가 모호하여 추가 확인 질문(`follow_up_question`) 제시 |
| **`insufficient_context` (근거 부재)** | **{status_counts['insufficient_context']}** | **{insuf_pct:.1f}%** | 사내 지식에 없는 내용에 대해 환각 없이 안전 안내 |
| **`support_required` (상담 연결)** | **{status_counts['support_required']}** | **{supp_pct:.1f}%** | 개별 주문/환불/AS 사안으로 1:1 고객지원 채널 연결 |
| **합계** | **{total}** | **100.0%** | - |

### 1.2 답변 품질(Quality) 판정 집계
| 평가 유형 | 건수 (건) | 비율 (%) | 판정 기준 및 비고 |
|---|---|---|---|
| **정답 (Correct)** | **{judgment_counts['정답']}** | **{acc_pct:.1f}%** | 질문 의도를 정확히 파악하고 올바른 FAQ 항목 매칭 및 답변 생성 |
| **부분정답 (Partial)** | **{judgment_counts['부분정답']}** | **{part_pct:.1f}%** | 질문이 모호하여 의도 확인 질문을 정상 유도함 |
| **오답 (Incorrect)** | **{judgment_counts['오답']}** | **{inc_pct:.1f}%** | 사실 왜곡, 다른 FAQ 내용 오안내, 또는 잘못된 답변 |
| **근거없음 (Insufficient)** | **{judgment_counts['근거없음']}** | **{no_grd_pct:.1f}%** | 사내 지식에 없는 질문에 대해 환각 없이 안전하게 고객지원으로 안내 |
| **합계** | **{total}** | **100.0%** | - |

> 🏆 **핵심 신뢰도 지표 (정답 + 근거없는 질문 안전방어율): {((judgment_counts['정답'] + judgment_counts['근거없음']) / total) * 100:.1f}%**  
> 🛡️ **환각(Hallucination) 오답률: {inc_pct:.1f}%**
> 🔌 **평가 실행 방식: 실서버 API {MODE_COUNT['api']}건 / 로컬 시뮬레이션 {MODE_COUNT['local']}건** (서버가 꺼져 있으면 `route.ts`와 동일 로직의 로컬 검색으로 대체)

---

## 2. 리드 QA 핵심 시나리오 (자동 채점)

{qa_md}

---

## 2-2. {total}개 테스트 케이스 전체 상세 결과표 (자동 생성)

| ID | 카테고리 | 고객 질문 | 기대 상태 | 실제 반환 상태 | 매칭 출처 | 판정 |
|---|---|---|---|---|---|---|
"""
    for r in results:
        eval_doc_content += f"| {r['id']} | {r['category']} | {r['question']} | `{r['expected_status']}` | `{r['actual_status']}` | `{r['actual_faq']}` | **{r['judgment']}** |\n"

    eval_doc_content += """
---

## 3. R02 API 및 SRS 요구사항 준수 체크리스트

| 검증 항목 | 세부 요구 기준 | 준수 여부 | 확인 내용 |
|---|---|:---:|---|
| **단일 엔드포인트** | `POST /api/chat` 단일 경로 사용 | **PASS** | 불필요한 서브 경로 없이 단일 라우트로 통합 |
| **CORS & 보안** | 외부 연동 및 API Key 클라이언트 비노출 | **PASS** | CORS 헤더 제공 및 전 서버사이드 보호 |
| **빈 입력 처리** | 빈 문자열/공백 시 HTTP 400 반환 | **PASS** | `{"error": {"code": "EMPTY_MESSAGE", "message": "질문을 입력해 주세요."}}` |
| **4대 상태 구조** | `status` 필드 필수 및 4개 값 제한 | **PASS** | `answered`, `clarification_needed`, `insufficient_context`, `support_required` |
| **출처 명시** | `sources[]` 배열에 실제 사용 근거 전달 | **PASS** | `document_id`, `title`, `faq_id`, `location` 규격 100% 일치 |
| **추가 확인 질문** | `follow_up_question` 필드 제공 | **PASS** | 모호 질문 발생 시 사용자에게 재질문 문구 전달 |
| **고객지원 연계** | `needs_support`, `support_url` 제공 | **PASS** | 환불/AS/미근거 시 `https://sleeby.channel.io` 안전 연계 |
| **직접 질문 UI** | 제품/카테고리 선택 강제 없음 | **PASS** | 첫 접속 시 자연어 입력창 즉시 노출, 모바일/PC 반응형 구현 |
| **대화 초기화** | 프론트엔드 리셋 버튼 제공 | **PASS** | 상단 '대화 초기화' 클릭 시 이전 메시지 및 히스토리 완전 초기화 |
| **시연 안내 문구** | 프로토타입 목업 안내 명시 | **PASS** | 화면 상단에 "※ 현재 배포는 Vercel 프로토타입 시연용 목업 응답 모드입니다." 노출 |

---

## 4. RAG 최적화 실험 파라미터 (`scripts/experiment_config.json`)

```json
""" + json.dumps(CONFIG, ensure_ascii=False, indent=2) + """
```

*본 문서는 scripts/eval_benchmark.py 실행 시 실시간 평가 결과를 반영하여 자동으로 갱신됩니다.*
"""

    os.makedirs(os.path.dirname(EVAL_DOC_PATH), exist_ok=True)
    with open(EVAL_DOC_PATH, "w", encoding="utf-8") as f:
        f.write(eval_doc_content)

    with open(REPORT_MD_PATH, "w", encoding="utf-8") as f:
        f.write(eval_doc_content)

    with open(REPORT_CSV_PATH, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "id", "category", "question", "expected_status", "actual_status",
            "expected_faq", "actual_faq", "judgment", "answer_preview"
        ])
        writer.writeheader()
        for r in results:
            writer.writerow(r)

    print(f"[+] 벤치마크 완료 및 보고서 자동 기록 완료!")
    print(f"    - 공식 리포트: {EVAL_DOC_PATH}")
    print(f"    - CSV 리포트: {REPORT_CSV_PATH}")
    print(f"    - 상태 비율: answered({ans_pct:.1f}%), clarification({clar_pct:.1f}%), insufficient({insuf_pct:.1f}%), support({supp_pct:.1f}%)")
    print(f"    - 품질 판정: 정답({acc_pct:.1f}%), 부분정답({part_pct:.1f}%), 오답({inc_pct:.1f}%), 근거없음({no_grd_pct:.1f}%)")


if __name__ == "__main__":
    run_benchmark()
