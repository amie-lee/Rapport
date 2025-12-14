export function TypingBubble() {
  return (
    <div className="message bot typing-row">
      <div className="avatar bot">라</div>
      <div className="message-content">
        <div className="message-label">라포</div>
        <div className="typing">
          <div className="typing-dots">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
