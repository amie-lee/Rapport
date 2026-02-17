"use client";
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Header } from "./components/Header";
import { ConsentForm } from "./components/ConsentForm";
import { ChatPanel } from "./components/ChatPanel";
import { ReportView } from "./components/ReportView";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { Message, ReportData } from "./types";

const API = process.env.NEXT_PUBLIC_API_BASE || "";

export default function Home() {
  // ----- state -----
  const [consented, setConsented] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [region, setRegion] = useState("");
  const [occupation, setOccupation] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [report, setReport] = useState<ReportData | null>(null);
  const [botTyping, setBotTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const endRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  
  function scrollToBottom(smooth = true) {
    endRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, botTyping]);

  // 첫 렌더에서는 점프(부드러운 스크롤 X)
  useEffect(() => {
    scrollToBottom(false);
  }, []);

  
  // ----- handlers -----
  async function startSession() {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent: true,
          region,
          occupation,
          gender,
          ageGroup
        }),
      });
      if (!res.ok) throw new Error("세션 생성 실패");
      const data = await res.json();
      setSessionId(data.session_id);
      setConsented(true);
      setReport(null);
      setMessages([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "세션 생성 중 오류";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || !sessionId) return;

    const userText = input;
    setInput("");
    const userMsg: Message = { role: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);

    // Update progress
    const newMessageCount = messageCount + 1;
    setMessageCount(newMessageCount);
    setProgressPercentage(Math.min((newMessageCount / 10) * 100, 100));

    try {
      setBotTyping(true);
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, text: userText }),
      });
      const data = await res.json();

      // ⬇️ 봇 응답 추가
      const botMsg: Message = { role: "bot", text: data.assistant };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      alert("메시지 전송 오류");
    } finally {
      setBotTyping(false);
    }
  }

  async function finalize() {
    if (!sessionId) return;
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }

  function resetAll() {
    setReport(null);
    setSessionId(null);
    setMessages([]);
    setRegion("");
    setOccupation("");
    setGender("");
    setAgeGroup("");
    setConsented(false);
    setInput("");
    setMessageCount(0);
    setProgressPercentage(0);
  }

  // Auto-resize textarea
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ----- screens -----
  if (!consented) {
    return (
      <div className="consent-container">
        {isLoading && <LoadingOverlay message="세션을 생성하고 있습니다..." />}
        <Header subtitle="AI 기반 심리 상태 사전 점검" />
        <ConsentForm
          gender={gender}
          ageGroup={ageGroup}
          occupation={occupation}
          region={region}
          onGenderChange={setGender}
          onAgeGroupChange={setAgeGroup}
          onOccupationChange={setOccupation}
          onRegionChange={setRegion}
          onStart={startSession}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="container">
      {isLoading && <LoadingOverlay message="결과를 분석하고 있습니다..." />}
      {!report && (
        <>
          <Header subtitle="AI 기반 심리 상태 사전 점검"/>

          <ChatPanel
            messages={messages}
            input={input}
            onInputChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onSend={sendMessage}
            onFinalize={finalize}
            botTyping={botTyping}
            isLoading={isLoading}
            listRef={listRef}
            endRef={endRef}
            progressPercentage={progressPercentage}
            messageCount={messageCount}
          />
        </>
      )}

      {report && (
        <>
          <Header subtitle="사전 점검 완료" />

          <ReportView report={report} onRestart={resetAll} />
        </>
      )}
    </div>
  );
}
