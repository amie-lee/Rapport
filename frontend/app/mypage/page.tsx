"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AuthProfile, clearProfile, loadProfile, saveProfile } from "../lib/authStorage";

const DEFAULT_PROFILE: AuthProfile = {
  name: "라포 체험자",
  email: "guest@rapport.app",
  goal: "정기 자가점검",
  phone: "010-0000-0000",
  preferredContact: "none",
  notifications: {
    sessionSummary: true,
    weeklyTips: false,
    emergencyAlerts: true,
  },
  lastLogin: new Date().toISOString(),
  memo: "나중에 상담 전 사전 점검을 활용해보기",
};

export default function MyPage() {
  const [profile, setProfile] = useState<AuthProfile>(DEFAULT_PROFILE);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const saved = loadProfile();
    if (saved) {
      setProfile({ ...DEFAULT_PROFILE, ...saved });
    }
  }, []);

  const formattedLogin = useMemo(() => {
    return profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : "기록 없음";
  }, [profile.lastLogin]);

  const updateProfile = (changes: Partial<AuthProfile>) => {
    const next = { ...profile, ...changes };
    setProfile(next);
    saveProfile(next);
    setFeedback("변경사항을 로컬에 저장했어요.");
  };

  const resetProfile = () => {
    clearProfile();
    setProfile(DEFAULT_PROFILE);
    setFeedback("로컬에 저장된 계정을 모두 비웠어요.");
  };

  return (
    <div className="auth-shell">
      <div className="auth-header">
        <div>
          <div className="logo">라포</div>
          <p className="subtitle">내 정보와 알림을 한눈에 관리하세요</p>
        </div>
        <div className="auth-nav">
          <Link href="/" className="ghost-link strong">
            사전 점검
          </Link>
          <Link href="/counselors" className="ghost-link strong">
            상담사 찾기
          </Link>
        </div>
      </div>

      <div className="profile-hero">
        <div>
          <div className="eyebrow">마이페이지</div>
          <h1 className="auth-title">{profile.name}님</h1>
          <p className="card-subtext">저장된 계정 정보는 이 기기에서만 보관됩니다.</p>
        </div>
        {/* <div className="hero-actions">
          <Link href="/signup" className="ghost-link strong">
            정보 다시 입력
          </Link>
          <button className="pill-button" type="button" onClick={resetProfile}>
            로컬 데이터 초기화
          </button>
        </div> */}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="muted-label">최근 점검</div>
          <div className="stat-value">3회</div>
          <p className="card-subtext">임시 데이터입니다. 실제 기록은 백엔드 연동 후 보여줄 예정이에요.</p>
        </div>
        <div className="stat-card">
          <div className="muted-label">즐겨찾는 상담사</div>
          <div className="stat-value">2명</div>
          <p className="card-subtext">상담사 상세 페이지에서 문의하기를 눌러보세요.</p>
        </div>
      </div>

      <div className="auth-grid">
        <div className="auth-card">
          <div className="eyebrow">기본 정보</div>
          <h2 className="auth-title-sm">연락처와 목표</h2>
          <div className="input-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                휴대폰
              </label>
              <input
                id="phone"
                className="form-input"
                value={profile.phone || ""}
                onChange={(e) => updateProfile({ phone: e.target.value })}
                placeholder="010-1234-5678"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="goal">
                목표
              </label>
              <select
                id="goal"
                className="form-input"
                value={profile.goal}
                onChange={(e) => updateProfile({ goal: e.target.value })}
              >
                <option>정기 자가점검</option>
                <option>상담 준비</option>
                <option>불안·우울 관리</option>
                <option>스트레스 관리</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="memo">
              메모
            </label>
            <textarea
              id="memo"
              className="form-input"
              rows={3}
              value={profile.memo || ""}
              onChange={(e) => updateProfile({ memo: e.target.value })}
              placeholder="예) 매주 월요일 아침에 짧게 점검하기"
            />
          </div>
          {feedback && <div className="inline-alert ok">{feedback}</div>}
        </div>
      </div>
    </div>
  );
}
