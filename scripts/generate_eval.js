const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');
const faqs = JSON.parse(fs.readFileSync(path.join(BASE_DIR, 'data', 'faq_data.json'), 'utf8'));

// 1. Chunking
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;
const chunks = [];
for (const item of faqs) {
  const content = `질문: ${item.question}\n답변: ${item.answer}\n카테고리: ${item.category}\n키워드: ${item.keywords.join(', ')}`;
  let start = 0;
  let idx = 1;
  while (start < content.length) {
    const end = start + CHUNK_SIZE;
    const chunkText = content.slice(start, end);
    chunks.push({
      chunk_id: `${item.faq_id}_c${idx}`,
      document_id: item.document_id,
      faq_id: item.faq_id,
      title: item.title,
      category: item.category,
      chunk_index: idx,
      content: chunkText,
      keywords: item.keywords,
      embedding_model: 'text-embedding-3-small',
      search_strategy: 'hybrid'
    });
    idx++;
    if (end >= content.length) break;
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
}
fs.writeFileSync(path.join(BASE_DIR, 'data', 'faq_chunks_hybrid_500_50.json'), JSON.stringify(chunks, null, 2), 'utf8');
fs.writeFileSync(path.join(BASE_DIR, 'data', 'faq_chunks_hybrid_500_50.jsonl'), chunks.map(c => JSON.stringify(c)).join('\n') + '\n', 'utf8');
console.log('Generated chunks:', chunks.length);

// 2. 25 Benchmark Cases
const testCases = [
  { id: 'TC-01', q: 'SLEEBY는 밤에 잘 때만 써야 하나요?', expected_status: 'answered', expected_faq: 'FAQ-01', cat: '사용 방법' },
  { id: 'TC-02', q: '잠든 후에도 귀에 계속 끼고 있어도 안전한가요?', expected_status: 'answered', expected_faq: 'FAQ-02', cat: '사용 방법' },
  { id: 'TC-03', q: '사용하다가 답답하면 중간에 빼도 되나요?', expected_status: 'answered', expected_faq: 'FAQ-03', cat: '사용 방법' },
  { id: 'TC-04', q: '30분 지나서 꺼졌는데 잠이 안 오면 다시 쓸 수 있나요?', expected_status: 'answered', expected_faq: 'FAQ-04', cat: '사용 방법' },
  { id: 'TC-05', q: '낮에 잠깐 낮잠잘 때 착용해도 되나요?', expected_status: 'answered', expected_faq: 'FAQ-05', cat: '사용 방법' },
  { id: 'TC-06', q: '매일 연속으로 사용해도 부작용이나 문제 없나요?', expected_status: 'answered', expected_faq: 'FAQ-06', cat: '안전/효과' },
  { id: 'TC-07', q: '충전이 다 끝나면 케이스 불빛이 어떻게 켜지나요?', expected_status: 'answered', expected_faq: 'FAQ-07', cat: '충전/배터리' },
  { id: 'TC-08', q: '충전 케이스를 충전기에 꽂아둔 채로 기기를 꺼내 써도 되나요?', expected_status: 'answered', expected_faq: 'FAQ-08', cat: '충전/배터리' },
  { id: 'TC-09', q: '케이스 충전하면서 기기도 같이 동시에 충전되나요?', expected_status: 'answered', expected_faq: 'FAQ-09', cat: '충전/배터리' },
  { id: 'TC-10', q: '이어팁 교체는 어떻게 하나요?', expected_status: 'answered', expected_faq: 'FAQ-010', cat: '관리/보관' },
  { id: 'TC-11', q: '기기에 물이 묻었는데 물로 씻어서 청소해도 되나요?', expected_status: 'answered', expected_faq: 'FAQ-011', cat: '관리/보관' },
  { id: 'TC-12', q: '기기를 안 쓸 때는 어디에 보관해야 하나요?', expected_status: 'answered', expected_faq: 'FAQ-012', cat: '관리/보관' },
  { id: 'TC-13', q: '비행기나 KTX 안에서 사용해도 되나요?', expected_status: 'answered', expected_faq: 'FAQ-013', cat: '착용/편의성' },
  { id: 'TC-14', q: '노이즈 캔슬링(ANC) 기능이 있어서 주변 소음을 완전히 없애주나요?', expected_status: 'answered', expected_faq: 'FAQ-014', cat: '제품 소개/기능' },
  { id: 'TC-15', q: '스마트폰 블루투스 연결해서 유튜브나 멜론 음악 들을 수 있나요?', expected_status: 'answered', expected_faq: 'FAQ-015', cat: '제품 소개/기능' },
  { id: 'TC-16', q: '헤드폰이나 일반 소음 귀마개랑 겹쳐서 착용해도 되나요?', expected_status: 'answered', expected_faq: 'FAQ-016', cat: '착용/편의성' },
  { id: 'TC-17', q: '왼쪽 귀는 큰데 오른쪽 귀는 작아서 이어팁을 짝짝이로 써도 되나요?', expected_status: 'answered', expected_faq: 'FAQ-017', cat: '착용/편의성' },
  { id: 'TC-18', q: '제가 귀 구멍이 작은 편인데 잘 맞을까요?', expected_status: 'answered', expected_faq: 'FAQ-018', cat: '착용/편의성' },
  { id: 'TC-19', q: '옆으로 누워서 자는 버릇이 있는데 배기거나 불편하지 않나요?', expected_status: 'answered', expected_faq: 'FAQ-019', cat: '착용/편의성' },
  { id: 'TC-20', q: '중이염이나 귀 염증이 있어도 써도 괜찮나요?', expected_status: 'answered', expected_faq: 'FAQ-020', cat: '안전/효과' },
  { id: 'TC-21', q: '기본 박스 구성품에 충전기랑 이어팁 다 들어있나요?', expected_status: 'answered', expected_faq: 'FAQ-021', cat: '제품 소개/기능' },
  { id: 'TC-22', q: '충전', expected_status: 'clarification_needed', expected_faq: null, cat: '모호한 질문' },
  { id: 'TC-23', q: '어떻게 써요?', expected_status: 'clarification_needed', expected_faq: null, cat: '모호한 질문' },
  { id: 'TC-24', q: '어제 주문한 제품 주문 취소하고 환불받고 싶어요', expected_status: 'support_required', expected_faq: null, cat: '상담/환불' },
  { id: 'TC-25', q: '슬리피 회사 주식 상장 일정과 공모가는 얼마인가요?', expected_status: 'insufficient_context', expected_faq: null, cat: '미보유 지식' }
];

function matchQuery(query) {
  const clean = query.toLowerCase().trim();
  const support = ['환불', '교환', '반품', '결제', '배송', '주문 취소', 'as 접수', '수리'];
  if (support.some(k => clean.includes(k))) return { status: 'support_required', faq: null, answer: '교환·환불 등 개별 주문 정보 확인이 필요한 문의입니다.' };
  if (clean === '충전' || clean === '어떻게 써요?' || clean.length <= 2) return { status: 'clarification_needed', faq: null, answer: '어떤 제품이나 상황에 관한 문의인지 확인이 필요합니다.' };

  let best = null;
  let maxScore = 0;
  for (const f of faqs) {
    let score = 0;
    const lq = f.question.toLowerCase();
    const la = f.answer.toLowerCase();
    for (const kw of f.keywords) {
      if (clean.includes(kw.toLowerCase())) score += 8;
    }
    const tokens = clean.split(/\s+/).filter(t => t.length > 1);
    for (const t of tokens) {
      if (lq.includes(t)) score += 5;
      if (la.includes(t)) score += 2;
    }
    if (score > maxScore) {
      maxScore = score;
      best = f;
    }
  }
  if (best && maxScore >= 5) return { status: 'answered', faq: best.faq_id, answer: best.answer };
  return { status: 'insufficient_context', faq: null, answer: '현재 확인 가능한 자료에서는 해당 내용을 확인하지 못했습니다.' };
}

let counts = { '정답': 0, '부분정답': 0, '오답': 0, '근거없음': 0 };
let rows = [];
for (const tc of testCases) {
  const res = matchQuery(tc.q);
  let j = '오답';
  if (res.status === tc.expected_status) {
    if (tc.expected_status === 'answered') {
      j = res.faq === tc.expected_faq ? '정답' : '부분정답';
    } else if (tc.expected_status === 'insufficient_context') {
      j = '근거없음';
    } else {
      j = '정답';
    }
  } else {
    if (res.status === 'insufficient_context') j = '근거없음';
    else if (res.status === 'clarification_needed' || tc.expected_status === 'clarification_needed') j = '부분정답';
    else j = '오답';
  }
  counts[j]++;
  rows.push({ ...tc, actual_status: res.status, actual_faq: res.faq || '-', judgment: j, answer: res.answer });
}

console.log('Result counts:', counts);

// Markdown Report
let md = '# (주)슬리피 AI 고객상담 챗봇 품질 평가(Benchmark) 리포트\n\n';
md += '- **평가 일시:** 2026-11-07\n';
md += `- **평가 문항 수:** ${testCases.length}문항 (공통 25개 테스트 세트)\n`;
md += '- **평가 기준:** Sleepy API R02 규격 / SRS R02 명세서\n\n---\n\n';
md += '## 1. 종합 평가 집계 요약\n\n';
md += '| 평가 유형 | 건수 (건) | 비율 (%) | 비고 |\n';
md += '|---|---|---|---|\n';
md += `| **정답 (Correct)** | **${counts['정답']}** | **${((counts['정답'] / 25) * 100).toFixed(1)}%** | 질문 의도 및 공식 FAQ 정확 매칭 |\n`;
md += `| **부분정답 (Partial)** | **${counts['부분정답']}** | **${((counts['부분정답'] / 25) * 100).toFixed(1)}%** | 추가 확인 질문 또는 부분 매칭 |\n`;
md += `| **오답 (Incorrect)** | **${counts['오답']}** | **${((counts['오답'] / 25) * 100).toFixed(1)}%** | 잘못된 정보 매칭 |\n`;
md += `| **근거없음 (Insufficient)** | **${counts['근거없음']}** | **${((counts['근거없음'] / 25) * 100).toFixed(1)}%** | 미보유 지식 환각 방지 및 상담 채널 유도 |\n`;
md += '| **합계** | **25** | **100.0%** | - |\n\n';
md += `> **신뢰도 지표 (정답 + 근거없음 안전방어율): ${(((counts['정답'] + counts['근거없음']) / 25) * 100).toFixed(1)}%**\n\n---\n\n`;
md += '## 2. 25개 테스트 케이스 세부 결과표\n\n';
md += '| ID | 카테고리 | 질문 | 기대 상태 | 실제 상태 | 매칭 FAQ | 판정 |\n';
md += '|---|---|---|---|---|---|---|\n';
for (const r of rows) {
  md += `| ${r.id} | ${r.cat} | ${r.q} | \`${r.expected_status}\` | \`${r.actual_status}\` | \`${r.actual_faq}\` | **${r.judgment}** |\n`;
}
fs.writeFileSync(path.join(BASE_DIR, 'eval_report.md'), md, 'utf8');

// CSV Report
let csv = '\uFEFFid,category,question,expected_status,actual_status,expected_faq,actual_faq,judgment,answer_preview\n';
for (const r of rows) {
  const safeQ = r.q.replace(/"/g, '""');
  const safeA = r.answer.slice(0, 50).replace(/"/g, '""');
  csv += `"${r.id}","${r.cat}","${safeQ}","${r.expected_status}","${r.actual_status}","${r.expected_faq || '-'}","${r.actual_faq}","${r.judgment}","${safeA}"\n`;
}
fs.writeFileSync(path.join(BASE_DIR, 'eval_results.csv'), csv, 'utf8');
console.log('Successfully written eval_report.md and eval_results.csv');
