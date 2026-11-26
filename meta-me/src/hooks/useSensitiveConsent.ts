import { useQuery } from '@tanstack/react-query';
import { userApi, userKeys, type ConsentItem } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { queryClient } from '@/shared/api/query-client';
import { useAuthStore, useLocalStore } from '@/store';
import { useMe } from './useMe';

/**
 * 민감정보(기록·AI 분석) 처리 동의 상태.
 * 서버(/v1/users/me/consents)가 기준이고, 화면이 바로 반응하도록 기기(계정별)에도 같이 남긴다.
 * 서버는 SENSITIVE 동의가 없으면 온보딩·기록 등을 403(SENSITIVE_CONSENT_REQUIRED)으로 막으므로,
 * 동의하면 서버 저장을 기다린 뒤에 화면을 연다.
 */
export function useSensitiveConsent() {
  const { sensitiveConsent } = useMe();
  return { agreed: sensitiveConsent?.agreed === true, agree: agreeSensitiveConsent, revoke: revokeSensitiveConsent };
}

/**
 * 동의 쓰기(동의·철회·서버와 맞추기)는 한 줄로 세워 차례대로 보낸다. 그래야 서버에 닿는 순서가 누른 순서와 같다.
 * writeSeq는 마지막으로 시작한 동의·철회 번호다. 끝났을 때 그 뒤에 다른 동의·철회가 시작됐으면 기기 값을 덮지 않는다.
 */
let queue: Promise<unknown> = Promise.resolve();
let writeSeq = 0;
function serialized<T>(run: () => Promise<T>): Promise<T> {
  const next = queue.then(run, run);
  queue = next.catch(() => {});
  return next;
}

function setLocalConsent(userId: string, agreed: boolean) {
  useLocalStore.getState().update(userId, (u) => ({ ...u, sensitiveConsent: { agreed, at: new Date().toISOString() } }));
}

/** 서버 동의 상태를 다시 읽어 기기와 맞춘다(쓰기에 실패했을 때). */
function reconcileConsent() {
  void queryClient.invalidateQueries({ queryKey: [...userKeys.all, 'consent-sync'] });
}

/**
 * 동의: 서버 저장이 끝난 뒤에만 기기에 남기고 화면을 연다. 실패하면 오류를 그대로 던져 부르는 쪽이 다시 시도하게 한다.
 * (서버에 동의가 없는데 화면을 열면 그 안의 요청이 403 SENSITIVE_CONSENT_REQUIRED로 막힌다)
 */
async function agreeSensitiveConsent(): Promise<'agreed' | 'terms-required' | undefined> {
  const { userId } = useAuthStore.getState();
  if (!userId) return;
  const seq = ++writeSeq;
  try {
    await serialized(() => userApi.updateConsents({ consents: [{ consent_type: 'SENSITIVE', agreed: true }] }));
  } catch (err) {
    // 서버가 요청을 거절했다면(4xx) 필수 약관 동의가 서버에 없어서일 수 있다(약관 화면을 거치지 않은 Google 가입 등).
    // 그렇다면 약관 화면으로 보내 약관·개인정보·민감정보를 함께 받는다.
    if (err instanceof ApiError && err.status >= 400 && err.status < 500 && err.status !== 401) {
      if (await markTermsPendingIfMissing(userId)) return 'terms-required';
    }
    throw err;
  }
  // 기다리는 사이 철회했거나 계정이 바뀌었으면 기기 값을 덮지 않는다.
  if (seq !== writeSeq || useAuthStore.getState().userId !== userId) return;
  setLocalConsent(userId, true);
  // 서버와 맞추기에 실패해 동의 화면을 띄웠던 경우, 이제 서버에 동의가 있으니 맞춘 것으로 표시해 화면을 연다.
  queryClient.setQueryData([...userKeys.all, 'consent-sync', userId], true);
  return 'agreed';
}

