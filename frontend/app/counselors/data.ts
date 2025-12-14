export type Counselor = {
  id: string;
  name: string;
  title: string;
  bio: string;
  focus: string;
  expertise: string[];
  years: number;
  location: string;
  formats: string[];
  languages: string[];
  responseTime: string;
  badge?: string;
  career: string[];
  education: string[];
  certifications: string[];
  testimonials: { name: string; rating: number; comment: string }[];
};

export const counselors: Counselor[] = [
  {
    id: "hana-park",
    name: "박하나",
    title: "임상심리사 / 마음결 상담소",
    bio: "정서 조절이 어려운 내담자와 함께 울고 웃으며, 일상에서 실천 가능한 작은 변화부터 만들어 갑니다.",
    focus: "불안, 우울, 수면장애, 관계 스트레스",
    expertise: ["불안장애", "우울증", "수면장애"],
    years: 9,
    location: "서울 강남 / 화상 상담",
    formats: ["대면", "비대면"],
    languages: ["한국어"],
    responseTime: "평균 2시간 이내",
    badge: "신규 입점",
    career: [
      "현) 마음결 상담소 임상심리사",
      "전) 서울마음센터 선임 상담사 (2018-2023)",
      "전) 공공심리상담센터 상담사 (2014-2018)",
    ],
    education: [
      "연세대학교 상담심리 석사",
      "연세대학교 심리학 학사",
    ],
    certifications: [
      "임상심리사 1급",
      "정신건강전문요원 1급",
    ],
    testimonials: [
      { name: "익명 A", rating: 5, comment: "불안으로 잠을 못 잤는데 작은 실천부터 함께 잡아주셔서 생활 리듬을 회복했습니다." },
      { name: "익명 B", rating: 5, comment: "따뜻하게 들어주면서도 실질적인 과제와 피드백을 주셔서 도움이 많이 됐어요." },
    ],
  },
  {
    id: "jaemin-lee",
    name: "이재민",
    title: "정신건강전문요원 / 마음숲 센터",
    bio: "학업·커리어 스트레스와 완벽주의로 지친 분들과 현실적인 회복 전략을 함께 설계합니다.",
    focus: "학업·커리어, 성취압력, 주의집중",
    expertise: ["학업 스트레스", "완벽주의", "ADHD"],
    years: 7,
    location: "서울 마포 / 화상 상담",
    formats: ["비대면"],
    languages: ["한국어", "영어"],
    responseTime: "업무일 기준 4시간 이내",
    career: [
      "현) 마음숲 센터 상담사",
      "전) 대학 학생상담센터 전임 상담사 (2019-2022)",
      "전) 청소년상담복지센터 상담사 (2016-2019)",
    ],
    education: [
      "서울대학교 상담심리학 석사",
      "서울대학교 심리학 학사",
    ],
    certifications: [
      "정신건강전문요원 1급",
      "임상심리사 2급",
    ],
    testimonials: [
      { name: "익명 A", rating: 5, comment: "학업 스트레스가 컸는데, 구체적인 시간 관리와 마음챙김 방법을 제안해 주셔서 효과가 컸습니다." },
      { name: "익명 B", rating: 4, comment: "ADHD 특성을 이해해주고 현실적인 대처법을 알려줘서 일상이 훨씬 정돈됐어요." },
    ],
  },
  {
    id: "sujin-kim",
    name: "김수진",
    title: "가족상담사 / 라이트하우스",
    bio: "가족·연인 관계에서 반복되는 패턴을 읽어내고, 안전한 대화법으로 갈등을 풀어갑니다.",
    focus: "가족·연인 관계, 감정소통",
    expertise: ["가족관계", "커플 상담", "애착"],
    years: 11,
    location: "부산 해운대 / 화상·전화 상담",
    formats: ["대면", "비대면", "전화"],
    languages: ["한국어"],
    responseTime: "평균 1시간 이내",
    career: [
      "현) 라이트하우스 가족상담사",
      "전) 가족치료연구소 책임 상담가 (2015-2022)",
    ],
    education: [
      "부산대학교 가족상담 박사과정 수료",
      "부산대학교 사회복지학 석사",
    ],
    certifications: [
      "가족상담사 1급",
      "부부·가족치료 전문 수련 수료",
    ],
    testimonials: [
      { name: "익명 A", rating: 5, comment: "부모님과 대화가 막혀 있었는데, 단계별로 대화법을 연습하며 관계가 회복됐어요." },
      { name: "익명 B", rating: 4, comment: "감정 경계 세우는 법을 구체적으로 알려주셔서 갈등이 줄었습니다." },
    ],
  },
  {
    id: "yubin-choi",
    name: "최유빈",
    title: "상담심리사 / 슬립랩",
    bio: "수면 위생과 긴장 완화 훈련을 통해 깊이 자는 몸을 회복하도록 도와드립니다.",
    focus: "수면 위생, 만성 스트레스, 신체감각",
    expertise: ["수면장애", "불안장애", "스트레스 관리"],
    years: 6,
    location: "온라인 전용",
    formats: ["비대면"],
    languages: ["한국어"],
    responseTime: "평균 30분 이내",
    badge: "야간 상담",
    career: [
      "현) 슬립랩 상담심리사",
      "전) 수면의학센터 심리상담사 (2019-2023)",
    ],
    education: [
      "고려대학교 임상심리 석사",
      "고려대학교 심리학 학사",
    ],
    certifications: [
      "임상심리사 2급",
      "수면 위생 코칭 인증",
    ],
    testimonials: [
      { name: "익명 A", rating: 5, comment: "수면 루틴을 구체적으로 설계해 주셔서 두 달 만에 6시간 이상 숙면을 하게 됐습니다." },
      { name: "익명 B", rating: 5, comment: "불안할 때 쓸 수 있는 호흡과 근육 이완법을 알려주셔서 도움이 컸어요." },
    ],
  },
];
