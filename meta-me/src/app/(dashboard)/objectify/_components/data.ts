// 객관화 도감 페이지에서 쓰는 샘플 데이터 (추후 API 연동)

// 글자 수 기준으로 잘라 "..."을 붙이는 요약 함수 (line-clamp 대신 문자열 자체를 잘라 확실하게 생략)
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export const MY_RECORD_TEXT =
  '조별과제 팀원들이 보여주는 기상천외한 행태는 현대 의학으로도 치료할 수 없는 만성 편두통의 근원입니다. 그들은 평소에는 멀쩡히 숨 쉬고 살아가다가도, 과제 단톡방만 개설되면 갑자기 손가락이 마비되거나 우주 정거장 수준의 심해로 잠수를 타버리는 초능력을 발휘합니다. "제가 지금 알바 중이라서요", "갑자기 상을 당해서요"라며 온갖 핑계를 대기 바쁩니다.';

export const MIRROR_TEXT =
  '제시된 본문은 대학 조별과제 과정에서 발생하는 팀원들의 비협조적인 태도와 이로 인한 극심한 스트레스를 주관적이고 감정적인 언어로 기술한 글입니다. 이를 감정을 배제하고 사실 관계와 학술적 분석으로 객관화하여 줄글로 정리한 내용은 다음과 같습니다. 본문에서 확인할 수 있는 객관적 사실은 크게 소통 부재, 산출물의 저품질, 평가의 불합리성 등으로 나뉩니다.';

export const MONSTER_DATA = {
  namtat: {
    name: "남탓대마왕",
    count: 20,
    category: "사고/인지",
    tier: "COMMON",
    desc: "일이 잘 안 풀렸을 때 원인을 외부에서 먼저 찾는 패턴이에요.",
    reason: "“조별과제 문제의 원인을 팀원 행동에 집중해서 해석했어요. 다만 실제로는 업무 분배 구조와 피로도도 함께 작용했을 수 있어요.”",
    situations: ["조별과제", "피곤한 날", "역할 분배가 애매할 때"],
    records: ["[6/30 조별과제 기록]", "[6/21 친구와 대화]", "[6/13 화장실의 변비]"],
  },
};

export const MONSTER_CATEGORIES = ["전체", "사고/인지", "감정 반응", "행동", "대인관계"];

// 실데이터(백엔드) 몬스터의 영문 카테고리 enum → 한글 표시 라벨
export const CATEGORY_LABELS: Record<string, string> = {
  COGNITIVE: "사고/인지",
  EMOTIONAL: "감정 반응",
  BEHAVIORAL: "행동",
  RELATIONAL: "대인관계",
  GROWTH: "성장",
  SITUATIONAL: "상황",
};

// 도감 그리드용 몬스터 목록 (카테고리 필터링에 사용, 추후 API 연동)
export const MONSTER_LIST = [
  { name: "남탓대마왕", image: "/남탓_군주.png", count: 20, category: "사고/인지" },
  { name: "자책 인피니티", image: "/자책_인피니티.png", count: 16, category: "감정 반응" },
  { name: "돋보기", image: "/돋보기.png", count: 12, category: "행동" },
];
