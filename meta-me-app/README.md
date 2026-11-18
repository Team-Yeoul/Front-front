# meta-me-app (React Native · Expo)

meta-me(Next.js 웹)를 앱으로 옮기는 중인 Expo 프로젝트입니다. 친구 피드백 링크(`/feedback/[token]`)처럼
앱 없이 브라우저로 열려야 하는 화면은 웹(`../meta-me`)에 남깁니다.

## 실행

```bash
cp .env.example .env.local   # 값 채우기
npm install
npx expo start               # Expo Go로 열기 (Google 로그인 제외 동작)
npx expo run:ios             # 개발 빌드 (Google 로그인 포함)
```

Google 로그인(`@react-native-google-signin/google-signin`)은 네이티브 모듈이라 Expo Go에서는 동작하지 않고,
개발 빌드가 필요합니다. iOS는 `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`·`EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME`이,
Android는 Google Cloud 콘솔에 앱 패키지명(`com.teamyeoul.metame`)과 서명 SHA-1로 만든 Android 클라이언트가 필요합니다.

## 구조

- `src/app` — Expo Router 화면. 로그인 후 화면은 `(app)` 그룹(토큰이 있을 때만 열림), 하단 탭은 `(app)/(tabs)`
- `src/entities`, `src/shared/api`, `src/hooks`, `src/lib`, `src/store` — 웹에서 가져온 API·상태 로직 (거의 그대로)
- `src/components/ui` — RN으로 다시 만든 UI 키트. 스타일은 Uniwind(Tailwind v4 클래스)
- 글자는 `components/ui/Text`의 `Text`/`Span`을 쓴다 (font-* 굵기 클래스를 Pretendard 굵기 파일로 연결)

## 웹과 다른 점

- 토큰은 `expo-secure-store`(Keychain/Keystore), 기기 데이터는 AsyncStorage에 저장
- 알림 권한은 실제 OS 권한 창으로 묻는다 (`expo-notifications`)
- 아직 옮기지 않은 화면은 `components/Pending`으로 자리만 잡아 둠