/** 서버에 필수 약관(이용약관·개인정보) 동의가 모두 있는지. */
const hasRequiredTerms = (consents: ConsentItem[]) => {
  const agreed = (t: ConsentItem['consent_type']) => consents.find((c) => c.consent_type === t)?.agreed === true;
  return agreed('SERVICE') && agreed('PRIVACY');
};

/**
 * 서버에 필수 약관(이용약관·개인정보) 동의가 없으면 기기에 termsPending을 남긴다(앱 레이아웃이 약관 화면으로 보낸다).
 * 서버에 약관 동의가 없는 것으로 확인됐을 때 true. 확인하지 못하면(오류) onError가 pending일 때만 true.
 */
export async function markTermsPendingIfMissing(userId: string, { onError = 'skip' }: { onError?: 'skip' | 'pending' } = {}): Promise<boolean> {
  let missing: boolean;
  try {
    missing = !hasRequiredTerms((await userApi.getConsents(userId)).consents);
  } catch {
    // 확인하지 못했을 때: 기본은 약관 화면으로 보내지 않는다. 막 가입한 계정이면(onError: 'pending') 동의를 받는다.
    missing = onError === 'pending';
  }
  if (!missing || useAuthStore.getState().userId !== userId) return false;
  useLocalStore.getState().update(userId, (u) => ({ ...u, termsPending: true }));
  return true;
}

/**
 * 기기에 termsPending이 남아 있어도 서버에 필수 약관 동의가 이미 있으면 지운다.
 * 동의 저장은 끝났는데 기기에 표시를 지우기 전에 앱이 닫힌 경우, 다음 실행 때 약관 화면으로 다시 보내지 않기 위해서다.
 * 지웠으면 true. 서버에 동의가 없거나 확인하지 못하면 false(약관 화면으로 보낸다).
 */
export async function clearTermsPendingIfAgreed(userId: string): Promise<boolean> {
  try {
    if (!hasRequiredTerms((await userApi.getConsents(userId)).consents)) return false;
  } catch {
    return false;
  }
  if (useAuthStore.getState().userId !== userId) return false;
  useLocalStore.getState().update(userId, (u) => ({ ...u, termsPending: false }));
  return true;
}

/**
 * 서버가 민감정보 동의가 없어 요청을 막았는지(403 SENSITIVE_CONSENT_REQUIRED).
 * 기기에는 동의가 남아 있는데 서버에는 없을 때 생긴다(예전 앱이 기기에만 저장했고 서버로 올리지 못한 경우 등).
 * 명세의 ErrorCode에는 아직 없는 코드라 문자열로 비교하고, 코드 없이 온 403도 동의 문제로 본다.
 */
export function isConsentRequiredError(err: unknown): boolean {
  if (!(err instanceof ApiError) || err.status !== 403) return false;
  const code: string = err.code;
  return code === 'SENSITIVE_CONSENT_REQUIRED' || code === 'FORBIDDEN' || code === 'UNKNOWN_ERROR';
}

/** 철회: 기기에서 먼저 막고(민감정보 전송 즉시 중단) 서버에 알린다. 실패하면 서버와 다시 맞춘다(기기 철회가 더 나중이라 서버에 다시 올린다). */
function revokeSensitiveConsent() {
  const { userId } = useAuthStore.getState();
  if (!userId) return;
  ++writeSeq;
  setLocalConsent(userId, false);
  serialized(() => userApi.updateConsents({ consents: [{ consent_type: 'SENSITIVE', agreed: false }] })).catch(reconcileConsent);
}

/**
 * 지금 계정의 동의 여부를 그 자리에서 읽는다(훅 밖·await 뒤에서 쓴다).
 * 요청을 기다리는 사이 설정에서 철회했을 수 있으므로, 민감정보를 보내거나 남기기 직전에 다시 확인한다.
 */
export function hasSensitiveConsent(): boolean {
  const { userId } = useAuthStore.getState();
  return !!userId && useLocalStore.getState().byUser[userId]?.sensitiveConsent?.agreed === true;
}

