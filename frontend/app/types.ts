export type Message = { role: "user" | "bot"; text: string };

export type MetricKey = "depression" | "anxiety" | "stress";

export type ReportData = {
  summary: {
    conversation_summary?: string;
    top_issues?: string[];
    scores: Record<MetricKey, number>;
    risk: { level: number };
  };
  details: {
    highlights?: string[];
    disclaimer: string;
  };
  safety_notice: string;
};
