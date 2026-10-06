import { useEffect } from 'react';
import { DEFAULT_STATUS_BAR_THEME, useStatusBarStore, type StatusBarTheme } from '@/store';

/** Sets the mock status bar's color (desktop preview only) to match this page's own top background. */
export function useStatusBarTheme(
  bg: string,
  fg: StatusBarTheme['fg'] = 'dark',
  indicator: NonNullable<StatusBarTheme['indicator']> = 'dark',
) {
  const setTheme = useStatusBarStore((s) => s.setTheme);

  useEffect(() => {
    setTheme({ bg, fg, indicator });
    return () => setTheme(DEFAULT_STATUS_BAR_THEME);
  }, [bg, fg, indicator, setTheme]);
}
