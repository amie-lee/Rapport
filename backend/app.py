# app.py  — LM Studio(OpenAI 호환 API) 버전
from __future__ import annotations

import os
import re
import uuid
import requests
from typing import Dict, List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# -----------------------------------------------------------------------------
# 환경 변수 로드
# -----------------------------------------------------------------------------
load_dotenv()

# 프론트 도메인(CORS)
_front = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
API_ORIGINS = [o.strip() for o in _front.split(",") if o.strip()]

# LM Studio(OpenAI 호환) 서버 설정
OPENAI_BASE = os.getenv("OPENAI_BASE", "http://localhost:1234/v1")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "Qwen2.5-7B-Instruct")

# -----------------------------------------------------------------------------
# 시스템 프롬프트 (한국어 톤 + 간결한 진행)
# -----------------------------------------------------------------------------
SYSTEM_PROMPT = """
너는 심리상담 전 내담자의 심리 상태 '사전 점검'을 돕는 한국어 챗봇 라포야.

목표
- 사용자가 편안하게 현재 상태를 이야기하도록 돕고, 필요한 정보를 한 번에 한 가지씩 묻는다.
- 사용자의 스트레스, 우울, 불안 등 심리 상태를 파악한다.

말투 지침
- 친근하고 따뜻하지만 과장되지 않은 존댓말.
- 교훈적·분석적 설명, 의학적 판단/진단/처방/약물 조언은 금지.
- 반드시 한국어만 사용하고 외국어·한자는 쓰지 않는다.

출력 형식
- 정확히 2문장: 공감 1문장 + 구체적 질문 1문장.
- 목록/헤더/코드블록은 사용하지 않는다.

예시
"잠을 잘 못 주무셔서 많이 힘드셨을 것 같아요. 이런 증상이 언제부터 시작되었는지 기억나시나요?"
"""

# -----------------------------------------------------------------------------
# FastAPI 설정
# -----------------------------------------------------------------------------
app = FastAPI(title="Rapport MVP API (LM Studio)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=API_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# 세션 저장소(메모리)
# -----------------------------------------------------------------------------
# SESSIONS[sid] = {"messages": [{"role":"user"|"assistant","content":"..."}], "region": "..."}
SESSIONS: Dict[str, Dict] = {}

# -----------------------------------------------------------------------------
# 스키마
# -----------------------------------------------------------------------------
class CreateSessionReq(BaseModel):
    consent: bool
    region: str | None = None

class CreateSessionRes(BaseModel):
    session_id: str

class ChatReq(BaseModel):
    session_id: str
    text: str

class ChatRes(BaseModel):
    assistant: str

class FinalizeReq(BaseModel):
    session_id: str


# -----------------------------------------------------------------------------
# PII 마스킹(보수적)
# -----------------------------------------------------------------------------
PHONE_RE = re.compile(r"(01[016789]|02|0[3-9]\d)-?\d{3,4}-?\d{4}")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
# 이름은 '님/씨' 호칭이 붙은 경우만 치환
NAME_RE  = re.compile(r'(?<![가-힣])([가-힣]{2,4})(님|씨)(?=\s|$)')

def pii_mask(text: str) -> str:
    masked = PHONE_RE.sub("<PHONE>", text)
    masked = EMAIL_RE.sub("<EMAIL>", masked)
    masked = NAME_RE.sub("<NAME>", masked)
    return masked


# -----------------------------------------------------------------------------
# LLM 호출 (LM Studio OpenAI 호환 서버)
# -----------------------------------------------------------------------------
def llm_reply(history: List[Dict[str, str]]) -> str:
    """
    history: [{"role":"user"|"assistant","content":"..."}]
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += history[-8:]  # 최근 8턴만 유지(컨텍스트/속도 최적화)

    try:
        r = requests.post(
            f"{OPENAI_BASE}/chat/completions",
            json={
                "model": OPENAI_MODEL,
                "messages": messages,
                "temperature": 0.6,
                "top_p": 0.9,
            },
            timeout=60,
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print("LLM error:", e)
        # 모델 불가 시에도 UX가 끊기지 않도록 기본 안내
        return "말씀해 주셔서 감사합니다. 최근에 힘드셨던 상황 한 가지를 예로 들어 주실 수 있을까요?"


# -----------------------------------------------------------------------------
# 분석 모듈 (룰 기반)
# -----------------------------------------------------------------------------
from analyzer import analyze_messages  # 같은 디렉터리의 analyzer.py 사용


# -----------------------------------------------------------------------------
# 엔드포인트
# -----------------------------------------------------------------------------
@app.post("/session", response_model=CreateSessionRes)
def create_session(req: CreateSessionReq):
    if not req.consent:
        raise HTTPException(status_code=400, detail="Consent required.")
    sid = str(uuid.uuid4())
    SESSIONS[sid] = {"messages": [], "region": (req.region or "").strip()}
    return CreateSessionRes(session_id=sid)


@app.post("/chat", response_model=ChatRes)
def chat(req: ChatReq):
    if req.session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Invalid session.")

    sess = SESSIONS[req.session_id]
    user_text = pii_mask(req.text)

    # 1) 사용자 메시지 저장
    sess["messages"].append({"role": "user", "content": user_text})

    # 2) LLM 응답 생성
    assistant_text = llm_reply(sess["messages"])

    # 3) assistant 메시지 저장
    sess["messages"].append({"role": "assistant", "content": assistant_text})

    return ChatRes(assistant=assistant_text)


@app.post("/finalize")
def finalize(req: FinalizeReq):
    if req.session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Invalid session.")

    sess = SESSIONS[req.session_id]

    # 사용자 발화만 뽑아서 분석
    user_msgs = [m["content"] for m in sess["messages"] if m["role"] == "user"]
    # print("DEBUG user_msgs:", user_msgs)  # 필요 시 디버그

    analysis = analyze_messages(user_msgs)

    report = {
        "summary": {
            "top_issues": analysis["top_themes"],
            "scores": analysis["scores"],
            "risk": analysis["risk"],
        },
        "details": {
            "themes": analysis["themes"],
            "emotions": analysis["emotions"],
            "highlights": analysis["highlights"],
            "disclaimer": "본 리포트는 상담 전 사전 점검용 참고자료이며, 진단·치료가 아닙니다.",
        },
        "safety_notice": (
            "위험 신호가 감지되었습니다. 도움이 필요하시면 즉시 1393(자살예방상담전화) 또는 112에 연락하세요."
            if analysis["risk"]["need_immediate_help"] else ""
        ),
    }

    # 세션 정리(원문 저장하지 않음)
    del SESSIONS[req.session_id]

    return {"report": report}
