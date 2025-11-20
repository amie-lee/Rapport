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
# Vercel 배포 시 모든 오리진 허용 (같은 도메인에서 호출되므로)
if os.getenv("VERCEL"):
    API_ORIGINS = ["*"]

# LM Studio(OpenAI 호환) 서버 설정
OPENAI_BASE = os.getenv("OPENAI_BASE", "http://localhost:1234/v1")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "Qwen2.5-7B-Instruct")

# -----------------------------------------------------------------------------
# 시스템 프롬프트 (한국어 톤 + 간결한 진행)
# -----------------------------------------------------------------------------
SYSTEM_PROMPT = """당신은 '라포'라는 이름의 전문 심리상담 사전점검 챗봇입니다.

## 핵심 역할
- 상담 전 내담자의 심리상태를 자연스럽게 파악하는 것
- 상담사가 활용할 수 있는 사전 정보 수집

## 대화 원칙
1. **공감 우선**: 사용자의 감정을 먼저 인정하고 공감 표현
2. **단계적 접근**: 한 번에 하나의 구체적 질문만 제시
3. **안전한 환경**: 판단하지 않고 수용적인 태도 유지

## 말투 규칙
- 정중하고 따뜻한 존댓말 사용
- "~네요", "~시는군요" 같은 자연스러운 종결어미 활용
- 의학적 진단, 조언, 해결책 제시는 절대 금지
- 영어나 전문용어 사용 금지, 순우리말 위주

## 응답 구조 (필수)
첫 번째 문장: 공감/인정 (사용자의 감정이나 상황에 대한 이해 표현)
두 번째 문장: 구체적 질문 (현재 상황을 더 깊이 이해할 수 있는 질문)

## 질문 가이드라인
- 감정의 구체적 양상 파악 (언제, 어떤 상황에서, 얼마나 자주)
- 일상생활 영향도 확인 (수면, 식사, 대인관계, 업무/학업)
- 대처 방식과 지지체계 탐색
- 과거 경험과의 연관성

## 금지사항
- 목록형 응답 (-, *, 1. 등)
- 길고 복잡한 설명
- 조언이나 해결책 제시
- 긍정적 사고 강요
- 의학적/심리학적 전문용어

## 대화 예시들을 참고하여 같은 패턴으로 응답하세요:

예시 1:
사용자: "요즘 너무 우울해요"
라포: "마음이 많이 힘드시겠어요. 이런 우울한 기분이 언제부터 시작되셨나요?"

예시 2:
사용자: "직장상사 때문에 스트레스받아서 미치겠어요"
라포: "상사분과의 관계가 많은 스트레스를 주는 것 같네요. 주로 어떤 상황에서 가장 어려움을 느끼시나요?"

예시 3:
사용자: "밤마다 잠이 안 와서 괴로워요"
라포: "밤에 잠들지 못하시니까 정말 힘드셨을 것 같아요. 잠들기 전에 주로 어떤 생각들이 드시나요?"

예시 4:
사용자: "친구들과 만나는 게 부담스러워졌어요"
라포: "사람들과의 만남이 예전만큼 편하지 않으시군요. 언제부터 이런 마음이 드셨는지 기억나시나요?"

예시 5:
사용자: "매일 불안해서 가슴이 두근거려요"
라포: "불안감과 함께 신체적으로도 힘드시겠어요. 특별히 어떤 상황에서 이런 증상이 더 심해지시나요?"

현재 대화맥락을 고려하여 사용자의 상황을 깊이 이해할 수 있는 적절한 질문을 해주세요.
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
    gender: str | None = None
    ageGroup: str | None = None
    occupation: str | None = None

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
# 응답 품질 검증
# -----------------------------------------------------------------------------
def validate_response(response: str) -> str:
    """응답 품질을 검증하고 필요시 수정"""

    # 기본 품질 체크
    if len(response) < 10:
        return get_fallback_response("short")

    # 금지된 패턴 체크
    forbidden_patterns = [
        r'추천합니다',
        r'조언드리자면',
        r'해결방법',
        r'진단',
        r'치료',
        r'약물',
        r'의사',
        r'병원',
        r'[1-9]\.',  # 번호 목록
        r'[-*•]',    # 불릿 포인트
    ]

    for pattern in forbidden_patterns:
        if re.search(pattern, response):
            return get_fallback_response("forbidden")

    # 문장 수 체크
    sentences = [s.strip() for s in response.split('.') if s.strip()]
    if len(sentences) > 2:
        response = '. '.join(sentences[:2]) + '.'
    elif len(sentences) < 2:
        response += " 어떤 부분이 가장 힘드신지 말씀해 주실 수 있을까요?"

    # 질문 포함 여부 체크 (더 정확한 패턴)
    question_patterns = ['?', '까요', '나요', '세요', '실까요', '하나요', '어떤가요', '어떠세요']
    has_question = any(pattern in response for pattern in question_patterns)

    if not has_question:
        response += " 어떤 부분이 가장 힘드신지 말씀해 주실 수 있을까요?"

    return response

def get_fallback_response(reason: str) -> str:
    """품질 기준 미달 시 사용할 대체 응답"""
    fallbacks = {
        "short": "말씀해 주셔서 감사합니다. 지금 상황에 대해 좀 더 자세히 이야기해 주실 수 있을까요?",
        "forbidden": "힘든 상황이시겠어요. 현재 가장 어려운 부분이 무엇인지 말씀해 주실 수 있나요?",
        "generic": "이해합니다. 요즘 어떤 일상생활에서 가장 힘든 점이 있으신지 궁금해요."
    }
    return fallbacks.get(reason, fallbacks["generic"])

# -----------------------------------------------------------------------------
# LLM 호출 (LM Studio OpenAI 호환 서버)
# -----------------------------------------------------------------------------
def llm_reply(history: List[Dict[str, str]], user_profile: Dict[str, str] = None) -> str:
    """
    history: [{"role":"user"|"assistant","content":"..."}]
    user_profile: {"gender": "...", "ageGroup": "...", "occupation": "..."}
    """
    # 사용자 프로필 정보를 시스템 프롬프트에 추가
    system_prompt = SYSTEM_PROMPT
    if user_profile:
        profile_context = "\n\n## 내담자 배경 정보"
        if user_profile.get("gender"):
            profile_context += f"\n- 성별: {user_profile['gender']}"
        if user_profile.get("ageGroup"):
            profile_context += f"\n- 연령대: {user_profile['ageGroup']}"
        if user_profile.get("occupation"):
            profile_context += f"\n- 직업: {user_profile['occupation']}"
        profile_context += "\n\n위 배경 정보를 고려하여 내담자의 상황을 더 깊이 이해하고 적절한 질문을 해주세요."
        system_prompt += profile_context

    messages = [{"role": "system", "content": system_prompt}]
    messages += history[-6:]  # 최근 6턴으로 줄여서 집중도 향상

    try:
        r = requests.post(
            f"{OPENAI_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": OPENAI_MODEL,
                "messages": messages,
                "temperature": 0.3,  # 더 일관된 응답을 위해 낮춤
                "top_p": 0.8,       # 더 집중된 응답
                "max_tokens": 150,  # 간결한 응답 유도
                "frequency_penalty": 0.3,  # 반복 방지
                "presence_penalty": 0.1,   # 새로운 주제 유도
            },
            timeout=45,
        )
        r.raise_for_status()
        response = r.json()["choices"][0]["message"]["content"].strip()

        # 응답 품질 검증 및 수정
        response = validate_response(response)

        return response
    except Exception as e:
        print("LLM error:", e)
        return "말씀해 주셔서 감사합니다. 지금 느끼고 계신 감정에 대해 좀 더 자세히 이야기해 주실 수 있을까요?"


def generate_conversation_summary(messages: List[Dict[str, str]]) -> str:
    """
    대화 내용을 AI를 사용하여 요약 생성
    """
    # 사용자와 AI의 대화만 추출
    conversation_text = ""
    for msg in messages:
        role = "사용자" if msg["role"] == "user" else "챗봇"
        conversation_text += f"{role}: {msg['content']}\n"

    if not conversation_text.strip():
        return ""

    summary_prompt = f"""다음은 심리상담 사전 점검 대화입니다. 이 대화를 2-3문장으로 요약해주세요.

