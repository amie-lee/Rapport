"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { AuthProfile, saveProfile } from "../lib/authStorage";

const GOALS = ["정기 자가점검", "상담 준비", "불안·우울 관리", "스트레스 관리"];

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState(GOALS[0]);
  const [preferredContact, setPreferredContact] = useState<"email" | "sms" | "none">("email");
  const [consent, setConsent] = useState({ terms: true, marketing: false });
  const [status, setStatus] = useState<string>("");

  const canSubmit = useMemo(() => {
    return name.trim() !== "" && email.trim() !== "" && password.trim().length >= 8 && phone.trim() !== "" && consent.terms;
  }, [name, email, password, consent.terms]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    const profile: AuthProfile = {
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      phone: phone.trim(),
      goal,
      preferredContact,
      notifications: {
        sessionSummary: true,
        weeklyTips: consent.marketing,
        emergencyAlerts: true,
      },
      lastLogin: new Date().toISOString(),
    };

    saveProfile(profile);
    setStatus("가입 정보가 이 기기에 저장되었습니다. 로그인 없이 바로 마이페이지를 확인할 수 있어요.");
  };

  return (
    <div className="auth-shell">
      <div className="auth-header">
        <div>
          <div className="logo">라포</div>
          <p className="subtitle">몇 가지 정보만 입력하면 바로 시작할 수 있어요</p>
        </div>
        <div className="auth-nav">
          <Link href="/login" className="ghost-link strong">
            로그인
          </Link>
          <Link href="/" className="pill-button">
            홈으로
          </Link>
        </div>
      </div>

      <div className="auth-grid">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div>
            <div className="eyebrow">회원가입</div>
            <h1 className="auth-title">라포와 함께 마음 돌봄 시작하기</h1>
          </div>

          <div className="input-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                이름
              </label>
              <input
                id="name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="goal">
                목표
              </label>
              <select
                id="goal"
                className="form-input"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              >
                {GOALS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상 입력"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              휴대폰
            </label>
            <input
              id="phone"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-1234-5678"
            />
          </div>

          {/* <div className="pill-row">
            <button
              type="button"
              className={`pill ${preferredContact === "email" ? "" : "subtle"}`}
              onClick={() => setPreferredContact("email")}
            >
              이메일 알림
            </button>
            <button
              type="button"
              className={`pill ${preferredContact === "sms" ? "" : "subtle"}`}
              onClick={() => setPreferredContact("sms")}
            >
              문자 알림
            </button>
            <button
              type="button"
              className={`pill ${preferredContact === "none" ? "" : "subtle"}`}
              onClick={() => setPreferredContact("none")}
            >
              알림 받지 않음
            </button>
          </div> */}

          <div className="toggle-list" style={{ padding: "1rem 0" }}>
            <label className={`toggle ${consent.terms ? "active" : ""}`}>
              <input
                type="checkbox"
                checked={consent.terms}
                onChange={(e) => setConsent({ ...consent, terms: e.target.checked })}
              />
              <span>이용 약관 및 개인정보 처리 방침 동의 (필수)</span>
            </label>
            <label className={`toggle ${consent.marketing ? "active" : ""}`}>
              <input
                type="checkbox"
                checked={consent.marketing}
                onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })}
              />
              <span>마케팅 알림 수신 동의 (선택)</span>
            </label>
          </div>

          {status && <div className="inline-alert ok">{status}</div>}

          <button type="submit" className="consent-button" disabled={!canSubmit}>
            회원가입 완료
          </button>
          <p className="helper-text">
            이미 계정이 있다면 <Link href="/login" className="text-link">로그인</Link>
          </p>
        </form>

      </div>
    </div>
  );
}
