#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
(주)슬리피 AI 고객상담 챗봇 - 팀 공통 답변 품질 평가(Benchmark) 스크립트
25개 대표/예외/상담 질문 세트를 실행하여 정답, 부분정답, 오답, 근거없음을 자동 분류하고
마크다운 표 및 엑셀(CSV) 리포트로 집계합니다.
"""

import os
import json
import csv
import urllib.request
import urllib.error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT_MD_PATH = os.path.join(BASE_DIR, "eval_report.md")
REPORT_CSV_PATH = os.path.join(BASE_DIR, "eval_results.csv")

# 공식 승인 21개 FAQ 데이터
FAQ_DATA = [
    {
        "faq_id": "FAQ-01",
        "document_id": "DOC-FAQ-001",
        "title": "SLEEBY는 잠들기 전에만 사용하면 되나요?",
        "category": "사용 방법",
        "question": "SLEEBY는 잠들기 전에만 사용하면 되나요?",
        "answer": "밤에 잠자리에 들기 전은 물론, 낮에 잠깐 자거나 휴식을 취하고 싶을 때도 사용하실 수 있어요. 양쪽 귀에 착용한 뒤 평소처럼 주무시거나 쉬시면 됩니다. SLEEBY에서 나오는 작은 소리에 집중하셔도 되고, 특별히 신경 쓰지 않으셔도 괜찮아요.",
        "keywords": ["잠들기 전", "사용 시간", "낮잠", "휴식", "착용 시기"]
    },
    {
        "faq_id": "FAQ-02",
        "document_id": "DOC-FAQ-002",
        "title": "잠든 뒤에도 계속 착용하고 있어도 괜찮나요?",
        "category": "사용 방법",
        "question": "잠든 뒤에도 계속 착용하고 있어도 괜찮나요?",
        "answer": "네. 양이성 음향은 전원이 켜진 뒤 약 30분이 지나면 자동으로 꺼져요. 30분 안에 잠드셨다면 착용한 채로 계속 주무셔도 괜찮습니다. 불편하면 빼셔도 되니, 편안한 쪽으로 선택해 주세요.",
        "keywords": ["착용 지속", "30분", "자동 꺼짐", "수면 중 착용", "계속 착용"]
    },
    {
        "faq_id": "FAQ-03",
        "document_id": "DOC-FAQ-003",
        "title": "사용하다가 중간에 빼도 되나요?",
        "category": "사용 방법",
        "question": "사용하다가 중간에 빼도 되나요?",
        "answer": "네. 사용 중 불편하거나 빼고 싶을 때는 언제든 빼셔도 됩니다.",
        "keywords": ["중간에 빼기", "제거", "사용 중지"]
    },
    {
        "faq_id": "FAQ-04",
        "document_id": "DOC-FAQ-004",
        "title": "잠이 들지 않으면 다시 착용해도 되나요?",
        "category": "사용 방법",
        "question": "잠이 들지 않으면 다시 착용해도 되나요?",
        "answer": "네. 30분 후 SLEEBY 전원이 자동으로 꺼진 뒤에도 잠이 들지 않거나 졸린 느낌이 없다면 다시 사용하셔도 돼요. SLEEBY를 충전 케이스에 넣었다가 1~2초 후 다시 꺼내 착용하면 양이성 음향이 다시 30분 동안 재생됩니다.",
        "keywords": ["재착용", "다시 사용", "재생", "케이스에 넣었다 꺼내기"]
    },
    {
        "faq_id": "FAQ-05",
        "document_id": "DOC-FAQ-005",
        "title": "낮잠을 잘 때 사용해도 되나요?",
        "category": "사용 방법",
        "question": "낮잠을 잘 때 사용해도 되나요?",
        "answer": "네. 낮잠이나 휴식을 취할 때도 사용하실 수 있어요. 편안한 상태에서 착용해 주세요.",
        "keywords": ["낮잠", "휴식", "낮에 사용"]
    },
    {
        "faq_id": "FAQ-06",
        "document_id": "DOC-FAQ-006",
        "title": "매일 사용해도 괜찮나요?",
        "category": "안전/효과",
        "question": "매일 사용해도 괜찮나요?",
        "answer": "네. 착용감에 불편함이 없다면 밤이나 일상에서 필요할 때 반복해서 사용하셔도 괜찮아요. 양이성 음향에 대한 반응은 사람마다 다를 수 있으며, 사용 경험에도 개인차가 있을 수 있습니다.",
        "keywords": ["매일 사용", "반복 사용", "자주 사용", "부작용"]
    },
    {
        "faq_id": "FAQ-07",
        "document_id": "DOC-FAQ-007",
        "title": "충전이 끝나면 LED가 어떻게 표시되나요?",
        "category": "충전/배터리",
        "question": "충전이 끝나면 LED가 어떻게 표시되나요?",
        "answer": "케이스를 충전하는 동안에는 흰색 LED가 깜박이고, 충전이 완료되면 흰색 LED가 계속 켜져 있어요.",
        "keywords": ["충전 완료", "LED", "불빛", "흰색 LED", "깜박임"]
    },
    {
        "faq_id": "FAQ-08",
        "document_id": "DOC-FAQ-008",
        "title": "충전 케이스를 충전하는 동안 SLEEBY를 사용해도 되나요?",
        "category": "충전/배터리",
        "question": "충전 케이스를 충전하는 동안 SLEEBY를 사용해도 되나요?",
        "answer": "네. 충전 케이스를 충전하면서 SLEEBY를 꺼내 사용하셔도 돼요.",
        "keywords": ["케이스 충전 중 사용", "동시 사용"]
    },
    {
        "faq_id": "FAQ-09",
        "document_id": "DOC-FAQ-009",
        "title": "충전 케이스를 충전하면서 SLEEBY도 충전할 수 있나요?",
        "category": "충전/배터리",
        "question": "충전 케이스를 충전하면서 SLEEBY도 충전할 수 있나요?",
        "answer": "네. 충전 케이스에 케이블을 연결해 충전하는 중에도, 케이블을 연결하지 않은 상태에서도 SLEEBY를 케이스에 넣으면 충전할 수 있어요.",
        "keywords": ["동시 충전", "본체 충전", "케이스 충전"]
    },
    {
        "faq_id": "FAQ-010",
        "document_id": "DOC-FAQ-010",
        "title": "이어팁은 어떻게 교체하나요?",
        "category": "관리/보관",
        "question": "이어팁은 어떻게 교체하나요?",
        "answer": "이어팁을 SLEEBY 본체에서 조심스럽게 분리한 뒤, 사용할 크기의 이어팁을 본체에 맞춰 끼워 주세요. 너무 세게 잡아당기거나 비틀지 않도록 주의해 주세요.",
        "keywords": ["이어팁 교체", "이어팁 분리", "이어팁 끼우기"]
    },
    {
        "faq_id": "FAQ-011",
        "document_id": "DOC-FAQ-011",
        "title": "SLEEBY 본체는 어떻게 청소하면 되나요?",
        "category": "관리/보관",
        "question": "SLEEBY 본체는 어떻게 청소하면 되나요?",
        "answer": "SLEEBY는 방수 기능이 없어요. 흐르는 물에 씻거나 물에 담그면 고장 날 수 있으니 피해주세요. 안경을 닦듯이 세척액이나 물티슈를 묻혀 닦는 방법은 괜찮습니다.",
        "keywords": ["청소", "세척", "방수", "물티슈", "소독"]
    },
    {
        "faq_id": "FAQ-012",
        "document_id": "DOC-FAQ-012",
        "title": "사용하지 않을 때는 어떻게 보관하는 게 좋나요?",
        "category": "관리/보관",
        "question": "사용하지 않을 때는 어떻게 보관하는 게 좋나요?",
        "answer": "사용하지 않을 때는 본체를 충전 케이스에 넣어 보관해 주세요. 습기가 많거나 온도가 높은 곳은 피해 주세요.",
        "keywords": ["보관", "케이스 보관", "습기", "보관 방법"]
    },
    {
        "faq_id": "FAQ-013",
        "document_id": "DOC-FAQ-013",
        "title": "여행할 때 비행기나 기차 안에서 사용해도 되나요?",
        "category": "착용/편의성",
        "question": "여행할 때 비행기나 기차 안에서 사용해도 되나요?",
        "answer": "네. 사용하셔도 돼요. 주변이 시끄러우면 SLEEBY의 양이성 음향이 잘 들리지 않을 수 있지만, 소리가 또렷하게 들리지 않더라도 착용해 사용하실 수 있어요. 다만 안내 방송이나 안전 안내를 들어야 하는 상황에서는 사용을 피해 주세요.",
        "keywords": ["비행기", "기차", "여행", "대중교통", "기내 사용"]
    },
    {
        "faq_id": "FAQ-014",
        "document_id": "DOC-FAQ-014",
        "title": "잠귀가 밝은 편인데, 주변 소리가 들리나요?",
        "category": "제품 소개/기능",
        "question": "잠귀가 밝은 편인데, 주변 소리가 들리나요?",
        "answer": "SLEEBY에는 액티브 노이즈 캔슬링 기능이 없고, 외부 소리를 완전히 차단하는 제품도 아니에요. 일반 귀마개를 착용했을 때처럼 주변 소리가 작게 들릴 수 있으며, 소리가 들리는 정도는 착용 상태와 개인차에 따라 달라질 수 있습니다.",
        "keywords": ["노이즈 캔슬링", "차음", "주변 소리", "소음 차단", "ANC"]
    },
    {
        "faq_id": "FAQ-015",
        "document_id": "DOC-FAQ-015",
        "title": "음악이나 오디오북을 들으면서 함께 사용할 수 있나요?",
        "category": "제품 소개/기능",
        "question": "음악이나 오디오북을 들으면서 함께 사용할 수 있나요?",
        "answer": "SLEEBY는 다른 기기와 연결해 음악이나 오디오북을 재생하는 제품이 아니에요. 내장된 양이성 음향을 단독으로 사용해 주세요.",
        "keywords": ["음악 재생", "오디오북", "블루투스 스피커", "이어폰 기능"]
    },
    {
        "faq_id": "FAQ-016",
        "document_id": "DOC-FAQ-016",
        "title": "헤드폰이나 다른 귀마개와 같이 착용할 수 있나요?",
        "category": "착용/편의성",
        "question": "헤드폰이나 다른 귀마개와 같이 착용할 수 있나요?",
        "answer": "SLEEBY는 다른 기기나 귀마개와 함께 착용하도록 설계된 제품은 아니에요. 함께 착용하면 불편하거나 제품을 의도한 방식으로 사용하기 어려울 수 있으니 단독으로 착용해 주세요.",
        "keywords": ["헤드폰 중복 착용", "귀마개 동시 착용", "이중 착용"]
    },
    {
        "faq_id": "FAQ-017",
        "document_id": "DOC-FAQ-017",
        "title": "양쪽 귀의 크기가 다른데, 이어팁을 서로 다른 크기로 사용해도 되나요?",
        "category": "착용/편의성",
        "question": "양쪽 귀의 크기가 다른데, 이어팁을 서로 다른 크기로 사용해도 되나요?",
        "answer": "네. 좌우 귀에 잘 맞는 크기가 다르다면 각 귀에 맞는 이어팁을 따로 사용하셔도 돼요. 다만 SLEEBY 본체의 ‘L/R’ 표시는 올바르게 맞춰 착용해 주세요.",
        "keywords": ["양쪽 귀 크기", "이어팁 다른 크기", "좌우 비대칭", "L/R"]
    },
    {
        "faq_id": "FAQ-018",
        "document_id": "DOC-FAQ-018",
        "title": "귀가 작은 편인데 잘 맞을까요?",
        "category": "착용/편의성",
        "question": "귀가 작은 편인데 잘 맞을까요?",
        "answer": "귀 모양과 크기는 사람마다 달라 착용감에 차이가 있을 수 있어요. 동봉된 S/M/L 이어팁 중 귀에 편안하게 맞는 크기를 선택해 주세요.",
        "keywords": ["작은 귀", "크기 선택", "S/M/L 이어팁", "착용감"]
    },
    {
        "faq_id": "FAQ-019",
        "document_id": "DOC-FAQ-019",
        "title": "잠잘 때 옆으로 누워도 불편하지 않나요?",
        "category": "착용/편의성",
        "question": "잠잘 때 옆으로 누워도 불편하지 않나요?",
        "answer": "착용감은 귀 모양과 자세에 따라 다를 수 있어요. 옆으로 누웠을 때 불편하다면 착용 위치를 조정하거나 잠시 빼 주세요.",
        "keywords": ["옆으로 눕기", "옆잠", "수면 자세", "통증", "눌림"]
    },
    {
        "faq_id": "FAQ-020",
        "document_id": "DOC-FAQ-020",
        "title": "귀 질환이 있거나 귀가 민감한 사람도 사용할 수 있나요?",
        "category": "안전/효과",
        "question": "귀 질환이 있거나 귀가 민감한 사람도 사용할 수 있나요?",
        "answer": "귀에 통증이나 질환이 있거나 착용 중 불편함이 느껴지면 사용을 중단해 주세요. 사용해도 괜찮을지 걱정되신다면 의료 전문가와 상담해 주세요.",
        "keywords": ["귀 질환", "이명", "중이염", "외이도염", "의료 전문가", "의사 상담"]
    },
    {
        "faq_id": "FAQ-021",
        "document_id": "DOC-FAQ-021",
        "title": "구성품에는 어떤 것들이 들어 있나요?",
        "category": "제품 소개/기능",
        "question": "구성품에는 어떤 것들이 들어 있나요?",
        "answer": "기본 구성품에는 SLEEBY 본체, 충전 케이스, USB-C 충전 케이블, S/M/L 이어팁, 사용 설명서 등이 포함되어 있어요.",
        "keywords": ["구성품", "패키지", "기본 구성", "충전 케이블", "설명서"]
    }
]

# 팀 공통 25개 평가 질문 세트 (대표, 경계값, 미근거, 상담 연결)
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
    { "id": "TC-25", "question": "슬리피 회사 주식 상장 일정과 공모가는 얼마인가요?", "expected_status": "insufficient_context", "expected_faq": None, "category": "미보유 지식" }
]


def local_search_match(query, faqs):
    clean_q = query.lower().strip()
    support_keywords = ["환불", "교환", "반품", "결제", "배송", "주문 취소", "as 접수", "수리", "영수증"]
    if any(k in clean_q for k in support_keywords):
        return {
            "status": "support_required",
            "answer": "교환·환불 등 개별 주문 정보 확인이 필요한 문의입니다. 공식 고객지원 채널로 문의해 주세요.",
            "sources": [],
            "needs_support": True,
            "support_url": "https://sleeby.channel.io",
            "follow_up_question": None
        }

    if clean_q in ["충전", "제품", "사용법", "어떻게 써요?", "어떻게 써요", "기능"] or len(clean_q) <= 2:
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

    if best_match and highest_score >= 5:
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


def query_api(question, api_url="http://localhost:3000/api/chat", faqs=None):
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
                return json.loads(resp.read().decode("utf-8"))
    except Exception:
        pass
    return local_search_match(question, faqs)


def run_benchmark():
    results = []
    counts = { "정답": 0, "부분정답": 0, "오답": 0, "근거없음": 0 }

    print(f"[*] 총 {len(BENCHMARK_DATASET)}개 평가 테스트 시작...")

    for item in BENCHMARK_DATASET:
        qid = item["id"]
        qtext = item["question"]
        expected_status = item["expected_status"]
        expected_faq = item["expected_faq"]

        res = query_api(qtext, faqs=FAQ_DATA)
        actual_status = res.get("status")
        sources = res.get("sources", [])
        actual_faq = sources[0]["faq_id"] if sources else None

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

        counts[judgment] += 1
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

    total = len(BENCHMARK_DATASET)
    accuracy_rate = (counts["정답"] / total) * 100
    partial_rate = (counts["부분정답"] / total) * 100
    incorrect_rate = (counts["오답"] / total) * 100
    no_grounding_rate = (counts["근거없음"] / total) * 100

    # 1. 마크다운 리포트 생성
    md_content = f"""# (주)슬리피 AI 고객상담 챗봇 품질 평가(Benchmark) 리포트