/** 서버 changed_at(시간대 없는 UTC, 마이크로초까지)을 밀리초로. 읽을 수 없으면 NaN. */
function serverTime(item?: ConsentItem): number {
  if (!item?.changed_at) return NaN;
  const iso = item.changed_at.replace(/(\.\d{3})\d+/, '$1');
  return Date.parse(/[zZ]$|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
}

/**
 * 기기와 서버의 동의를 맞춘다. 더 나중에 바뀐 쪽을 따른다.
 * - 예전 앱은 동의를 기기에만 남겼으므로, 기기에만 동의가 있으면 서버에 올린다(가입할 때 받은 약관·개인정보 동의도 함께).
 * - 다른 기기에서 나중에 바꿨다면 서버 값을 기기에 받아 온다.
 */
export function syncSensitiveConsent(): Promise<true> {
  return serialized(syncNow);
}

async function syncNow(): Promise<true> {
  const { userId } = useAuthStore.getState();
  if (!userId) return true;
  const res = await userApi.getConsents();
  if (useAuthStore.getState().userId !== userId) return true;

  const find = (t: ConsentItem['consent_type']) => res.consents.find((c) => c.consent_type === t);
  const server = find('SENSITIVE');
  const local = useLocalStore.getState().byUser[userId]?.sensitiveConsent;
  const serverAt = serverTime(server);
  const localAt = local ? Date.parse(local.at) : NaN;
  const localIsNewer = !!local && (Number.isNaN(serverAt) || (!Number.isNaN(localAt) && localAt > serverAt));

  if (local && localIsNewer) {
    if (server?.agreed === local.agreed) return true;
    const consents: { consent_type: ConsentItem['consent_type']; agreed: boolean }[] = [
      { consent_type: 'SENSITIVE', agreed: local.agreed },
    ];
    // 앱에서 가입했다면 약관·개인정보 동의는 가입 때 이미 받았다. 서버에 없으면 함께 올린다.
    if (local.agreed) {
      // 서버에 항목 자체가 없을 때도(동의 기록 없음) 함께 올린다.
      if (find('SERVICE')?.agreed !== true) consents.push({ consent_type: 'SERVICE', agreed: true });
      if (find('PRIVACY')?.agreed !== true) consents.push({ consent_type: 'PRIVACY', agreed: true });
    }
    await userApi.updateConsents({ consents });
    return true;
  }

  if (server && local?.agreed !== server.agreed) {
    useLocalStore.getState().update(userId, (u) => ({
      ...u,
      sensitiveConsent: {
        agreed: server.agreed,
        at: Number.isNaN(serverAt) ? new Date().toISOString() : new Date(serverAt).toISOString(),
      },
    }));
  }
  return true;
}

/**
 * 서버와 동의를 맞춘다. 민감정보 화면(SensitiveGate)은 처음 맞출 때까지 기다려,
 * 서버에 동의가 아직 없는 상태로 요청을 보내 403을 받지 않게 한다.
 * 오프라인처럼 서버에 닿지 못해 실패하면 기기 값으로 진행하고, 서버가 응답했는데 실패하면(기기 동의를 올리지 못함 등)
 * 서버에 동의가 있다고 볼 수 없으므로 화면 대신 동의 화면을 보여 준다({@link consentSyncFailed}).
 * 다른 기기에서 바꾼 동의나 실패한 철회도 맞추도록, 일정 시간이 지나면 민감정보 화면을 열 때 뒤에서 다시 맞춘다.
 */
export function useConsentSync() {
  const userId = useAuthStore((s) => s.userId);
  return useQuery({
    queryKey: [...userKeys.all, 'consent-sync', userId],
    queryFn: syncSensitiveConsent,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: Infinity,
    retry: 1,
  });
}

/** 서버가 응답했는데 동의를 맞추지 못했는지. 네트워크 오류(서버에 닿지 못함)는 fetch가 TypeError로 던지므로 여기에 들지 않는다. */
export function consentSyncFailed(error: unknown): boolean {
  return error instanceof ApiError;
}
