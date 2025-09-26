"use client";
import { useEffect, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Message = { role: "user" | "bot"; text: string };

type ReportData = {
  summary: {
    conversation_summary?: string;
    top_issues?: string[];
    scores: {
      depression: number;
      anxiety: number;
      stress: number;
    };
    risk: {
      level: number;
    };
  };
  details: {
    highlights?: string[];
    disclaimer: string;
  };
  safety_notice: string;
};

function Bar({ value, type }: { value: number; type: 'depression' | 'anxiety' | 'stress' }) {
  return (
    <div className="metric-bar">
      <div
        className={`metric-bar-fill ${type}`}
        style={{
          width: `${value}%`,
        }}
      />
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="message bot">
      <div className="typing">
        <div className="typing-dots">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </div>
  );
}

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
    setOccupation("");
    setGender("");
    setAgeGroup("");
    setConsented(false);
    setInput("");
    setMessageCount(0);
    setProgressPercentage(0);
  }

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ----- screens -----
  if (!consented) {
    return (
      <div className="consent-container">
        <div className="header">
          <div className="logo">라포</div>
          <div className="subtitle">AI 기반 심리 상태 사전 점검</div>
        </div>
        <div className="consent-card">
          <h1 className="consent-title">사전 점검 동의</h1>
          <p className="consent-description">
            라포는 상담 전 <strong>사전 점검</strong>을 위한 텍스트 대화 도구입니다.
            대화 원문은 세션 종료 시 삭제되며, 본 리포트는 진단·치료가 아닙니다.
          </p>
          <div className="form-group">
            <label className="form-label">성별 <span className="required">*</span></label>
            <select
              className="form-input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">선택하세요</option>
              <option value="남성">남성</option>
              <option value="여성">여성</option>
              <option value="기타">기타</option>
              <option value="선택안함">선택하지 않음</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">연령대 <span className="required">*</span></label>
            <select
              className="form-input"
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              required
            >
              <option value="">선택하세요</option>
              <option value="10대">10대</option>
              <option value="20대">20대</option>
              <option value="30대">30대</option>
              <option value="40대">40대</option>
              <option value="50대">50대</option>
              <option value="60대 이상">60대 이상</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">직업 <span className="required">*</span></label>
            <select
              className="form-input"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              required
            >
              <option value="">선택하세요</option>
              <option value="학생">학생</option>
              <option value="직장인">직장인</option>
              <option value="자영업">자영업</option>
              <option value="전문직">전문직 (의사, 변호사, 교수 등)</option>
              <option value="공무원">공무원</option>
              <option value="프리랜서">프리랜서</option>
              <option value="주부">주부</option>
              <option value="무직">무직</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">지역 (선택)</label>
            <input
              className="form-input"
              placeholder="예: 서울 강남구"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>
          <button
            onClick={startSession}
            className="consent-button"
            disabled={!gender || !ageGroup || !occupation}
          >
            동의하고 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {!report && (
        <>
          <div className="header">
            <div className="logo">라포</div>
            <div className="subtitle">AI 기반 심리 상태 사전 점검</div>
          </div>

          <div className="chat-card chat-mode">
            <div className="progress-container">
              <div className="progress-label">
                <span>진행 상황</span>
                <span>{messageCount}/10 질문</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>

            <div className="messages" ref={listRef}>
              {messages.length === 0 && (
                <div className="message bot">
                  <div className="message-bubble">
                    안녕하세요! 라포와 함께 현재 기분이나 상태에 대해 편안하게 이야기해보세요. 요즘 어떤 점이 가장 힘드셨나요?
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`message ${m.role}`}
                >
                  <div className="message-bubble">
                    {m.text}
                  </div>
                </div>
              ))}
              {botTyping && <TypingBubble />}
              <div ref={endRef} />
            </div>

            <div className="input-area">
              <div className="input-container">
                <textarea
                  className="input-field"
                  placeholder="자유롭게 답변해 주세요..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={botTyping}
                  rows={1}
                />
                <div className="button-row">
                  <button
                    onClick={sendMessage}
                    className="send-button"
                    disabled={botTyping || !input.trim()}
                  >
                    전송
                  </button>
                  <button
                    onClick={finalize}
                    className="end-button"
                  >
                    완료
                  </button>
                </div>
              </div>
              <div className="help-text">
                모든 대화는 익명으로 처리되며, 세션 종료 시 안전하게 삭제됩니다.<br/>
                응급상황시 ☎️ 1393 (자살예방상담전화) 또는 112에 연락하세요.
              </div>
            </div>
          </div>
        </>
      )}

      {report && (
        <>
          <div className="header">
            <div className="logo">라포</div>
            <div className="subtitle">사전 점검 완료</div>
          </div>

          <div className="chat-card results-mode">
            <div className="results-screen">
              <h2 className="results-title">사전 점검 결과</h2>

              {report.summary.conversation_summary && (
                <div style={{ background: '#f6f8fa', border: '1px solid #e1e4e8', borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, marginBottom: '12px', color: '#24292e', fontSize: '1rem' }}>
                    💬 대화 요약
                  </div>
                  <p style={{ color: '#586069', lineHeight: 1.6, margin: 0 }}>
                    {report.summary.conversation_summary}
                  </p>
                </div>
              )}

              <div className="metrics">
                <div className="metric">
                  <div className="metric-name">우울 지수</div>
                  <div className="metric-value">{report.summary.scores.depression} / 100</div>
                  <Bar value={report.summary.scores.depression} type="depression" />
                </div>

                <div className="metric">
                  <div className="metric-name">불안 지수</div>
                  <div className="metric-value">{report.summary.scores.anxiety} / 100</div>
                  <Bar value={report.summary.scores.anxiety} type="anxiety" />
                </div>

                <div className="metric">
                  <div className="metric-name">스트레스 지수</div>
                  <div className="metric-value">{report.summary.scores.stress} / 100</div>
                  <Bar value={report.summary.scores.stress} type="stress" />
                </div>
              </div>

              {report.summary.risk.level >= 60 && (
                <div className="warning-box">
                  <strong>⚠️ 주의사항</strong><br/>
                  {report.summary.risk.level >= 80 ? '고위험 신호가 감지되었습니다. ' : '주의가 필요한 신호가 감지되었습니다. '}
                  {report.safety_notice}
                </div>
              )}

              {report.details.highlights && report.details.highlights.length > 0 && (
                <div style={{ color: '#586069', marginBottom: '24px', lineHeight: 1.6, textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, marginBottom: '12px', color: '#24292e' }}>대화 하이라이트</div>
                  <ul style={{ listStyle: 'disc', marginLeft: '20px' }}>
                    {report.details.highlights.map((h: string, i: number) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.summary.top_issues && report.summary.top_issues.length > 0 && (
                <div style={{ color: '#586069', marginBottom: '24px', lineHeight: 1.6, textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, marginBottom: '12px', color: '#24292e' }}>핵심 이슈</div>
                  <p>{report.summary.top_issues.join(', ')}</p>
                </div>
              )}

              <p style={{ color: '#586069', marginBottom: '24px', lineHeight: 1.6 }}>
                본 결과는 상담 전 참고용 사전 점검 자료이며, 의학적 진단이나 치료를 대체하지 않습니다.
              </p>

              <button onClick={resetAll} className="restart-button">
                처음 화면으로
              </button>

              <div style={{ marginTop: '32px', borderTop: '1px solid #e1e4e8', paddingTop: '24px', fontSize: '0.9rem', textAlign: 'left' }}>
                <div style={{ fontWeight: 600, marginBottom: '12px', color: '#24292e' }}>연결 가능한 도움</div>
                <p style={{ color: '#586069', marginBottom: '16px' }}>거주 지역의 정신건강복지센터/상담기관 정보를 제공할 예정입니다.</p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <a
                    style={{
                      border: '2px solid #e1e4e8',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#586069',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s ease'
                    }}
                    target="_blank"
                    href="https://www.data.go.kr/data/3049990/fileData.do"
                    rel="noreferrer"
                  >
                    기관 검색(공공데이터)
                  </a>
                  <a
                    style={{
                      border: '2px solid #e1e4e8',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#586069',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s ease'
                    }}
                    href="tel:1393"
                  >
                    1393 전화하기
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
