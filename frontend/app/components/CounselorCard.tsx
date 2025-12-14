import Link from "next/link";
import { Counselor } from "../counselors/data";

export function CounselorCard({ counselor }: { counselor: Counselor }) {
  const averageRating = counselor.testimonials.length > 0
    ? (counselor.testimonials.reduce((sum, t) => sum + t.rating, 0) / counselor.testimonials.length).toFixed(1)
    : null;

  return (
    <div className="counselor-card">
      <div>
        <div className="card-headline">
          <div>
            <div className="card-title-row">
              <div>
                <h3 className="card-title-sm">{counselor.name}</h3>
                
              </div>
            </div>
          </div>
          {averageRating && (
            <div className="rating-badge">
              <span className="star">⭐</span>
              <span className="rating-value">{averageRating}</span>
            </div>
          )}
        </div>
        <p className="card-subtext">{counselor.title}</p>
      </div>

      <p className="card-body">{counselor.bio}</p>

      <div className="tag-row">
        {counselor.expertise.slice(0, 4).map((tag) => (
          <span key={tag} className="chip ghost">{tag}</span>
        ))}
      </div>

      <div className="card-actions">
        <div className="meta-row">
          <div className="meta-item">
            <span className="meta-icon">📍</span>
            <span>{counselor.location}</span>
          </div>
        </div>
        <div className="action-buttons">
          <Link href={`/counselors/${counselor.id}`} className="ghost-link strong">
            프로필 보기
          </Link>
          <Link href={`/counselors/${counselor.id}/inquiry`} className="pill-button">
            문의하기
          </Link>
        </div>
      </div>
    </div>
  );
}
