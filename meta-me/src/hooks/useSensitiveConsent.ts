import { useCallback } from 'react';
import { useMe } from './useMe';

/**
 * 민감정보(기록·AI 분석) 처리 동의 상태.
 * 백엔드에 동의 저장 API가 아직 없어 기기에 저장한다. API가 생기면 이 훅 안만 서버 호출로 바꾸면 된다.
 * 동의 기록이 없는 기존 사용자는 동의하지 않은 것으로 보고 기능을 쓰기 전에 다시 묻는다.
 */
export function useSensitiveConsent() {
  const { sensitiveConsent, patch } = useMe();

  const setAgreed = useCallback(
    (agreed: boolean) => patch((u) => ({ ...u, sensitiveConsent: { agreed, at: new Date().toISOString() } })),
    [patch],
  );

  return {
    agreed: sensitiveConsent?.agreed === true,
    agree: useCallback(() => setAgreed(true), [setAgreed]),
    revoke: useCallback(() => setAgreed(false), [setAgreed]),
  };
}
