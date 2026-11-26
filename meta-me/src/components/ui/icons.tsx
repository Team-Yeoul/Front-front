'use client';

import { useTheme } from '@/lib/theme';

type IconProps = { size?: number; color?: string };

/** 색을 넘기지 않았을 때의 기본 회색·검정은 테마에 맞춘다. 넘겨받은 색은 그대로 쓴다. */
export function useIconColor(color: string | undefined, fallback: string) {
  const { fg } = useTheme();
  return color ?? fg(fallback);
}

export const ChevronLeft = ({ size = 18, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const ChevronRight = ({ size = 16, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#B4B4BB');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 5l7 7-7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const ChevronUp = ({ size = 10, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#48484F');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 15l6-6 6 6" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const ArrowRight = ({ size = 16, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#8E8E95');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/** 체크 경로 길이(viewBox 24 기준). 이만큼 감춰 뒀다가 0으로 줄이며 그린다. */
const CHECK_LEN = 20;

/**
 * 체크 표시. 나타날 때 선이 쓱 그려진다(Ease in out).
 * 목록처럼 한꺼번에 여러 개가 그려지는 곳은 draw={false}로 바로 보이게 할 수 있다.
 */
export function CheckIcon({ size = 14, color = '#FFFFFF', width = 2.4, draw = true }: IconProps & { width?: number; draw?: boolean }) {
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${CHECK_LEN} ${CHECK_LEN}`}
        style={draw ? { animation: 'check-draw 320ms cubic-bezier(0.65, 0, 0.35, 1) both' } : undefined}
      />
    </svg>
  );
}

export const CloseIcon = ({ size = 22, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
};

export const ArrowUpIcon = ({ size = 18, color = '#FFFFFF' }: IconProps) => (
  <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 19V5M6 11l6-6 6 6" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DownloadIcon = ({ size = 18, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const ChatBubbleIcon = ({ size = 22, color = '#FFFFFF' }: IconProps) => (
  <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4.5 5.5h15v10h-8l-4 3.5v-3.5h-3v-10Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <circle cx="9" cy="10.5" r="1" fill={color} />
    <circle cx="12" cy="10.5" r="1" fill={color} />
    <circle cx="15" cy="10.5" r="1" fill={color} />
  </svg>
);

export const MessageSquareIcon = ({ size = 14, color = '#6367FF' }: IconProps) => (
  <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4.5 5.5h15v10h-8l-4 3.5v-3.5h-3v-10Z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
  </svg>
);

export const FlagIcon = ({ size = 13, color = '#6367FF' }: IconProps) => (
  <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 21V4h11l-2 4 2 4H5" stroke={color} strokeWidth={2} strokeLinejoin="round" />
  </svg>
);

export const LockIcon = ({ size = 28, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4.5" y="10" width="15" height="11" rx="2.5" fill={color} />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke={color} strokeWidth={2.2} />
    </svg>
  );
};

export const SearchIcon = ({ size = 18, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#8E8E95');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth={2} />
      <path d="M16 16l4 4" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
};

export const GearIcon = ({ size = 20, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.8} />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const CalendarIcon = ({ size = 18, color: colorProp, width = 1.8 }: IconProps & { width?: number }) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke={color} strokeWidth={width} />
      <path d="M4 10h16M9 3v4M15 3v4" stroke={color} strokeWidth={width} strokeLinecap="round" />
    </svg>
  );
};

export const PencilIcon = ({ size = 20, color = '#6367FF' }: IconProps) => (
  <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);

export const ClearIcon = () => {
  const { fg } = useTheme();
  return (
    <svg className="shrink-0" width={20} height={20} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill={fg('#C4C4CC')} />
      <path d="M7 7l6 6M13 7l-6 6" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
};

export const EyeIcon = ({ off }: { off: boolean }) => {
  const c = useIconColor(undefined, '#A8A8B0');
  return (
    <svg className="shrink-0" width={20} height={20} viewBox="0 0 24 24" fill="none">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke={c} strokeWidth={1.7} />
      <circle cx="12" cy="12" r="2.8" stroke={c} strokeWidth={1.7} />
      {off && <path d="M4 4l16 16" stroke={c} strokeWidth={1.7} strokeLinecap="round" />}
    </svg>
  );
};

export const ErrorIcon = () => (
  <svg className="shrink-0" width={16} height={16} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" fill="#E5484D" />
    <path d="M10 5.5v5.5" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
    <circle cx="10" cy="14.3" r="1.2" fill="#fff" />
  </svg>
);

/* ── 하단 탭 아이콘 ─────────────────────────────── */

export const HomeIcon = ({ color }: { color: string }) => (
  <svg className="shrink-0" width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.5Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);

export const DiaryIcon = ({ color }: { color: string }) => (
  <svg className="shrink-0" width={24} height={24} viewBox="0 0 24 24" fill="none">
    <rect x="5" y="3.5" width="14" height="17" rx="2" stroke={color} strokeWidth={1.8} />
    <path d="M9 3.5v17M12 8h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

export const ChatIcon = ({ color }: { color: string }) => (
  <svg className="shrink-0" width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path d="M4.5 5.5h15v10h-8l-4 3.5v-3.5h-3v-10Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);

export const ReportIcon = ({ color }: { color: string }) => (
  <svg className="shrink-0" width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path d="M6 19v-6M12 19V6M18 19v-9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

export const MyIcon = ({ color }: { color: string }) => (
  <svg className="shrink-0" width={24} height={24} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8.5" r="3.5" stroke={color} strokeWidth={1.8} />
    <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

export const GoogleIcon = ({ size = 26 }: { size?: number }) => (
  <svg className="shrink-0" width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M18.1 10.2c0-.6-.06-1.18-.16-1.74H10v3.3h4.55a3.9 3.9 0 0 1-1.69 2.56v2.12h2.73C17.1 14.96 18.1 12.76 18.1 10.2z" fill="#4285F4" />
    <path d="M10 18.4c2.29 0 4.21-.76 5.61-2.06l-2.73-2.12C12.13 14.83 11.15 15.1 10 15.1c-2.21 0-4.08-1.49-4.75-3.5H2.43v2.19C3.82 16.69 6.72 18.4 10 18.4z" fill="#34A853" />
    <path d="M5.25 11.6A5.4 5.4 0 0 1 4.97 10c0-.55.1-1.09.28-1.6V6.21H2.43A9.24 9.24 0 0 0 1.4 10c0 1.48.35 2.88.97 4.13l2.88-2.53z" fill="#FBBC05" />
    <path d="M10 4.9c1.25 0 2.37.43 3.25 1.27l2.44-2.44C14.21 2.36 12.29 1.6 10 1.6 6.72 1.6 3.82 3.31 2.43 6l2.82 2.19C5.92 6.39 7.79 4.9 10 4.9z" fill="#EA4335" />
  </svg>
);

/* ── 인증 화면 입력칸 앞 아이콘 · 단계 타일 아이콘 ─────────── */

export const MailIcon = ({ size = 20, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke={color} strokeWidth={1.8} />
      <path d="M4 7.5l8 5.5 8-5.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const PadlockIcon = ({ size = 20, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4.5" y="10" width="15" height="11" rx="2.5" stroke={color} strokeWidth={1.8} />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10M12 14.5v2.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
};

export const UserIcon = ({ size = 20, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth={1.8} />
      <path d="M4.5 20c.8-3.6 3.8-6 7.5-6s6.7 2.4 7.5 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
};

export const KeyIcon = ({ size = 32, color = '#6367FF' }: IconProps) => (
  <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="15.5" cy="8.5" r="4.5" stroke={color} strokeWidth={1.8} />
    <path d="M12.3 11.7 4 20v-3h3v-3h3l2.3-2.3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16.5" cy="7.5" r="1.1" fill={color} />
  </svg>
);

/* ── v3 홈·탭바 아이콘 (웹 components/ui/icons.tsx와 같은 모양, 채운 아이콘) ── */

export const HomeBellIcon = ({ size = 26, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24">
      <path fill={color} d="M8.128 18H4.162c-.73-.031-1.263-.714-1.047-1.433l.063-.159l1.699-3.398c.055-.121.088-.2.108-.328L5 12.489V9c.009-.449.04-.84.118-1.282c.583-3.276 3.605-5.764 6.929-5.717c3.319.047 6.248 2.416 6.835 5.717c.078.442.109.833.118 1.282v3.489l.015.193c.02.128.053.207.108.328l1.699 3.398l.063.159c.216.719-.316 1.402-1.047 1.433h-3.966c-1.148 3.988-6.596 3.988-7.744 0m2.142 0c.89 1.338 2.57 1.338 3.46 0Zm-4.652-2h12.764l-1.065-2.13a3.2 3.2 0 0 1-.29-.957L17 12.528V9.024a5.5 5.5 0 0 0-.201-1.428c-1.203-4.126-6.756-4.887-9.038-1.248c-.509.813-.738 1.723-.761 2.676v3.504l-.027.385a3.2 3.2 0 0 1-.29.957Z" />
    </svg>
  );
};

export const HomeGearIcon = ({ size = 26, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24">
      <path fill={color} d="M12.474 8.03a3.9 3.9 0 0 1 2.02.845c3.12 2.54 1.029 7.522-2.968 7.096a3.9 3.9 0 0 1-2.02-.845c-3.12-2.54-1.029-7.522 2.968-7.096m-.747 1.991c-.43.058-.833.26-1.14.567c-1.345 1.345-.195 3.646 1.686 3.392c.43-.058.833-.26 1.14-.567c1.345-1.345.195-3.646-1.686-3.392m3.375-7.488c.414.054.809.251 1.178.429c.526.254.938.493 1.42.823c.36.246.813.538 1.046.937c.245.421.18.833.177 1.296a3.4 3.4 0 0 0 .44 1.732c.241.418.576.773.97 1.051c.605.427 1.234.519 1.474 1.309c.258.851.281 3.12-.057 3.938c-.083.2-.217.387-.379.532c-.213.189-.484.286-.728.425a3.4 3.4 0 0 0-1.28 1.247a3.4 3.4 0 0 0-.44 1.732c.002.28.053.563-.005.842a1.5 1.5 0 0 1-.269.592c-.542.707-2.515 1.821-3.384 2.023c-.803.187-1.198-.313-1.87-.623A3.3 3.3 0 0 0 12 20.503c-.482 0-.958.113-1.395.315c-.792.366-1.134.895-2.082.561c-.789-.279-1.535-.69-2.223-1.161c-.484-.331-.987-.668-1.176-1.244c-.108-.331-.049-.648-.047-.99a3.4 3.4 0 0 0-.44-1.732a3.3 3.3 0 0 0-.97-1.05c-.605-.427-1.234-.52-1.474-1.309c-.263-.868-.263-2.916 0-3.784c.067-.219.176-.404.329-.574c.232-.261.537-.368.834-.537c.42-.239.795-.556 1.083-.945a3.3 3.3 0 0 0 .623-1.667c.058-.637-.132-1.252.289-1.802c.252-.328.614-.57.949-.799c.482-.33.894-.569 1.42-.823c.396-.191.88-.442 1.347-.444c.487-.002.812.261 1.212.495A3.4 3.4 0 0 0 12 3.5c.482 0 .958-.114 1.395-.316c.581-.268 1.019-.741 1.707-.651M7.064 5.715c.119 2.215-.998 4.151-2.977 5.155a8.7 8.7 0 0 0 0 2.263c1.979 1.003 3.096 2.939 2.977 5.154c.61.468 1.248.838 1.958 1.133c1.86-1.212 4.096-1.212 5.956 0a8.6 8.6 0 0 0 1.958-1.133c-.119-2.215.998-4.15 2.977-5.154a8.7 8.7 0 0 0 0-2.263c-1.979-1.004-3.096-2.94-2.977-5.155a8.6 8.6 0 0 0-1.959-1.133c-1.859 1.212-4.095 1.212-5.954 0a8.6 8.6 0 0 0-1.959 1.133" />
    </svg>
  );
};

export const TabHomeIcon = ({ size = 22, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24">
      <path fill={color} d="M13.2 2.65a2 2 0 0 0-2.4 0l-7 5.25A2 2 0 0 0 3 9.5V19a2 2 0 0 0 2 2h3.9a1.1 1.1 0 0 0 1.1-1.1V15a2 2 0 1 1 4 0v4.9a1.1 1.1 0 0 0 1.1 1.1H19a2 2 0 0 0 2-2V9.5a2 2 0 0 0-.8-1.6z" />
    </svg>
  );
};

export const TabDiaryIcon = ({ size = 22, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24">
      <path fillRule="evenodd" fill={color} d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h11a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3zm4 2H6v16h11a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-1v8.976c0 .9-1.088 1.35-1.724.714L13 12.414l-1.276 1.276c-.636.636-1.724.186-1.724-.714zm4 0h-2v6.586l.286-.286a1.01 1.01 0 0 1 1.428 0l.286.286z" />
    </svg>
  );
};

export const TabChatIcon = ({ size = 22, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24">
      <path fill={color} d="M2 8a5 5 0 0 1 5-5h6a1 1 0 1 1 0 2H7a3 3 0 0 0-3 3v11h13a3 3 0 0 0 3-3v-4a1 1 0 1 1 2 0v4a5 5 0 0 1-5 5H3a1 1 0 0 1-1-1zm6 5v-2a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0m6 0v-2a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0m6-12a1 1 0 0 1 .946.677l.13.378c.3.879.99 1.57 1.87 1.87l.377.129a1 1 0 0 1 0 1.892l-.378.13c-.879.3-1.57.99-1.87 1.87l-.129.377a1 1 0 0 1-1.892 0l-.13-.378a3 3 0 0 0-1.87-1.87l-.377-.129a1 1 0 0 1 0-1.892l.378-.13c.879-.3 1.57-.99 1.87-1.87l.129-.377.062-.146A1 1 0 0 1 20 1m0 3.196a5 5 0 0 1-.804.804q.449.355.804.803.356-.447.803-.803A5 5 0 0 1 20 4.196" />
    </svg>
  );
};

export const TabReportIcon = ({ size = 22, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24">
      <path fill={color} d="M14 3a2 2 0 0 1 2 2v3h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h4V5a2 2 0 0 1 2-2zm0 2h-4v14h4zm6 5h-4v9h4zM8 13H4v6h4z" />
    </svg>
  );
};

export const TabMyIcon = ({ size = 22, color: colorProp }: IconProps) => {
  const color = useIconColor(colorProp, '#1A1A1E');
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24">
      <path fillRule="evenodd" fill={color} d="M12 13c2.396 0 4.575.694 6.178 1.672.8.488 1.484 1.064 1.978 1.69.486.615.844 1.351.844 2.138 0 .845-.411 1.511-1.003 1.986-.56.45-1.299.748-2.084.956-1.578.417-3.684.558-5.913.558s-4.335-.14-5.913-.558c-.785-.208-1.524-.506-2.084-.956C3.41 20.01 3 19.345 3 18.5c0-.787.358-1.523.844-2.139.494-.625 1.177-1.2 1.978-1.69C7.425 13.695 9.605 13 12 13m0 2c-2.023 0-3.843.59-5.136 1.379-.647.394-1.135.822-1.45 1.222-.324.41-.414.72-.414.899 0 .122.037.251.255.426.249.2.682.407 1.344.582C7.917 19.858 9.811 20 12 20c2.19 0 4.083-.143 5.4-.492.663-.175 1.096-.382 1.345-.582.218-.175.255-.304.255-.426 0-.18-.09-.489-.413-.899-.316-.4-.804-.828-1.451-1.222C15.843 15.589 14.023 15 12 15m0-13a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6" />
    </svg>
  );
};
