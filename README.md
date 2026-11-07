# (주)슬리피 AI 고객상담 챗봇 (SLEEBY RAG Chatbot)

(주)슬리피의 디지털 수면 및 이완 디바이스 전용 **홈페이지 연동형 RAG AI 고객상담 챗봇** 프로젝트입니다.  
**'Sleepy API 명세서 R02'**, **'SRS 요구사항 명세서 R02'**, 및 **'11.07 RAG 개인/공통 가이드라인'**을 100% 준수하여 제작되었으며, 초보자도 1분 만에 Vercel에 배포하고 개인별 청킹(Chunking) 실험을 수행할 수 있습니다.

---

## 🌟 주요 기능 및 특징

1. **R02 단일 엔드포인트 (`POST /api/chat`) 표준 준수**
   - 질문 의도에 따라 4대 응답 상태(`answered`, `clarification_needed`, `insufficient_context`, `support_required`) 자동 분류
   - 빈 입력/공백 입력 시 HTTP 400 (`EMPTY_MESSAGE`) 검증
   - 실제 활용된 근거만 명시하는 `sources` 객체 제공
2. **고객 중심의 직관적 반응형 UI (`app/page.tsx`)**
   - 카테고리/제품 강제 선택 없는 직접 자연어 질의 구조
   - 파스텔 블루 톤의 깔끔하고 모던한 모바일 & PC 반응형 인터페이스
   - AI 답변 하단 근거 출처 태그 표시, 추가 확인 질문 강조창, 1:1 고객지원 채널 바로가기 버튼 제공
   - '대화 초기화' 버튼으로 이전 문맥 리셋 지원
3. **팀원 개인별 RAG 실험 파이프라인 (`scripts/`)**
   - 코드 상단 변수 조절만으로 Chunking 및 검색 전략 비교 가능
   - 25개 평가 질문을 통해 정답/부분정답/오답/근거없음 비율을 엑셀(CSV) 및 마크다운으로 자동 집계

---

## 📁 프로젝트 디렉터리 구조

```text
D:\sleeby
├── AGENT_INSTRUCTION.md       # AI 고객상담 에이전트 원칙 및 응답 지침
├── README.md                  # 본 문서 (배포 및 실험 가이드)
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts       # POST /api/chat R02 단일 엔드포인트 구현체
│   ├── globals.css            # 파스텔 톤 테마 및 반응형 전역 스타일
│   ├── layout.tsx             # 루트 레이아웃
│   └── page.tsx               # 고객용 채팅 UI 컴포넌트
├── data/
│   └── faq_data.json          # 공식 승인 21개 FAQ 데이터베이스
├── scripts/
│   ├── parse_docs.py          # 개인별 Chunking/파싱 실험 스크립트
│   └── eval_benchmark.py      # 25개 질문 품질 벤치마크 및 엑셀 자동 집계기
├── package.json               # Next.js 의존성 정의
├── tsconfig.json              # TypeScript 설정
├── tailwind.config.js         # Tailwind CSS 테마 설정
└── next.config.mjs            # Next.js 빌드 설정
```

---

## 🚀 초보자를 위한 Vercel 1분 배포 가이드

복잡한 설정 없이 브라우저에서 바로 클릭 몇 번으로 실제 접속 가능한 주소에 배포할 수 있습니다.