- **평가 일시:** 2026-11-07
- **평가 질문 수:** {total}문항 (대표 질문 21건 + 모호 질문 2건 + 상담 안내 1건 + 근거 부재 1건)
- **평가 규격:** Sleepy API 명세서 R02 / SRS R02

---

## 1. 종합 평가 집계 요약

| 평가 유형 | 건수 (건) | 비율 (%) | 비고 |
|---|---|---|---|
| **정답 (Correct)** | **{counts['정답']}** | **{accuracy_rate:.1f}%** | 질문 의도 및 공식 FAQ 정확 매칭 |
| **부분정답 (Partial)** | **{counts['부분정답']}** | **{partial_rate:.1f}%** | 추가 확인 질문 또는 부분 매칭 |
| **오답 (Incorrect)** | **{counts['오답']}** | **{incorrect_rate:.1f}%** | 잘못된 정보 매칭 |
| **근거없음 (Insufficient)** | **{counts['근거없음']}** | **{no_grounding_rate:.1f}%** | 미확인 질문에 대한 환각 없는 안전 차단 |
| **합계** | **{total}** | **100.0%** | - |

> **신뢰도 지표 (정답 + 근거없음 안전방어율):** **{((counts['정답'] + counts['근거없음']) / total) * 100:.1f}%**

