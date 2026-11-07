# (주)슬리피 RAG AI 고객상담 챗봇 — 품질 평가 보고서 (EVALUATION_REPORT)

| 문서 메타데이터 | 내용 |
|---|---|
| **문서 ID** | `SLEEPY-EVAL-R02` |
| **평가 기준일** | 2026-11-07 (KST) |
| **연계 명세** | Sleepy API 명세서 R02 / Sleepy 요구사항 명세서 R02 / 11.07 RAG 가이드라인 |
| **평가 대상** | `POST /api/chat` (Vercel 배포 및 RAG 하이브리드 검색 파이프라인) |
| **평가 데이터셋** | 총 27개 테스트 질의 (대표 FAQ 21건 + 인사 2건 + 모호 2건 + 상담 1건 + 미근거 1건) |

---

## 1. 종합 평가 결과 집계 요약 (자동 집계)

### 1.1 R02 상태(Status)별 반환 비율
| 응답 상태 (`status`) | 건수 (건) | 비율 (%) | R02 의미 |
|---|---|---|---|
| **`answered` (답변 생성)** | **23** | **85.2%** | 충분한 근거를 사용해 공식 답변 및 출처 생성 |
| **`clarification_needed` (추가 확인)** | **2** | **7.4%** | 질문 의도가 모호하여 추가 확인 질문(`follow_up_question`) 제시 |
| **`insufficient_context` (근거 부재)** | **1** | **3.7%** | 사내 지식에 없는 내용에 대해 환각 없이 안전 안내 |
| **`support_required` (상담 연결)** | **1** | **3.7%** | 개별 주문/환불/AS 사안으로 1:1 고객지원 채널 연결 |
| **합계** | **27** | **100.0%** | - |

### 1.2 답변 품질(Quality) 판정 집계
| 평가 유형 | 건수 (건) | 비율 (%) | 판정 기준 및 비고 |
|---|---|---|---|
| **정답 (Correct)** | **26** | **96.3%** | 질문 의도를 정확히 파악하고 올바른 FAQ 항목 매칭 및 답변 생성 |
| **부분정답 (Partial)** | **0** | **0.0%** | 질문이 모호하여 의도 확인 질문을 정상 유도함 |
| **오답 (Incorrect)** | **0** | **0.0%** | 사실 왜곡, 다른 FAQ 내용 오안내, 또는 잘못된 답변 |
| **근거없음 (Insufficient)** | **1** | **3.7%** | 사내 지식에 없는 질문에 대해 환각 없이 안전하게 고객지원으로 안내 |
| **합계** | **27** | **100.0%** | - |

> 🏆 **핵심 신뢰도 지표 (정답 + 근거없는 질문 안전방어율): 100.0%**  
> 🛡️ **환각(Hallucination) 오답률: 0.0%**
> 🔌 **평가 실행 방식: 실서버 API 27건 / 로컬 시뮬레이션 0건** (서버가 꺼져 있으면 `route.ts`와 동일 로직의 로컬 검색으로 대체)

---

## 2. 리드 QA 핵심 시나리오 (자동 채점)

| ID | 시나리오 | 기대 결과 | 실제 결과 | 판정 | 비고 |
|---|---|---|---|:---:|---|
| QA-01 | 수면 모드 사용법 | answered | answered | **PASS** | [api] 출처 FAQ-01 (허용: FAQ-01, FAQ-02, FAQ-04) |
| QA-02 | 충전/배터리 | answered | answered | **PASS** | [api] 출처 FAQ-07 (허용: FAQ-07, FAQ-08, FAQ-09) |
| QA-03 | 빨간불 반짝임 충전 문의 | clarification_needed | clarification_needed | **PASS** | [api] 규격 준수 |
| QA-04 | 거치대형/밴드형 호환 문의 | clarification_needed | clarification_needed | **PASS** | [api] 규격 준수 |
| QA-11 | 인사말 (검색 없이 정형 응답) | answered | answered | **PASS** | [api] 규격 준수 |
| QA-05 | 2세대 출시일 문의 | insufficient_context | insufficient_context | **PASS** | [api] 규격 준수 |
| QA-06 | 불면증 100% 완치 문의 | insufficient_context | insufficient_context | **PASS** | [api] 규격 준수 |
| QA-07 | 구매 환불/교환 문의 | support_required | support_required | **PASS** | [api] 규격 준수 |
| QA-08 | 공백 입력 | HTTP 400 / EMPTY_MESSAGE | HTTP 400 / EMPTY_MESSAGE | **PASS** | [api] |
| QA-09 | 대화 초기화(reset) | reset 핸들러+버튼 | 핸들러 True / 버튼 True | **PASS** | app/page.tsx 정적 검사 (메시지·입력 초기화) |
| QA-10 | 모바일 UI 응답 규격 | R02 6필드 + 반응형 UI | 규격 OK / 반응형 True | **PASS** | [api] 응답 6필드 및 app/page.tsx 반응형 클래스 검사 |
| QA-12 | 1:1 상담 연결 UI(대기시간/전화/카카오톡) | UI 요소 + 잘못된 번호 400 | UI True / 콜백API True / 잘못된 번호 HTTP 400 | **PASS** | [api] app/page.tsx, app/api/callback/route.ts |
| QA-13 | 세션 ID·10개 Sliding Window·다중 제품 | 정적 검사 | True | **PASS** | lib/session.ts, app/page.tsx |
| QA-14 | 응답 지연(인사·상담 <1s, Multi-Query <2s) | 모두 기준 이내 | 인사말 24ms, 상담 요청 26ms, Multi-Query 27ms | **PASS** | [api] |