### 1단계: GitHub 저장소 업로드
1. [GitHub](https://github.com)에 로그인 후 새로운 저장소(Repository)를 생성합니다 (예: `sleeby-chatbot`).
2. 로컬 터미널에서 아래 명령어로 코드를 푸시합니다:
```bash
git init
git add .
git commit -m "feat: 슬리피 R02 AI 고객상담 챗봇 구축"
git branch -M main
git remote add origin https://github.com/당신의계정/sleeby-chatbot.git
git push -u origin main
```

### 2단계: Vercel에서 프로젝트 가져오기 (Import)
1. [Vercel 공식 홈페이지](https://vercel.com)에 접속하여 로그인합니다.
2. 대시보드 우측 상단의 **[Add New...]** → **[Project]** 버튼을 클릭합니다.
3. 방금 푸시한 `sleeby-chatbot` 저장소를 찾아 **[Import]**를 클릭합니다.

### 3단계: 배포 (Deploy) 클릭!
1. 별도의 환경 변수 설정 없이 기본 세팅(Framework: Next.js) 그대로 둡니다.
2. 하단의 **[Deploy]** 버튼을 누르면 약 1분 이내에 빌드가 완료되고 배포 URL(예: `https://sleeby-chatbot.vercel.app`)이 생성됩니다!

---

## 🔬 개인별 RAG 실험 파라미터 조절법 (팀원 가이드)

팀 공통 가이드라인에 따라, 팀원 각자는 `scripts/parse_docs.py`의 코드 상단 변수만 수정하여 다양한 Chunking 실험을 진행할 수 있습니다.

### 1. 파라미터 수정 (`scripts/parse_docs.py`)
에디터로 파일을 열고 15~20번째 줄의 변수를 원하는 값으로 변경합니다:

```python
# ==============================================================================
# [개인별 RAG 실험 파라미터 조절 영역]
# ==============================================================================
CHUNK_SIZE = 500             # 청크 글자 수: 200, 300, 500, 1000 등 테스트
CHUNK_OVERLAP = 50           # 중복 글자 수: 0, 30, 50, 100 등 테스트
EMBEDDING_MODEL = "text-embedding-3-small"  # 임베딩 모델
SEARCH_STRATEGY = "hybrid"   # 검색 전략: "dense", "sparse", "hybrid"
# ==============================================================================
```

### 2. 청킹 실행
```bash
python scripts/parse_docs.py
```
- 실행 즉시 `data/faq_chunks_hybrid_500_50.json`과 `.jsonl` 파일이 생성됩니다.

### 💡 청킹 팁:
- **작은 청크 (200~300자):** 특정 키워드 검색 정확도가 높아지지만, 전체 맥락(주의사항)이 잘릴 수 있습니다.
- **큰 청크 (500~1000자):** 전후 문맥을 모두 보존하여 종합 답변에 유리하지만, 검색 시 노이즈가 포함될 수 있습니다.
- 팀원별로 `CHUNK_SIZE: 300 / OVERLAP: 30`, `CHUNK_SIZE: 500 / OVERLAP: 50`, `CHUNK_SIZE: 800 / OVERLAP: 100` 등으로 나누어 실험하는 것을 추천합니다.

---

## 📊 답변 품질 평가(Benchmark) 자동 집계 실행법

기업 필수 제출 요구사항인 **20~30건 평가 세트 측정 및 정답/부분정답/오답/근거없음 비율 집계**를 1초 만에 실행할 수 있습니다.

### 실행 명령어
```bash
python scripts/eval_benchmark.py
```

### 생성되는 결과물
1. **`eval_report.md` (마크다운 리포트):** 노션이나 GitHub 보고서에 바로 복사/붙여넣기할 수 있는 집계 표와 25개 문항별 결과표가 포함되어 있습니다.
2. **`eval_results.csv` (엑셀 호환 보고서):** 마이크로소프트 엑셀이나 구글 스프레드시트에서 열어 즉시 기업 제출용 파일로 활용할 수 있습니다.

---

## 🛠 로컬 개발 서버 실행 방법

```bash
# 1. 패키지 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 챗봇을 테스트할 수 있습니다.

---

## 🤝 팀 공통 저장소(Team Repository) 통합 및 PR 가이드

현재 개인 저장소(`sodobo/sleeby-chatbot`)의 `chatbot-so` 브랜치에서 독립적으로 개발 중이며, 향후 팀 공식 저장소 권한이 승인되었을 때 충돌 없이 1분 만에 통합할 수 있도록 준비되어 있습니다.

### 📌 방법 1: 팀 저장소에 원격 브랜치로 직접 푸시 (가장 간편)
팀 저장소 생성이 완료되면 아래 2줄의 명령어로 본인의 `chatbot-so` 브랜치를 팀 저장소로 바로 전송할 수 있습니다:
```bash
# 1. 팀 공식 저장소를 'team' 원격으로 추가
git remote add team https://github.com/팀조직명/팀저장소명.git

# 2. 내 chatbot-so 브랜치를 팀 저장소로 푸시
git push team chatbot-so
```
푸시 후 GitHub 웹 화면에서 팀 저장소의 `main` 브랜치로 **[Compare & pull request]**를 클릭하여 코드 리뷰 후 안전하게 머지(Merge)하시면 됩니다.

### 📌 방법 2: 개인 저장소에서 팀 저장소로 Fork & Pull Request
1. 팀 공식 저장소 화면 우측 상단의 **[Fork]** 버튼을 클릭하여 본인 계정으로 연동합니다.
2. 본인의 `chatbot-so` 브랜치에서 팀 공식 저장소의 `main` 브랜치 방향으로 Pull Request를 요청합니다.
3. 모든 파일이 상대 경로(`@/data/...`)로 작성되어 있고 로컬 절대 경로가 전혀 없으므로, 팀 공통 환경에서도 100% 충돌 없이 병합됩니다.

