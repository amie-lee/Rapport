import Link from "next/link";
import { notFound } from "next/navigation";
import { counselors } from "../data";

type Props = { params: { id: string } };

export default function CounselorDetail({ params }: Props) {
  const counselor = counselors.find((c) => c.id === params.id);
  if (!counselor) return notFound();

  return (
    <div className="page-shell">
      <div className="header">
        <div className="logo-block">
          <div>
            <div className="logo">{counselor.name}</div>
            <div className="subtitle">{counselor.title}</div>
          </div>
        </div>
        <div className="header-actions">
          <Link href="/counselors" className="icon-button" aria-label="목록으로 돌아가기">
            ←
          </Link>
        </div>
      </div>

      <div className="detail-hero">
        <div>
          <div className="eyebrow">상담 포커스</div>
          <h1 className="hero-title">{counselor.focus}</h1>
          <p className="card-body">{counselor.bio}</p>
          <div className="tag-row">
            {counselor.expertise.map((tag) => (
              <span key={tag} className="chip ghost">{tag}</span>
            ))}
          </div>
        </div>
        <div className="hero-actions">
          <Link href={`/counselors/${counselor.id}/inquiry`} className="pill-button">
            문의하기
          </Link>
        </div>
      </div>

      <div className="detail-grid">
        <div className="section-card">
          <div className="section-head">
            <div className="eyebrow">전문 정보</div>
            <h3 className="section-title">상담 분야 및 방식</h3>
          </div>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-label">전문 분야</div>
              <div className="info-value">{counselor.expertise.join(", ")}</div>
            </div>
            <div className="info-card">
              <div className="info-label">상담 방식</div>
              <div className="info-value">{counselor.formats.join(", ")}</div>
            </div>
            <div className="info-card">
              <div className="info-label">언어</div>
              <div className="info-value">{counselor.languages.join(", ")}</div>
            </div>
            <div className="info-card">
              <div className="info-label">응답 시간</div>
              <div className="info-value">{counselor.responseTime}</div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-head">
            <div className="eyebrow">상담 사례</div>
            <h3 className="section-title">이런 분들과 함께했어요</h3>
          </div>
          <ul className="info-list">
            <li>장기간 잠이 오지 않아 낮에도 피로감을 느끼는 분</li>
            <li>완벽주의로 인해 업무 속도가 느려져 걱정하는 분</li>
            <li>가족 갈등으로 대화가 단절된 상태를 회복하고 싶은 분</li>
            <li>직장 내 인간관계로 불안을 느끼는 분</li>
          </ul>
        </div>
      </div>

      <div className="detail-grid">
        <div className="section-card">
          <div className="section-head">
            <div className="eyebrow">경력 및 학력</div>
            <h3 className="section-title">전문 이력 한눈에 보기</h3>
          </div>
          <div className="bio-grid">
            <div>
              <div className="info-label">주요 경력</div>
              <ul className="bullet-list">
                {counselor.career.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <div className="info-label">학력</div>
              <ul className="bullet-list">
                {counselor.education.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <div className="info-label">자격증</div>
              <ul className="bullet-list">
                {counselor.certifications.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-head">
            <div className="eyebrow">상담 후기</div>
            <h3 className="section-title">내담자들이 남긴 한마디</h3>
          </div>
          <div className="testimonial-list">
            {counselor.testimonials.map((t, idx) => (
              <div key={idx} className="testimonial-card">
                <div className="testimonial-head">
                  <div className="avatar circle small">{t.name[0]}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="stars">{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</div>
                  </div>
                </div>
                <p className="card-body">{t.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
