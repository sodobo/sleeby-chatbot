import { NextRequest, NextResponse } from "next/server";
import { isValidSessionId } from "@/lib/session";

// 전화 상담 신청 접수 (프로토타입)
// ※ 현재는 형식 검증 후 접수 번호만 반환합니다. 번호는 저장·로그 기록하지 않으며,
//   실제 상담원 전달(CRM/알림 연동)은 운영 단계에서 이 라우트에 연결해야 합니다.

// 한국 휴대폰/지역번호 형식 (하이픈 유무 허용)
const PHONE_PATTERN = /^0(?:1[016-9]|2|[3-6][1-5]|70)-?\d{3,4}-?\d{4}$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

  if (!phone || !PHONE_PATTERN.test(phone)) {
    return NextResponse.json(
      { error: { code: "INVALID_PHONE", message: "올바른 전화번호를 입력해 주세요. (예: 010-1234-5678)" } },
      { status: 400 }
    );
  }

  const sessionId = isValidSessionId(body?.session_id) ? body.session_id : null;
  const ticketId = "CB-" + Date.now().toString(36).toUpperCase();

  return NextResponse.json(
    {
      status: "received",
      ticket_id: ticketId,
      session_id: sessionId,
      expected_wait: "약 3~5분",
      message: "전화 상담 신청이 접수되었습니다. 상담원이 순차적으로 연락드릴게요.",
    },
    { status: 200 }
  );
}