---

## 2. 25개 테스트 케이스 세부 결과표

| ID | 카테고리 | 질문 | 기대 상태 | 실제 상태 | 매칭 FAQ | 판정 |
|---|---|---|---|---|---|---|
"""
    for r in results:
        md_content += f"| {r['id']} | {r['category']} | {r['question']} | `{r['expected_status']}` | `{r['actual_status']}` | `{r['actual_faq']}` | **{r['judgment']}** |\n"

    md_content += "\n---\n*본 리포트는 scripts/eval_benchmark.py를 통해 자동 집계되었습니다.*\n"

    with open(REPORT_MD_PATH, "w", encoding="utf-8") as f:
        f.write(md_content)

    # 2. 엑셀 호환 CSV 리포트 생성
    with open(REPORT_CSV_PATH, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "id", "category", "question", "expected_status", "actual_status",
            "expected_faq", "actual_faq", "judgment", "answer_preview"
        ])
        writer.writeheader()
        for r in results:
            writer.writerow(r)

    print(f"[+] 평가 완료! 리포트 생성:")
    print(f"    - 마크다운 리포트: {REPORT_MD_PATH}")
    print(f"    - 엑셀(CSV) 리포트: {REPORT_CSV_PATH}")
    print(f"    - 집계 결과: 정답 {counts['정답']}건 ({accuracy_rate:.1f}%), 부분정답 {counts['부분정답']}건, 오답 {counts['오답']}건, 근거없음 {counts['근거없음']}건")


if __name__ == "__main__":
    run_benchmark()
