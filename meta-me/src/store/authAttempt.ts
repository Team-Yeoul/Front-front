/**
 * 로그인·가입 시도 번호. 비밀번호 로그인과 Google 로그인 중 나중에 시작한 것만 세션을 저장하고 이동한다.
 * 시도를 시작할 때 beginAuthAttempt()로 번호를 받고, 응답이 오면 isLatestAuthAttempt()로 아직 최신인지 확인한다.
 */
let latest = 0;

export const beginAuthAttempt = () => ++latest;
export const isLatestAuthAttempt = (id: number) => id === latest;
