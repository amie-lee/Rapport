import Link from "next/link";
import { ReportData } from "../types";
import { Bar } from "./Bar";

type ReportViewProps = {
  report: ReportData;
  onRestart: () => void;
};

export function ReportView({ report, onRestart }: ReportViewProps) {
  return (
    <div className="chat-card results-mode">
      <div className="results-screen">
        <h2 className="results-title">사전 점검 결과</h2>

        {report.summary.conversation_summary && (
          <div className="info-block">
            <div className="info-title">💬 대화 요약</div>
            <p className="info-body">
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
            <div className="warning-title">⚠️ 주의사항</div>
            <p>
              {report.summary.risk.level >= 80 ? '고위험 신호가 감지되었습니다. ' : '주의가 필요한 신호가 감지되었습니다. '}
              {report.safety_notice}
            </p>
          </div>
        )}

        {report.details.highlights && report.details.highlights.length > 0 && (
          <div className="info-block">
            <div className="info-title">대화 하이라이트</div>
            <ul className="info-list">
              {report.details.highlights.map((h: string, i: number) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
        )}

        {report.summary.top_issues && report.summary.top_issues.length > 0 && (
          <div className="info-block">
            <div className="info-title">핵심 이슈</div>
            <p className="info-body">{report.summary.top_issues.join(', ')}</p>
          </div>
        )}

        <p className="info-footnote">
          본 결과는 상담 전 참고용 사전 점검 자료이며, 의학적 진단이나 치료를 대체하지 않습니다.
        </p>

        <div style={{ gap: "1rem", display: "flex", justifyContent: "center" }}>
          <button onClick={onRestart} className="restart-button">
            처음 화면으로
          </button>
          <Link href="/counselors" className="link-button">나에게 맞는 상담사 찾기</Link>
        </div>

        {/* <div className="resource-block">
          <div className="resource-title">연결 가능한 도움</div>
          <p className="info-body">거주 지역의 정신건강복지센터/상담기관 정보를 제공할 예정입니다.</p>
          <div className="resource-links">
            <a
              className="ghost-link"
              target="_blank"
              href="https://www.data.go.kr/data/3049990/fileData.do"
              rel="noreferrer"
            >
              기관 검색(공공데이터)
            </a>
            <a
              className="ghost-link"
              href="tel:1393"
            >
              1393 전화하기
            </a>
          </div>
        </div> */}
      </div>
    </div>
  );
}
