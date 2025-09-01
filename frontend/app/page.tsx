"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Message = { role: "user" | "bot"; text: string };

function Bar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded">
      <div
        className="h-2 rounded"
        style={{
          width: `${value}%`,
          background:
            value >= 70
              ? "#ef4444"
              : value >= 40
              ? "#f59e0b"
              : "#10b981",
        }}
      />
    </div>
  );
}

export default function Home() {
  // ----- state -----
  const [consented, setConsented] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [region, setRegion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [report, setReport] = useState<any | null>(null);

  // ----- handlers -----
  async function startSession() {
    try {
      const res = await fetch(`${API}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: true, region }),
      });
      if (!res.ok) throw new Error("세션 생성 실패");
      const data = await res.json();
      setSessionId(data.session_id);
      setConsented(true);
      setReport(null);
      setMessages([]);
    } catch (e: any) {
      alert(e.message || "세션 생성 중 오류");
    }
  }

  async function sendMessage() {
    if (!input.trim() || !sessionId) return;
    const userMsg: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    try {
      await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, text: input }),
      });
      setInput("");
    } catch {
      alert("메시지 전송 오류");
    }
  }

  async function finalize() {
    if (!sessionId) return;
    try {
      const res = await fetch(`${API}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      setReport(data.report);
    } catch {
      alert("리포트 생성 오류");
    }
  }

  function resetAll() {
    setReport(null);
    setSessionId(null);
    setMessages([]);
    setRegion("");
    setConsented(false);
    setInput("");
  }

  // ----- screens -----
  if (!consented) {
    return (
      <main className="p-6 max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">라포: 사전 점검 동의</h1>
        <p className="text-sm text-gray-600">
          라포는 상담 전 <b>사전 점검</b>을 위한 텍스트 대화 도구입니다.
          대화 원문은 세션 종료 시 삭제되며, 본 리포트는 진단·치료가 아닙니다.
        </p>
        <div className="space-y-2">
          <label className="text-sm">지역(선택, 시/구 텍스트)</label>
          <input
            className="border rounded p-2 w-full"
            placeholder="예: 서울 강남구"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>
        <button
          onClick={startSession}
          className="bg-black text-white rounded px-4 py-2"
        >
          동의하고 시작하기
        </button>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      {!report && (
        <>
          <h1 className="text-xl font-semibold">라포 · 텍스트 대화</h1>

          <div className="border rounded p-4 h-96 overflow-y-auto space-y-2 bg-white">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "text-right" : "text-left"}
              >
                <span
                  className={`inline-block px-3 py-2 rounded ${
                    m.role === "user"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              className="flex-1 border rounded p-2"
              placeholder="요즘 어떤 점이 가장 힘드셨나요?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-black text-white rounded px-4"
            >
              전송
            </button>
            <button
              type="button"
              onClick={finalize}
              className="border rounded px-4"
            >
              종료
            </button>
          </form>

          <p className="text-xs text-gray-500">
            * 서버는 입력을 마스킹하여 저장하며, 세션 종료 시 원문은 삭제됩니다.
          </p>
        </>
      )}

      {report && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">사전 점검 리포트</h2>

          <div className="border rounded p-4 bg-white text-sm space-y-3">
            <div className="mb-2">
              핵심 이슈: {report.summary.top_issues?.join(", ") || "없음"}
            </div>

            <div className="mb-1">우울 {report.summary.scores.depression}</div>
            <Bar value={report.summary.scores.depression} />
            <div className="mb-1 mt-2">불안 {report.summary.scores.anxiety}</div>
            <Bar value={report.summary.scores.anxiety} />
            <div className="mb-1 mt-2">스트레스 {report.summary.scores.stress}</div>
            <Bar value={report.summary.scores.stress} />

            {report.summary.risk.level >= 60 && (
              <div className={`mt-4 p-3 rounded text-sm ${
                report.summary.risk.level >= 80 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-amber-100 text-amber-700'}`}>
                {report.summary.risk.level >= 80 ? '고위험 신호가 감지되었습니다. ' : '주의가 필요한 신호가 감지되었습니다. '}
                {report.safety_notice}
              </div>
            )}

            {report.details.highlights?.length > 0 && (
              <div className="mb-2">
                <div className="font-medium">대화 하이라이트</div>
                <ul className="list-disc ml-5">
                  {report.details.highlights.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-gray-500">{report.details.disclaimer}</div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={resetAll} className="border rounded px-4 py-2">
              처음 화면으로
            </button>
            {/* <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'rapport_report.json'; a.click();
                URL.revokeObjectURL(url);
              }}
              className="border rounded px-4 py-2"
            >
              리포트 저장(JSON)
            </button> */}
          </div>

          <div className="mt-4 border-t pt-3 text-sm">
            <div className="font-medium mb-1">연결 가능한 도움</div>
            <p className="text-gray-600 mb-2">거주 지역의 정신건강복지센터/상담기관 정보를 제공할 예정입니다.</p>
            <div className="flex gap-2">
              <a className="border px-3 py-1 rounded" target="_blank" href="https://www.data.go.kr/data/3049990/fileData.do" rel="noreferrer">기관 검색(공공데이터)</a>
              <a className="border px-3 py-1 rounded" href="tel:1393">1393 전화하기</a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
