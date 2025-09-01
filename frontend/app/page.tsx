"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Message = { role: "user" | "bot"; text: string };

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

          <div className="border rounded p-4 bg-white text-sm">
            <div className="mb-2">
              핵심 이슈: {report.summary.top_issues?.join(", ") || "없음"}
            </div>
            <div className="mb-2">
              지표(0–100): 우울 {report.summary.scores.depression} · 불안{" "}
              {report.summary.scores.anxiety} · 스트레스{" "}
              {report.summary.scores.stress}
            </div>
            {report.summary.risk.level >= 60 && (
              <div className="mb-2 text-red-600">
                위험 신호 감지(레벨 {report.summary.risk.level}).{" "}
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

          <div className="flex justify-end">
            <button onClick={resetAll} className="border rounded px-4 py-2">
              처음 화면으로
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
