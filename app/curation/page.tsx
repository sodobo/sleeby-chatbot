"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle2, RotateCcw, MessageSquare, ChevronRight, Moon, ShieldCheck, Zap } from "lucide-react";

interface StepOption {
  id: string;
  label: string;
  desc: string;
  icon: string;
}

const STEP_QUESTIONS = [
  {
    step: 1,
    title: "잠자리에 든 후, 잠들기까지 보통 얼마나 걸리시나요?",
    subtitle: "평소 취침 시 입면 시간(Sleep Latency)을 선택해 주세요.",
    options: [
      { id: "fast", label: "15분 이내", desc: "누우면 비교적 금방 잠드는 편이에요.", icon: "⚡" },
      { id: "medium", label: "30분 ~ 1시간", desc: "생각이 많거나 뒤척이다 잠들어요.", icon: "⏳" },
      { id: "slow", label: "1시간 이상", desc: "쉽게 잠들지 못하고 새벽까지 깬 적이 많아요.", icon: "🌙" },
    ],
  },
  {
    step: 2,
    title: "수면 중 밤에 깨어나는 빈도는 어느 정도인가요?",
    subtitle: "수면의 유지 상태 및 수면 분절 빈도를 확인합니다.",
    options: [
      { id: "rare", label: "거의 깨지 않음", desc: "아침 알람이 울릴 때까지 푹 자는 편이에요.", icon: "😴" },
      { id: "sometimes", label: "1 ~ 2회 깸", desc: "주변 미세 소음이나 뒤척임 때문에 가끔 깨요.", icon: "👂" },
      { id: "frequent", label: "3회 이상 자주 깸", desc: "자주 깨어나며, 한번 깨면 다시 자기 힘들어요.", icon: "⚠️" },
    ],
  },
  {
    step: 3,
    title: "수면 시 가장 선호하거나 필요로 하는 이완 방식은 무엇인가요?",
    subtitle: "고객님께 가장 잘 맞는 휴식 방식을 추천해 드립니다.",
    options: [
      { id: "sound", label: "잔잔한 뇌파 안정 음향", desc: "집중을 흩뜨리지 않고 마음에 평온을 주는 양이성 소리", icon: "🎵" },
      { id: "quiet", label: "생활 소음 완화 및 편안한 착용", desc: "귀에 무리가 가지 않으면서 옆으로 누워도 편안한 형태", icon: "🛌" },
      { id: "auto", label: "자동 꺼짐 타이머 기능", desc: "잠든 뒤 알아서 꺼져 신경 쓰지 않아도 되는 편리함", icon: "⏱️" },
    ],
  },
];

