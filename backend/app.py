from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid, re
from typing import Dict
from analyzer import analyze_messages
from model_wrap import try_load_model, model_scores

CLF = try_load_model()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

SESSIONS: Dict[str, Dict] = {}

class CreateSessionReq(BaseModel):
    consent: bool
    region: str | None = None

class CreateSessionRes(BaseModel):
    session_id: str

class ChatReq(BaseModel):
    session_id: str
    text: str

class FinalizeReq(BaseModel):
    session_id: str

PHONE_RE = re.compile(r"(01[016789]|02|0[3-9]\d)-?\d{3,4}-?\d{4}")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
NAME_RE  = re.compile(r'(?<![가-힣])([가-힣]{2,4})(님|씨)(?=\s|$)')

def pii_mask(text: str) -> str:
    masked = PHONE_RE.sub("<PHONE>", text)
    masked = EMAIL_RE.sub("<EMAIL>", masked)
    masked = NAME_RE.sub("<NAME>", masked)
    return masked

@app.post("/session", response_model=CreateSessionRes)
def create_session(req: CreateSessionReq):
    if not req.consent:
        raise HTTPException(status_code=400, detail="Consent required.")
    sid = str(uuid.uuid4())
    SESSIONS[sid] = {"messages": []}
    return CreateSessionRes(session_id=sid)

@app.post("/chat")
def chat(req: ChatReq):
    if req.session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Invalid session.")
    masked = pii_mask(req.text)
    SESSIONS[req.session_id]["messages"].append({"role":"user","text":masked})
    return {"ok": True, "echo": masked}

@app.post("/finalize")
def finalize(req: FinalizeReq):
    if req.session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Invalid session.")
    msgs = [m["text"] for m in SESSIONS[req.session_id]["messages"]]

    print("DEBUG: Messages for analysis:", msgs)  # 디버그 출력
    analysis = analyze_messages(msgs)

    m = model_scores(CLF, msgs)
    if m is not None:
        # 간단 가중 평균: 최종 = 0.8*룰 + 0.2*(neg_ratio*100)
        def fuse(rule_val: int) -> int:
            return int(0.8*rule_val + 0.2*(m["neg_ratio"]*100))
        fused_scores = {
            "depression": fuse(analysis["scores"]["depression"]),
            "anxiety":    fuse(analysis["scores"]["anxiety"]),
            "stress":     fuse(analysis["scores"]["stress"]),
        }
    else:
        fused_scores = analysis["scores"]

    report = {
        "summary": {
            "top_issues": analysis["top_themes"],
            "scores": analysis["scores"],  # {depression, anxiety, stress}
            "risk": analysis["risk"],      # {level, hits, need_immediate_help}
        },
        "details": {
            "themes": analysis["themes"],
            "emotions": analysis["emotions"],
            "highlights": analysis["highlights"],  # 인용 0~2개 (마스킹된 텍스트)
            "disclaimer": "본 리포트는 상담 전 사전 점검용 참고자료이며, 진단·치료가 아닙니다."
        },
        "safety_notice": (
            "위험 신호가 감지되었습니다. 도움이 필요하시면 즉시 1393(자살예방상담전화) 또는 112에 연락하세요."
            if analysis["risk"]["need_immediate_help"] else ""
        ),
        "ai_model_used": m is not None,
    }

    # 원문 삭제(세션 종료 정책)
    del SESSIONS[req.session_id]
    return {"report": report}