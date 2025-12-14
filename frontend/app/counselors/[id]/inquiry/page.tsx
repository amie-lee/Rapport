"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { counselors } from "../../data";

type Props = { params: Promise<{ id: string }> };

export default function InquiryPage({ params }: Props) {
  const resolvedParams = use(params);
  const counselor = useMemo(
    () => counselors.find((c) => c.id === resolvedParams.id),
    [resolvedParams.id]
  );
  const [topic, setTopic] = useState<string>(counselor?.expertise[0] ?? "");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!counselor) {
    return (
      <div className="page-shell">
        <div className="section-card">
          <p className="card-body">상담사를 찾을 수 없습니다.</p>
          <Link href="/counselors" className="ghost-link strong">둘러보기로 이동</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="page-shell">
      <div className="header">
        <div className="logo-block">
          <div className="logo-mark">R</div>
          <div>
            <div className="logo">{counselor.name}님께 문의하기</div>
            <div className="subtitle">{counselor.responseTime} 응답</div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-head">
          <div>
            <div className="eyebrow">상담 의뢰</div>
            <h2 className="section-title">어떤 도움이 필요하신가요?</h2>
            <p className="card-subtext">
              문의 내용은 비공개로 상담사에게만 전달되며, 확인 후 응답을 보내드립니다.
            </p>
          </div>
        </div>

        <form className="inquiry-form" onSubmit={handleSubmit}>
          <label className="form-label">관심 분야</label>
          <div className="filter-chips">
            {counselor.expertise.map((tag) => (
              <button
                type="button"
                key={tag}
                className={`chip ${topic === tag ? "active" : "ghost"}`}
                onClick={() => setTopic(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <label className="form-label" style={{ marginTop: 16 }}>문의 내용</label>
          <textarea
            className="input-field"
            placeholder="상담을 원하시는 이유, 현재 겪고 계신 어려움, 희망하는 상담 방식 등을 자유롭게 작성해 주세요."
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {!submitted && (
            <button type="submit" className="pill-button wide" disabled={!message.trim()}>
              상담사에게 문의 보내기
            </button>
          )}
        </form>

        {submitted && (
          <div className="info-block" style={{ marginTop: 16, gap: 12 }}>
            <div className="info-title">문의가 성공적으로 전달되었습니다</div>
            <p className="info-body">{counselor.responseTime} 내로 상담사의 응답이 발송될 예정입니다.</p>
            <Link href="/counselors" className="ghost-link strong">다른 상담사 둘러보기</Link>
          </div>
        )}
      </div>
    </div>
  );
}
