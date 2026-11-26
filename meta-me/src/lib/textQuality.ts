import { useEffect, useState } from 'react';

/**
 * 자유 입력 답이 알아볼 수 없는 글인지 가볍게 거른다(예: 'ㅍ튵', 'ㅋㅋㅋㅋ', 'sdfgh', '1234').
 * 정상적인 문장을 막지 않도록 확실한 경우만 잡는다. 문제가 없으면 null, 있으면 안내 문구를 돌려준다.
 */
export function gibberishReason(raw: string, { minLetters = 2 }: { minLetters?: number } = {}): string | null {
  const text = raw.trim();
  if (!text) return null;

  // 글자(한글 완성형·자모, 영문)만 센다. 숫자·기호·이모지는 뺀다.
  const letters = text.match(/[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z]/g) ?? [];
  if (letters.length === 0) return '글자로 된 문장으로 써 주세요';

  // 같은 글자를 4번 넘게 연달아 (ㅋㅋㅋㅋ · 아아아아 · ....)
  if (/(.)\1{3,}/u.test(text.replace(/\s/g, ''))) return '같은 글자만 반복하지 말고 써 주세요';

  // 받침·모음 없이 자음·모음만 따로 쓴 글이 많으면 (ㅍ튵 · ㅇㅇ 좋아)
  const jamo = letters.filter((c) => /[ㄱ-ㅎㅏ-ㅣ]/.test(c)).length;
  if (jamo / letters.length >= 0.3) return '자음·모음만 쓰지 말고 문장으로 써 주세요';

  // 모음 없는 영문 6자 이상 (키보드를 마구 누른 경우: sdfghj). 'strengths'처럼 자음 5개가 이어지는 단어는 통과시킨다.
  if (/[b-df-hj-np-tv-xz]{6,}/i.test(text)) return '알아볼 수 있는 문장으로 써 주세요';

  if (letters.length < minLetters) return '조금만 더 써 주세요';
  return null;
}

/**
 * 입력칸용: 지금 값이 이상한 글인지(invalid)와, 입력이 0.7초 멈췄을 때 보여 줄 안내(hint)를 준다.
 * 한글을 치는 도중엔 'ㄴ'처럼 자모가 잠깐 남아 안내가 깜박이므로 바로 띄우지 않는다.
 */
export function useTextCheck(value: string, enabled = true, opts?: { minLetters?: number }) {
  const reason = enabled ? gibberishReason(value, opts) : null;
  // 입력이 0.7초 멈춘 값. 지금 값과 같아졌을 때만 안내를 보여 준다(타이머 안에서만 상태를 바꾼다).
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setSettled(value), 700);
    return () => clearTimeout(t);
  }, [value]);
  return { invalid: !!reason, hint: reason && settled === value ? reason : null };
}
