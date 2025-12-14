"use client";

import { useMemo, useState } from "react";
import { counselors } from "./data";
import { CounselorCard } from "../components/CounselorCard";

const ALL = "전체";

export default function CounselorsPage() {
  const [selected, setSelected] = useState<string>(ALL);
  const [search, setSearch] = useState("");

  const specialties = useMemo(() => {
    const all = counselors.flatMap((c) => c.expertise);
    const unique = Array.from(new Set(all));
    return [ALL, ...unique];
  }, []);

  const filtered = useMemo(() => {
    if (selected === ALL) return counselors;
    return counselors.filter((c) => c.expertise.includes(selected));
  }, [selected]);

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return filtered;
    return filtered.filter((c) => {
      const haystack = `${c.name} ${c.title} ${c.expertise.join(" ")} ${c.focus}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [filtered, search]);

  return (
    <div className="page-shell">
      <div className="header">
        <div className="logo-block">
          <div>
            <div className="logo">라포</div>
            <div className="subtitle">내 고민에 맞는 상담사를 찾아보세요</div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-head">
          <div>
            <h2 className="section-title">전문 분야로 찾아보기</h2>
            <p className="card-subtext">
              내 고민과 가장 맞는 전문 분야를 선택하면, 맞춤형 상담사를 빠르게 찾을 수 있어요.
            </p>
          </div>
        </div>
        <div className="filter-bar">
          <div className="filter-select-wrapper">
            <select 
              className="filter-select"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {specialties.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>
          <div className="search">
            <span>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="상담사 이름이나 전문 분야로 검색해보세요"
            />
          </div>
        </div>
        <div className="card-grid">
          {visible.map((c) => (
            <CounselorCard key={c.id} counselor={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
