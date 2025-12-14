import { type ChangeEvent, type KeyboardEvent, type RefObject } from "react";
import { Message } from "../types";
import { TypingBubble } from "./TypingBubble";

type ChatPanelProps = {
  messages: Message[];
  input: string;
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onFinalize: () => void;
  botTyping: boolean;
  isLoading: boolean;
  listRef: RefObject<HTMLDivElement>;
  endRef: RefObject<HTMLDivElement>;
  progressPercentage: number;
  messageCount: number;
};

export function ChatPanel({
  messages,
  input,
  onInputChange,
  onKeyDown,
  onSend,
  onFinalize,
  botTyping,
  isLoading,
  listRef,
  endRef,
  progressPercentage,
  messageCount,
}: ChatPanelProps) {
  return (
    <div className="chat-card chat-mode">
      <div className="card-top">
        <div>
          <div className="eyebrow">대화 공간</div>
          <div className="card-title">지금 느끼는 마음을 편하게 알려주세요</div>
          <p className="card-subtext">
            필요한 경우 언제든 완료 버튼을 눌러 리포트를 확인할 수 있어요.
          </p>
        </div>
      </div>
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
            <div className="message-content">
              <div className="message-label">라포</div>
              <div className="message-bubble">
                안녕하세요! 라포와 함께 현재 기분이나 상태에 대해 편안하게 이야기해보세요. 요즘 어떤 점이 가장 힘드셨나요?
              </div>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`message ${m.role}`}
          >
            <div className="message-content">
              <div className="message-label">{m.role === "bot" ? "라포" : "나"}</div>
              <div className="message-bubble">
                {m.text}
              </div>
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
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            disabled={botTyping}
            rows={1}
          />
          <div className="button-row">
            <button
              onClick={onSend}
              className="send-button"
              disabled={botTyping || !input.trim() || isLoading}
            >
              전송
            </button>
            <button
              onClick={onFinalize}
              className="end-button"
              disabled={isLoading || botTyping}
            >
              {isLoading ? "분석 중..." : "완료"}
            </button>
          </div>
        </div>
        <div className="help-text">
          모든 대화는 익명으로 처리되며, 세션 종료 시 안전하게 삭제됩니다.<br/>
          응급상황시 ☎️ 1393 (자살예방상담전화) 또는 112에 연락하세요.
        </div>
      </div>
    </div>
  );
}
