import re
from typing import List, Dict, Any

# ---- 위험 신호 ----
RISK_PATTERNS = [
    r"죽고\s*싶", r"생을\s*마감", r"자해", r"해치고\s*싶", r"폭력\s*충동",
    r"절망감", r"살\s*의미가\s*없", r"무가치", r"없어졌으면\s*하", r"사라지고\s*싶"
]
RISK_REGEX = [re.compile(p) for p in RISK_PATTERNS]

# ---- 주제 키워드 ----
THEMES: Dict[str, List[str]] = {
    "수면": [
        r"불면", r"잠[이도]?\s*안", r"잠을?\s*못", r"잠들기\s*어려",
        r"새벽(에)?\s*깨", r"악몽", r"수면", r"깨(었|요|요\.)"
    ],
    "업무/학업": [
        r"업무", r"야근", r"퇴근이?\s*늦", r"성과\s*압박", r"과제", r"시험", r"공부\s*스트레스",
        r"회사", r"출근", r"보고서"
    ],
    "대인/가족": [
        r"대인", r"사람\s*만나", r"친구", r"연인", r"갈등", r"가족", r"고립", r"혼자", r"외롭"
    ],
    "건강/신체": [
        r"두통", r"소화", r"심장[이]?\s*두근", r"숨(이)?\s*막히", r"호흡\s*곤란", r"가슴\s*답답",
        r"피로", r"무기력"
    ],
    "금전/생활": [
        r"돈\s*걱정", r"월세", r"대출", r"빚", r"생활비", r"가계"
    ],
}

# ---- 감정 키워드 ----
EMOTIONS: Dict[str, List[str]] = {
    "불안": [r"불안", r"초조", r"긴장", r"걱정", r"두렵"],
    "슬픔": [r"우울", r"슬픔", r"눈물", r"허무", r"외롭"],
    "분노": [r"화가", r"분노", r"짜증", r"억울"],
    "무기력": [r"의욕이?\s*없", r"무기력", r"피곤만", r"아무것도\s*하[지긴]\s*싫"],
    "희망": [r"괜찮아질", r"도움이\s*될", r"해볼\s*수\s*있", r"나아질"],
}

def _count_by_regex(text: str, patterns: List[str]) -> int:
    return sum(1 for p in patterns if re.search(p, text))

def analyze_messages(messages: List[str]) -> Dict[str, Any]:
    texts = [t.lower() for t in messages]

    # 1) 위험 탐지
    risk_hits = []
    for line in texts:
        for rx in RISK_REGEX:
            if rx.search(line):
                risk_hits.append(rx.pattern)
    risk_level = 80 if any(("죽고" in h) or ("자해" in h) for h in risk_hits) else (60 if risk_hits else 0)

    # 2) 주제 카운트
    theme_counts = {}
    for theme, pats in THEMES.items():
        theme_counts[theme] = sum(_count_by_regex(line, pats) for line in texts)

    # 3) 감정 카운트
    emotion_counts = {}
    for emo, pats in EMOTIONS.items():
        emotion_counts[emo] = sum(_count_by_regex(line, pats) for line in texts)

    # 4) 점수 산출 (간단 규칙 기반)
    def clamp(x): return max(0, min(100, int(x)))

    dep = 0
    dep += 20 * bool(emotion_counts["슬픔"])
    dep += 20 * bool(emotion_counts["무기력"])
    dep += 10 * min(theme_counts["수면"], 2)
    dep += 10 * (theme_counts["대인/가족"] > 1)
    dep += 30 if risk_level >= 60 else 0
    depression_score = clamp(dep)

    anx = 0
    anx += 25 * bool(emotion_counts["불안"])
    anx += 10 * min(theme_counts["건강/신체"], 2)
    anx += 10 * min(theme_counts["업무/학업"], 2)
    anx += 20 * bool(emotion_counts["무기력"])
    anx += 20 if risk_level >= 60 else 0
    anxiety_score = clamp(anx)

    stress = 0
    stress += 15 * min(theme_counts["업무/학업"], 2)
    stress += 15 * min(theme_counts["대인/가족"], 2)
    stress += 15 * min(theme_counts["금전/생활"], 2)
    stress += 15 * bool(emotion_counts["분노"])
    stress += 10 * min(theme_counts["수면"], 2)
    stress_score = clamp(stress)

    # 5) 상위 주제
    top_themes = sorted(theme_counts.items(), key=lambda x: x[1], reverse=True)
    top_themes = [t for t, c in top_themes if c > 0][:3]

    # 6) 하이라이트 (최근 메시지 중 키워드 포함 0~2개)
    highlights = []
    for m in messages[-5:]:
        for emo_list in EMOTIONS.values():
            if any(re.search(kw, m) for kw in emo_list):
                highlights.append(m)
                break
        if len(highlights) >= 2:
            break

    return {
        "scores": {
            "depression": depression_score,
            "anxiety": anxiety_score,
            "stress": stress_score,
        },
        "risk": {
            "level": risk_level,
            "hits": list(set(risk_hits)),
            "need_immediate_help": risk_level >= 80,
        },
        "themes": theme_counts,
        "top_themes": top_themes,
        "emotions": emotion_counts,
        "highlights": highlights,
    }
