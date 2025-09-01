# backend/model_wrap.py
from typing import Optional, List
def try_load_model():
    try:
        from transformers import pipeline
        # 멀티링구얼/간단 모델 예시(정확도는 제한적, 데모용)
        clf = pipeline("sentiment-analysis")  # 모델 미지정 시 기본 가중치 다운로드
        return clf
    except Exception:
        return None

def model_scores(clf, messages: List[str]) -> Optional[dict]:
    if clf is None: 
        return None
    try:
        # 최근 메시지 몇 개만 샘플링
        sample = messages[-5:] if len(messages) > 5 else messages
        outs = clf(sample)
        # 긍/부정 비율로 간단 점수화(부정↑ → 우울/불안에 소량 가중)
        neg = sum(1 for o in outs if 'NEG' in o['label'].upper() or '1' in o['label'])  # 모델에 따라 라벨 다름
        total = max(1, len(outs))
        neg_ratio = neg / total
        return {"neg_ratio": neg_ratio}
    except Exception:
        return None
