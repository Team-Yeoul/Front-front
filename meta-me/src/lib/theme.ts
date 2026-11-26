import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/*
 * 다크 모드 (앱 meta-me-app의 lib/theme와 같은 규칙).
 * - 클래스 색은 globals.css 토큰(text-ink, bg-page …)이 <html class="dark">에 따라 바뀐다.
 * - JS로 넘기는 색(SVG stroke·그라데이션·style)은 useTheme()의 fg(글자·선) / bg(면)로 감싼다.
 *   라이트에서는 넘긴 색을 그대로 돌려주므로 라이트 화면은 바뀌지 않는다.
 *   다크 값은 디자인 프레임(*-dk.html)에서 라이트 색과 짝지어 뽑은 것이고, 표에 없는 색은 밝기로 바꾼다.
 */

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeStore {
  /** 브라우저에만 저장한다. 처음에는 기기 설정을 따른다. */
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
    }),
    { name: 'metame-theme', storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

const DARK_QUERY = '(prefers-color-scheme: dark)';
const subscribeSystem = (cb: () => void) => {
  const mq = window.matchMedia(DARK_QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const systemDark = () => window.matchMedia(DARK_QUERY).matches;

/** 지금 실제로 쓰는 테마가 다크인지. 서버 렌더에서는 라이트로 본다. */
export function useIsDark() {
  const preference = useThemeStore((s) => s.preference);
  const sysDark = useSyncExternalStore(subscribeSystem, systemDark, () => false);
  return preference === 'dark' || (preference === 'system' && sysDark);
}

/** 저장된 테마를 읽고, <html>에 dark 클래스를 붙였다 뗀다. 루트 레이아웃에서 한 번 쓴다. */
export function useApplyTheme() {
  useEffect(() => {
    void useThemeStore.persist.rehydrate();
  }, []);
  const isDark = useIsDark();
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);
}

/** 글자·아이콘 선 색: 라이트 → 다크 */
const FG: Record<string, string> = {
  '#1A1A1E': '#F4F4F7',
  '#1A1A1F': '#F4F4F7',
  '#0F0F14': '#F4F4F7',
  '#3D3420': '#F4F4F7',
  '#3F3F46': '#D4D4DA',
  '#48484F': '#C4C4CC',
  '#52525B': '#C4C4CC',
  '#5A5A62': '#B8B8C4',
  '#71717A': '#A8A8B4',
  '#8A8A96': '#9A9AA8',
  '#8A8A94': '#9A9AA8',
  '#8A8A8E': '#9A9AA8',
  '#8E8E95': '#9A9AA8',
  '#A1A1AA': '#8A8A98',
  '#A8A8B0': '#8A8A98',
  '#B4B4BB': '#6E6D82',
  '#B4B4BE': '#6E6D82',
  '#C4C4CC': '#55546A',
  '#C7C7D1': '#55546A',
  '#C9CAD3': '#55546A',
  '#D4D4DC': '#55546A',
  '#D5D5DC': '#4B4A5C',
  '#D0D0D6': '#4B4A5C',
  '#D8D8DE': '#4B4A5C',
  '#4A4ED9': '#9EA1FF',
  '#6B5E36': '#E8D9A8',
  '#7A6B1F': '#E8D9A8',
  '#8A6D00': '#E8D9A8',
  '#8F6B00': '#E8D9A8',
  '#7A4E2E': '#B8B8C4',
};

/** 면(배경·채움) 색: 라이트 → 다크 */
const BG: Record<string, string> = {
  '#FFFFFF': '#1C1B24',
  '#FFF': '#1C1B24',
  '#FBFBFF': '#1C1B24',
  '#FAFAFC': '#23222C',
  '#F6F6F9': '#121118',
  '#F6F6FB': '#121118',
  '#F4F5F8': '#23222C',
  '#F7F7FA': '#23222C',
  '#F5F6FF': '#1E1D2C',
  '#EEF0FF': '#2A2850',
  '#E6E6FF': '#2A2850',
  '#EDEDF2': '#2A2933',
  '#ECEEF2': '#2E2D38',
  '#E9EAF0': '#2E2D38',
  '#F0F0F4': '#26252F',
  '#F2F2F7': '#26252F',
  '#EFEFF5': '#26252F',
  '#E4E4EA': '#3A3946',
  '#E4E4EC': '#3A3946',
  '#ECEDF2': '#3A3946',
  '#E4E5EC': '#3A3946',
  '#F1F2F6': '#3A3946',
  '#DCDDFF': '#23222C',
  '#C7C7D1': '#55546A',
  '#D4D4DC': '#55546A',
  '#1A1A1E': '#23222C',
  '#FBF4DC': '#3A3220',
  '#FFF9E0': '#3A3220',
  '#FFF4C2': '#3A3220',
  '#FFF1F2': '#2E2026',
  '#FFE4EC': '#2E2026',
  '#E7E2D6': '#23222C',
  '#E3D298': '#4A4028',
  // 기분 배경 (디자인 시스템 v2)
  '#E3E8F7': '#161C2E',
  '#C9D4EF': '#1E2740',
  '#EEE9F8': '#1C1730',
  '#DBD1F1': '#261E42',
  '#F4F2ED': '#1C1B18',
  '#E5E1D7': '#26241F',
  '#F6ECC6': '#2A2414',
  '#EEDFA6': '#3A3019',
  '#FCE9D8': '#2B1C14',
  '#F8D0AE': '#3A2519',
};

const norm = (c: string) => c.trim().toUpperCase();

function toHsl(hex: string): [number, number, number] | null {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.replace(/./g, (x) => x + x);
  if (!/^[0-9A-F]{6}$/.test(h)) return null;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const hue = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [hue * 60, s, l];
}

function toHex(h: number, s: number, l: number) {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/** 표에 없는 글자색: 무채색 진한 글자는 밝게, 옅은 회색 선은 어둡게, 진한 색 글자는 밝은 톤으로. */
function darkFg(hex: string) {
  const hsl = toHsl(hex);
  if (!hsl) return hex;
  const [h, s, l] = hsl;
  if (s < 0.15) return toHex(h, s, l < 0.6 ? 0.98 - 0.65 * l : Math.max(0.3, 1.15 - l));
  // 진하거나 중간 밝기의 색 글자(예: 기분별 #4F5B7A)는 같은 색조의 밝은 톤으로
  if (l < 0.55) return toHex(h, Math.min(s, 0.6), Math.max(0.72, 1 - l * 0.5));
  return hex;
}

/** 표에 없는 면 색: 아주 옅은 틴트만 같은 색조의 어두운 면으로 바꾸고, 진한 색 면은 그대로 둔다. */
function darkBg(hex: string) {
  const hsl = toHsl(hex);
  if (!hsl) return hex;
  const [h, s, l] = hsl;
  if (l < 0.82) return hex;
  return toHex(h, Math.min(s, 1) * 0.35, 0.12 + (1 - l) * 0.7);
}

const keep = (c: string) => c;

/** 현재 테마와, JS 색을 테마에 맞추는 함수. 라이트에서는 넘긴 색을 그대로 돌려준다. */
export function useTheme() {
  const isDark = useIsDark();
  return useMemo(
    () => ({
      isDark,
      /** 글자·아이콘 선 색 */
      fg: isDark ? (c: string) => FG[norm(c)] ?? (c.startsWith('#') ? darkFg(norm(c)) : c) : keep,
      /** 면(배경·채움·그라데이션) 색 */
      bg: isDark ? (c: string) => BG[norm(c)] ?? (c.startsWith('#') ? darkBg(norm(c)) : c) : keep,
    }),
    [isDark],
  );
}
