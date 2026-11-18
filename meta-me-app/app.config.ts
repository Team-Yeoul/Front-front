import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Google 로그인 iOS URL 스킴(iOS 클라이언트 ID를 뒤집은 값, com.googleusercontent.apps.xxx).
 * 값이 없으면 Google 로그인 플러그인을 넣지 않는다(플러그인이 값 없이는 빌드를 막음).
 */
const GOOGLE_IOS_URL_SCHEME = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'MetaMe',
  slug: 'meta-me',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'metame',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'com.teamyeoul.metame',
    supportsTablet: false,
  },
  android: {
    package: 'com.teamyeoul.metame',
    adaptiveIcon: {
      backgroundColor: '#6367FF',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/Pretendard-Light.otf',
          './assets/fonts/Pretendard-Regular.otf',
          './assets/fonts/Pretendard-Medium.otf',
          './assets/fonts/Pretendard-SemiBold.otf',
          './assets/fonts/Pretendard-Bold.otf',
        ],
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#4F52E5',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    ...(GOOGLE_IOS_URL_SCHEME
      ? [['@react-native-google-signin/google-signin', { iosUrlScheme: GOOGLE_IOS_URL_SCHEME }] as [string, unknown]]
      : []),
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