> ✅ **QA 시나리오 통과: 14/14**

---

## 2-2. 27개 테스트 케이스 전체 상세 결과표 (자동 생성)

| ID | 카테고리 | 고객 질문 | 기대 상태 | 실제 반환 상태 | 매칭 출처 | 판정 |
|---|---|---|---|---|---|---|
| TC-01 | 사용 방법 | SLEEBY는 밤에 잘 때만 써야 하나요? | `answered` | `answered` | `FAQ-01` | **정답** |
| TC-02 | 사용 방법 | 잠든 후에도 귀에 계속 끼고 있어도 안전한가요? | `answered` | `answered` | `FAQ-02` | **정답** |
| TC-03 | 사용 방법 | 사용하다가 답답하면 중간에 빼도 되나요? | `answered` | `answered` | `FAQ-03` | **정답** |
| TC-04 | 사용 방법 | 30분 지나서 꺼졌는데 잠이 안 오면 다시 쓸 수 있나요? | `answered` | `answered` | `FAQ-04` | **정답** |
| TC-05 | 사용 방법 | 낮에 잠깐 낮잠잘 때 착용해도 되나요? | `answered` | `answered` | `FAQ-05` | **정답** |
| TC-06 | 안전/효과 | 매일 연속으로 사용해도 부작용이나 문제 없나요? | `answered` | `answered` | `FAQ-06` | **정답** |
| TC-07 | 충전/배터리 | 충전이 다 끝나면 케이스 불빛이 어떻게 켜지나요? | `answered` | `answered` | `FAQ-07` | **정답** |
| TC-08 | 충전/배터리 | 충전 케이스를 충전기에 꽂아둔 채로 기기를 꺼내 써도 되나요? | `answered` | `answered` | `FAQ-08` | **정답** |
| TC-09 | 충전/배터리 | 케이스 충전하면서 기기도 같이 동시에 충전되나요? | `answered` | `answered` | `FAQ-09` | **정답** |
| TC-10 | 관리/보관 | 이어팁 교체는 어떻게 하나요? | `answered` | `answered` | `FAQ-010` | **정답** |
| TC-11 | 관리/보관 | 기기에 물이 묻었는데 물로 씻어서 청소해도 되나요? | `answered` | `answered` | `FAQ-011` | **정답** |
| TC-12 | 관리/보관 | 기기를 안 쓸 때는 어디에 보관해야 하나요? | `answered` | `answered` | `FAQ-012` | **정답** |
| TC-13 | 착용/편의성 | 비행기나 KTX 안에서 사용해도 되나요? | `answered` | `answered` | `FAQ-013` | **정답** |
| TC-14 | 제품 소개/기능 | 노이즈 캔슬링(ANC) 기능이 있어서 주변 소음을 완전히 없애주나요? | `answered` | `answered` | `FAQ-014` | **정답** |
| TC-15 | 제품 소개/기능 | 스마트폰 블루투스 연결해서 유튜브나 멜론 음악 들을 수 있나요? | `answered` | `answered` | `FAQ-015` | **정답** |
| TC-16 | 착용/편의성 | 헤드폰이나 일반 소음 귀마개랑 겹쳐서 착용해도 되나요? | `answered` | `answered` | `FAQ-016` | **정답** |
| TC-17 | 착용/편의성 | 왼쪽 귀는 큰데 오른쪽 귀는 작아서 이어팁을 짝짝이로 써도 되나요? | `answered` | `answered` | `FAQ-017` | **정답** |
| TC-18 | 착용/편의성 | 제가 귀 구멍이 작은 편인데 잘 맞을까요? | `answered` | `answered` | `FAQ-018` | **정답** |
| TC-19 | 착용/편의성 | 옆으로 누워서 자는 버릇이 있는데 배기거나 불편하지 않나요? | `answered` | `answered` | `FAQ-019` | **정답** |
| TC-20 | 안전/효과 | 중이염이나 귀 염증이 있어도 써도 괜찮나요? | `answered` | `answered` | `FAQ-020` | **정답** |
| TC-21 | 제품 소개/기능 | 기본 박스 구성품에 충전기랑 이어팁 다 들어있나요? | `answered` | `answered` | `FAQ-021` | **정답** |
| TC-22 | 모호한 질문 | 충전 | `clarification_needed` | `clarification_needed` | `-` | **정답** |
| TC-23 | 모호한 질문 | 어떻게 써요? | `clarification_needed` | `clarification_needed` | `-` | **정답** |
| TC-24 | 상담/환불 | 어제 주문한 제품 주문 취소하고 환불받고 싶어요 | `support_required` | `support_required` | `-` | **정답** |
| TC-26 | 인사말 | 안녕하세요 | `answered` | `answered` | `-` | **정답** |
| TC-27 | 인사말 | 반가워요! | `answered` | `answered` | `-` | **정답** |
| TC-25 | 미보유 지식 | 슬리피 회사 주식 상장 일정과 공모가는 얼마인가요? | `insufficient_context` | `insufficient_context` | `-` | **근거없음** |

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
{
  "chunk_size": 500,
  "chunk_overlap": 50,
  "embedding_model": "text-embedding-3-small",
  "search_strategy": "hybrid",
  "similarity_threshold": 0.7,
  "top_k": 3,
  "use_reranker": false,
  "use_intent_router": true,
  "use_multi_query": true,
  "system_prompt_version": "R02_QA_VERIFIED"
}
```

*본 문서는 scripts/eval_benchmark.py 실행 시 실시간 평가 결과를 반영하여 자동으로 갱신됩니다.*
