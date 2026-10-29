// 친구 응답 화면(/feedback)에서 쓰는 고정 선택지.
// 로그인한 사용자 화면에는 예시 데이터를 쓰지 않는다.

export const AXES = ['표현력', '주도성', '공감', '추진력', '차분함'] as const;

export const TYPE_OPTIONS = [
  { key: 'A', label: '설명 장인', desc: '어려운 걸 쉽게 풀어서 말해줘요', pct: 80 },
  { key: 'B', label: '감정 레이더', desc: '분위기와 기분을 먼저 알아채요', pct: 60 },
  { key: 'C', label: '마감 스퍼터', desc: '마감이 다가오면 확 몰입해요', pct: 40 },
  { key: 'D', label: '조용한 추진력', desc: '말없이 끝까지 해내요', pct: 20 },
];
