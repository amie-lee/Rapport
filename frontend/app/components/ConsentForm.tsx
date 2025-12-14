type ConsentFormProps = {
  gender: string;
  ageGroup: string;
  occupation: string;
  region: string;
  onGenderChange: (value: string) => void;
  onAgeGroupChange: (value: string) => void;
  onOccupationChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onStart: () => void;
  isLoading: boolean;
};

export function ConsentForm({
  gender,
  ageGroup,
  occupation,
  region,
  onGenderChange,
  onAgeGroupChange,
  onOccupationChange,
  onRegionChange,
  onStart,
  isLoading,
}: ConsentFormProps) {
  const disabled = !gender || !ageGroup || !occupation || isLoading;

  return (
    <div className="consent-card">
      <div className="eyebrow">사전 점검 시작 전</div>
      <h1 className="consent-title">라포와의 대화에 동의해 주세요</h1>
      <p className="consent-description">
        상담 전 마음 상태를 가볍게 점검합니다. 입력된 내용은 세션 종료 시 삭제되고,
        리포트는 진단이 아닌 참고용 자료입니다.
      </p>
      <div className="form-group">
        <label className="form-label">성별 <span className="required">*</span></label>
        <select
          className="form-input"
          value={gender}
          onChange={(e) => onGenderChange(e.target.value)}
          required
        >
          <option value="">선택하세요</option>
          <option value="남성">남성</option>
          <option value="여성">여성</option>
          <option value="기타">기타</option>
          <option value="선택안함">선택하지 않음</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">연령대 <span className="required">*</span></label>
        <select
          className="form-input"
          value={ageGroup}
          onChange={(e) => onAgeGroupChange(e.target.value)}
          required
        >
          <option value="">선택하세요</option>
          <option value="10대">10대</option>
          <option value="20대">20대</option>
          <option value="30대">30대</option>
          <option value="40대">40대</option>
          <option value="50대">50대</option>
          <option value="60대 이상">60대 이상</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">직업 <span className="required">*</span></label>
        <select
          className="form-input"
          value={occupation}
          onChange={(e) => onOccupationChange(e.target.value)}
          required
        >
          <option value="">선택하세요</option>
          <option value="학생">학생</option>
          <option value="직장인">직장인</option>
          <option value="자영업">자영업</option>
          <option value="전문직">전문직 (의사, 변호사, 교수 등)</option>
          <option value="공무원">공무원</option>
          <option value="프리랜서">프리랜서</option>
          <option value="주부">주부</option>
          <option value="무직">무직</option>
          <option value="기타">기타</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">지역 (선택)</label>
        <input
          className="form-input"
          placeholder="예: 서울 강남구"
          value={region}
          onChange={(e) => onRegionChange(e.target.value)}
        />
      </div>
      <div className="consent-footnote">
        * 민감 정보는 저장하지 않고, 모든 대화는 암호화된 연결로 처리됩니다.
      </div>
      <button
        onClick={onStart}
        className="consent-button"
        disabled={disabled}
      >
        {isLoading ? "세션 생성 중..." : "동의하고 시작하기"}
      </button>
    </div>
  );
}
