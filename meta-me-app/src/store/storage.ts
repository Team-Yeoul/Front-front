import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

/** zustand persist용 보안 저장소. 토큰처럼 민감한 값만 여기에 둔다(웹 빌드는 지원하지 않음). */
export const secureStorage: StateStorage = {
  getItem: (name) => SecureStore.getItemAsync(name),
  setItem: (name, value) => SecureStore.setItemAsync(name, value),
  removeItem: (name) => SecureStore.deleteItemAsync(name),
};
