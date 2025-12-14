"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AuthProfile, loadProfile, touchLogin } from "../lib/authStorage";

const EMPTY_PROFILE: AuthProfile = {
  name: "라포 사용자",
  email: "",
  goal: "마음 상태 점검",
  preferredContact: "email",
  notifications: {
    sessionSummary: true,
    weeklyTips: false,
    emergencyAlerts: true,
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [storedProfile, setStoredProfile] = useState<AuthProfile | null>(null);
  const [status, setStatus] = useState<{ tone: "idle" | "success" | "info"; message: string }>({
    tone: "idle",
    message: "",
  });

  useEffect(() => {
    const saved = loadProfile();
    if (saved) {
      setStoredProfile(saved);
      setEmail(saved.email ?? "");
    }
  }, []);

  const hasSavedProfile = !!storedProfile;
  const canSubmit = email.trim() !== "" && password.trim() !== "";

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    const now = new Date().toISOString();
    const matched =
      storedProfile &&
      storedProfile.email === email.trim() &&
      (!storedProfile.password || storedProfile.password === password.trim());

    const profile: AuthProfile = matched
      ? touchLogin(
          { ...storedProfile, password: remember ? password.trim() : storedProfile.password },
          now,
        )
      : touchLogin(
          {
            ...EMPTY_PROFILE,
            name: storedProfile?.name || "라포 사용자",
            email: email.trim(),
            password: remember ? password.trim() : undefined,
            goal: storedProfile?.goal || "마음 상태 점검",
            preferredContact: storedProfile?.preferredContact || "email",
            notifications: storedProfile?.notifications ?? EMPTY_PROFILE.notifications,
          },
          now,
        );

    setStoredProfile(profile);
    setStatus({
      tone: matched ? "success" : "info",
      message: matched ? "저장된 계정으로 로그인했어요." : "로컬에 임시 계정을 만들고 로그인했습니다.",
    });
  };

  return (
    <div className="auth-shell">
      <div className="auth-header">
        <div>
          <div className="logo">라포</div>
          <p className="subtitle">로그인하고 진행 상황을 이어가세요</p>
        </div>
        <div className="auth-nav">
          <Link href="/" className="ghost-link strong">
            홈으로
          </Link>
          <Link href="/signup" className="pill-button">
            회원가입
          </Link>
        </div>
      </div>

      <div className="auth-grid">
        <form className="auth-card" onSubmit={handleLogin}>
          <div>
            <div className="eyebrow">로그인</div>
            <h1 className="auth-title">다시 만나 반가워요</h1>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="8자 이상 입력"
              required
            />
          </div>

          {status.tone !== "idle" && (
            <div className={`inline-alert ${status.tone === "success" ? "ok" : "neutral"}`}>
              {status.message}
            </div>
          )}

          <button type="submit" className="consent-button" disabled={!canSubmit}>
            로그인
          </button>
          <p className="helper-text">
            아직 계정이 없나요?{" "}
            <Link href="/signup" className="text-link">
              회원가입
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