대화 내용:
{conversation_text}

요약할 때 다음 사항을 포함해주세요:
- 사용자가 호소한 주요 문제나 어려움
- 대화에서 나타난 주요 감정이나 상태
- 언급된 구체적인 상황이나 배경

객관적으로 요약해주세요."""

    try:
        r = requests.post(
            f"{OPENAI_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": OPENAI_MODEL,
                "messages": [{"role": "user", "content": summary_prompt}],
                "temperature": 0.3,
                "max_tokens": 200,
            },
            timeout=30,
        )
        r.raise_for_status()
        summary = r.json()["choices"][0]["message"]["content"].strip()
        return summary
    except Exception as e:
        print("Summary generation error:", e)
        return "대화 요약을 생성하는 중 오류가 발생했습니다."


# -----------------------------------------------------------------------------
# 분석 모듈 (룰 기반)
# -----------------------------------------------------------------------------
from backend.analyzer import analyze_messages  # Vercel 배포용 절대 경로


# -----------------------------------------------------------------------------
# 엔드포인트
# -----------------------------------------------------------------------------
@app.post("/session", response_model=CreateSessionRes)
def create_session(req: CreateSessionReq):
    if not req.consent:
        raise HTTPException(status_code=400, detail="Consent required.")
    sid = str(uuid.uuid4())
    SESSIONS[sid] = {
        "messages": [],
        "region": (req.region or "").strip(),
        "gender": (req.gender or "").strip(),
        "ageGroup": (req.ageGroup or "").strip(),
        "occupation": (req.occupation or "").strip()
    }
    return CreateSessionRes(session_id=sid)


@app.post("/chat", response_model=ChatRes)
def chat(req: ChatReq):
    if req.session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Invalid session.")

    sess = SESSIONS[req.session_id]
    user_text = pii_mask(req.text)

    # 1) 사용자 메시지 저장
    sess["messages"].append({"role": "user", "content": user_text})

    # 2) 사용자 프로필 정보 추출
    user_profile = {
        "gender": sess.get("gender", ""),
        "ageGroup": sess.get("ageGroup", ""),
        "occupation": sess.get("occupation", "")
    }

    # 3) LLM 응답 생성
    assistant_text = llm_reply(sess["messages"], user_profile)

    # 4) assistant 메시지 저장
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

    # AI를 사용한 대화 요약 생성
    conversation_summary = generate_conversation_summary(sess["messages"])

    report = {
        "summary": {
            "conversation_summary": conversation_summary,
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

    # 리포트 반환
    response = {"report": report}

    # 세션 정리(원문 저장하지 않음)
    if req.session_id in SESSIONS:
        del SESSIONS[req.session_id]

    return response
