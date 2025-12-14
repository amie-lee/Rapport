import { MetricKey } from "../types";

export function Bar({ value, type }: { value: number; type: MetricKey }) {
  return (
    <div className="metric-bar">
      <div
        className={`metric-bar-fill ${type}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
