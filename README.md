# 라포 (Rapport)

> **심리 상담 전 사전 점검 챗봇 MVP**
> 사용자의 대화를 기반으로 **우울 · 불안 · 스트레스 지수**를 산출하고, 간단한 리포트를 제공하는 텍스트 기반 챗봇 서비스입니다.
> 현재 최소기능 프로토타입(MVP)이 동작하며, 한국어 대화 품질 안정화를 위한 작업이 진행 중입니다.

---

![Image](https://github.com/user-attachments/assets/8d02789c-097e-4bdd-b1ef-6d6ff593a5bd)

![Image](https://github.com/user-attachments/assets/a602620d-d7af-44bd-bd51-8f3f42a22a75)

---

## 주요 기능

- **텍스트 기반 대화**
  상담 전 부담 없이 사용자가 자유롭게 대화 입력
  → 챗봇이 공감 + 질문 형식으로 대화를 이어감

- **사전 점검 리포트 생성**
  - 대화 요약 (AI 기반)
  - 핵심 이슈 요약
  - 우울 / 불안 / 스트레스 지수 (0–100) 산출
  - 위험 신호 감지 시 안내 문구 및 긴급 도움 연결 제공

- **세션 기반 대화 관리**
  - 세션별 대화 내용은 종료 시 삭제 (개인정보 보호)
  - 상담 전 참고용으로만 사용 (진단·치료 목적 아님)

---

## 프로젝트 구조

```
rapport-mvp/
├── backend/                 # Python FastAPI 백엔드
│   ├── app.py              # 메인 FastAPI 애플리케이션
│   ├── analyzer.py         # 룰 기반 텍스트 분석 모듈
│   ├── model_wrap.py       # 모델 래퍼
│   ├── .env                # 환경 변수 (API 키 등)
│   └── .venv/              # Python 가상환경
│
├── frontend/                # Next.js React 프론트엔드
│   ├── app/
│   │   ├── page.tsx        # 메인 채팅 인터페이스
│   │   ├── layout.tsx      # 루트 레이아웃
│   │   └── globals.css     # 전역 스타일
│   ├── public/             # 정적 파일 (파비콘 등)
│   ├── package.json        # 프론트엔드 의존성
│   └── node_modules/       # npm 패키지
│
├── CLAUDE.md               # Claude Code 지침
└── README.md               # 프로젝트 문서
```

---

## 기술 스택

### 백엔드
- **Python 3.13** + **FastAPI**
- **OpenAI API** (GPT-3.5-turbo)
- **Pydantic** - 데이터 검증
- **python-dotenv** - 환경 변수 관리

### 프론트엔드
- **Next.js 15** + **React 19**
- **TypeScript**
- **Tailwind CSS 4** - 스타일링
- **Turbopack** - 빌드 도구

---

## 실행 방법

### 사전 요구사항

- Python 3.11+
- Node.js 18+
- OpenAI API 키

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/rapport-mvp.git
cd rapport-mvp
```

### 2. 백엔드 설정

```bash
# 가상환경 생성 및 활성화
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 의존성 설치
pip install fastapi uvicorn python-dotenv requests pydantic

# 환경 변수 설정
cp .env.example .env  # 또는 직접 .env 파일 생성
```

`.env` 파일 설정:
```env
FRONTEND_ORIGIN=http://localhost:3000
OPENAI_BASE=https://api.openai.com/v1
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

```bash
# 백엔드 서버 실행
uvicorn app:app --reload --port 8000
```

### 3. 프론트엔드 설정

```bash
# 새 터미널에서
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 4. 접속

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 환경 변수

### 백엔드 (`backend/.env`)

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `FRONTEND_ORIGIN` | CORS 허용 오리진 | `http://localhost:3000` |
| `OPENAI_BASE` | OpenAI API 엔드포인트 | `http://localhost:1234/v1` |
| `OPENAI_API_KEY` | OpenAI API 키 | - |
| `OPENAI_MODEL` | 사용할 모델명 | `gpt-3.5-turbo` |

### 프론트엔드

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NEXT_PUBLIC_API_BASE` | 백엔드 API URL | `http://localhost:8000` |

---

## API 엔드포인트

| 메소드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| `POST` | `/session` | 새 채팅 세션 생성 (동의 + 사용자 정보) |
| `POST` | `/chat` | 메시지 전송 및 봇 응답 수신 |
| `POST` | `/finalize` | 세션 종료 및 심리 상태 평가 리포트 생성 |

---

## 개발 명령어

### 프론트엔드

```bash
npm run dev      # 개발 서버 (Turbopack)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint 실행
```

### 백엔드

```bash
# 개발 서버 (자동 리로드)
uvicorn app:app --reload --port 8000

# 프로덕션 서버
uvicorn app:app --host 0.0.0.0 --port 8000
```

---

## 문제 해결

### "Failed to fetch" 오류

1. **백엔드 서버가 실행 중인지 확인**
   ```bash
   lsof -i :8000
   ```

2. **Docker가 포트 8000을 점유하는 경우**
   - Docker Desktop을 종료하거나
   - 백엔드를 다른 포트에서 실행:
     ```bash
     uvicorn app:app --reload --port 8001
     NEXT_PUBLIC_API_BASE=http://localhost:8001 npm run dev
     ```

3. **CORS 오류**
   - `backend/.env`의 `FRONTEND_ORIGIN`이 프론트엔드 URL과 일치하는지 확인

---

## 현재 구현 상태

- ✅ 최소기능 동작하는 프로토타입 제작 완료
- ✅ OpenAI GPT-3.5-turbo 모델 연동
- ✅ 우울/불안/스트레스 지수 산출 기능 구현
- ✅ AI 기반 대화 요약 기능
- ✅ 사용자 정보 입력 (성별, 연령대, 직업)
- 🔄 한국어 대화 품질 안정화 작업 진행 중
- 📋 지역별 정신건강복지센터 데이터 연동 예정

---

## 라이선스

MIT License