export default function CurationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSelectOption = (optionId: string) => {
    const nextAnswers = { ...answers, [currentStep]: optionId };
    setAnswers(nextAnswers);

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // 3단계 완료 시 진단 애니메이션 실행
      setAnalyzing(true);
      setTimeout(() => {
        setAnalyzing(false);
        setCompleted(true);
      }, 1200);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(1);
    setCompleted(false);
    setAnalyzing(false);
  };

  // 진단 결과 매핑 로직
  const getDiagnosisResult = () => {
    const step1 = answers[1];
    const step2 = answers[2];
    const step3 = answers[3];

    let diagnosisType = "입면 지연 및 긴장 완화 필요형";
    let summary = "취침 전 긴장감을 완화하고 뇌파를 수면 상태로 유도하는 케어가 가장 필요합니다.";
    let detailedTips = [
      "잠자리에 들기 전 양쪽 귀에 SLEEBY를 착용하고 내장된 양이성 음향에 몸을 맡겨보세요.",
      "약 30분 후 자동으로 전원이 차단되므로, 착용한 채 그대로 주무셔도 안전합니다 (FAQ 02 준수).",
      "만약 30분 후에도 잠이 오지 않는다면 충전 케이스에 1~2초 넣었다가 다시 꺼내 착용하시면 30분 음향이 다시 재생됩니다 (FAQ 04 준수)."
    ];

    if (step2 === "frequent" || step2 === "sometimes" || step3 === "quiet") {
      diagnosisType = "소음 민감 및 수면 분절 완화형";
      summary = "외부 미세 소음에 민감하여 수면 리듬이 끊기기 쉬운 패턴입니다.";
      detailedTips = [
        "동봉된 S/M/L 이어팁 중 본인 귀에 가장 편안하게 밀착되는 크기를 선택하여 착용해 주세요 (FAQ 18 준수).",
        "옆으로 누워 주무실 때도 귀에 배기지 않는 인체공학적 디자인으로 안정적인 수면 자세를 돕습니다 (FAQ 19 준수).",
        "외부 소리를 부드럽게 감쇄시키며 잔잔한 양이성 음향이 주변 소음을 차폐해 줍니다."
      ];
    } else if (step1 === "slow") {
      diagnosisType = "심화 입면 집중 케어형";
      summary = "수면 시작 단계에서 잡념이나 불면 패턴이 지속되는 상태입니다.";
      detailedTips = [
        "밤 취침 전뿐만 아니라, 낮 시간 피로 회복을 위한 15~30분의 짧은 낮잠/휴식 시에도 활용해 보세요 (FAQ 05 준수).",
        "SLEEBY는 매일 일상에서 반복 사용하셔도 안전하므로 수면 루틴으로 정착시키는 것을 추천합니다 (FAQ 06 준수).",
        "귀에 질환이나 통증이 있을 때는 무리하게 사용하지 마시고 전문의와 상담해 주세요 (FAQ 20 준수)."
      ];
    }

    return { diagnosisType, summary, detailedTips };
  };

  const result = getDiagnosisResult();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      {/* 상단 네비게이션 헤더 */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-pastel-700 hover:text-pastel-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>챗봇으로 돌아가기</span>
        </Link>
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-pastel-600" />
          <span className="text-sm font-bold text-slate-800">슬리피 수면 맞춤 큐레이션</span>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          title="진단 초기화"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">처음부터</span>
        </button>
      </header>

      {/* 메인 진단 컨테이너 */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        {!completed && !analyzing && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            {/* 진행 단계 표시 바 */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-xs font-semibold text-pastel-700 mb-2">
                <span>수면 패턴 진단</span>
                <span>STEP {currentStep} / 3</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-pastel-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* 질문 타이틀 */}
            <div className="mb-6">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
                {STEP_QUESTIONS[currentStep - 1].title}
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                {STEP_QUESTIONS[currentStep - 1].subtitle}
              </p>
            </div>

            {/* 선택 문항 카드 리스트 */}
            <div className="space-y-3">
              {STEP_QUESTIONS[currentStep - 1].options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-pastel-400 hover:bg-pastel-50/50 flex items-center justify-between transition-all group shadow-sm hover:shadow"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
                      {opt.icon}
                    </span>
                    <div>
                      <div className="font-bold text-sm md:text-base text-slate-800 group-hover:text-pastel-700">
                        {opt.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-pastel-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>

            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="mt-6 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← 이전 문항으로
              </button>
            )}
          </div>
        )}

        {/* 진단 분석 중 로딩 화면 */}
        {analyzing && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-pastel-100 flex items-center justify-center text-pastel-600 text-2xl animate-pulse">
              🌙
            </div>
            <h3 className="text-lg font-bold text-slate-800">고객님의 수면 패턴을 분석 중입니다...</h3>
            <p className="text-xs text-slate-500">
              슬리피 제품 데이터와 FAQ 지식을 기반으로 가장 이상적인 디지털 수면 솔루션을 도출하고 있습니다.
            </p>
            <div className="w-40 mx-auto bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
              <div className="bg-pastel-600 h-full rounded-full animate-indeterminate" />
            </div>
          </div>
        )}

        {/* 최종 큐레이션 추천 결과 화면 */}
        {completed && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
            {/* 결과 헤더 배지 */}
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pastel-100 text-pastel-700 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI 맞춤 수면 진단 완료</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">
                {result.diagnosisType}
              </h2>
              <p className="text-xs md:text-sm text-slate-600 mt-1.5 max-w-lg mx-auto">
                {result.summary}
              </p>
            </div>

            {/* 추천 제품 카드 */}
            <div className="p-5 bg-gradient-to-br from-pastel-50 to-blue-50/40 rounded-2xl border border-pastel-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-pastel-600 uppercase tracking-wider">
                  Recommended Device
                </span>
                <h3 className="text-base md:text-lg font-bold text-slate-900 mt-0.5">
                  (주)슬리피 디지털 수면·이완 디바이스
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  30분 자동 음향 타이머 • 양이성 바이노럴 비트 • 인체공학적 S/M/L 이어팁
                </p>
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-pastel-300 text-pastel-700 text-xs font-bold shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>공식 승인 제품</span>
                </span>
              </div>
            </div>

            {/* 맞춤형 사용 가이드 (FAQ 지식 기반) */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-pastel-600" />
                <span>고객님을 위한 3단계 맞춤 사용 팁</span>
              </h4>
              <ul className="space-y-2.5">
                {result.detailedTips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs md:text-sm text-slate-700 flex items-start gap-2.5 leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-pastel-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 액션 버튼 */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/"
                className="flex-1 py-3 px-4 bg-pastel-600 hover:bg-pastel-700 text-white rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>AI 고객상담 챗봇에서 더 물어보기</span>
              </Link>
              <button
                onClick={handleReset}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>다시 진단하기</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
