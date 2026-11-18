import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = { size?: number; color?: string };

export const ChevronLeft = ({ size = 18, color = '#1A1A1E' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChevronRight = ({ size = 16, color = '#B4B4BB' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5l7 7-7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChevronUp = ({ size = 10, color = '#48484F' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 15l6-6 6 6" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ArrowRight = ({ size = 16, color = '#8E8E95' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CheckIcon = ({ size = 14, color = '#FFFFFF', width = 2.4 }: IconProps & { width?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CloseIcon = ({ size = 22, color = '#1A1A1E' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const ArrowUpIcon = ({ size = 18, color = '#FFFFFF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 19V5M6 11l6-6 6 6" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const DownloadIcon = ({ size = 18, color = '#1A1A1E' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 4v11M7 10l5 5 5-5M5 20h14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChatBubbleIcon = ({ size = 22, color = '#FFFFFF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4.5 5.5h15v10h-8l-4 3.5v-3.5h-3v-10Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Circle cx="9" cy="10.5" r="1" fill={color} />
    <Circle cx="12" cy="10.5" r="1" fill={color} />
    <Circle cx="15" cy="10.5" r="1" fill={color} />
  </Svg>
);

export const MessageSquareIcon = ({ size = 14, color = '#6367FF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4.5 5.5h15v10h-8l-4 3.5v-3.5h-3v-10Z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
  </Svg>
);

export const FlagIcon = ({ size = 13, color = '#6367FF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 21V4h11l-2 4 2 4H5" stroke={color} strokeWidth={2} strokeLinejoin="round" />
  </Svg>
);

export const LockIcon = ({ size = 28, color = '#1A1A1E' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4.5" y="10" width="15" height="11" rx="2.5" fill={color} />
    <Path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke={color} strokeWidth={2.2} />
  </Svg>
);

export const SearchIcon = ({ size = 18, color = '#8E8E95' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth={2} />
    <Path d="M16 16l4 4" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const GearIcon = ({ size = 20, color = '#1A1A1E' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.8} />
    <Path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CalendarIcon = ({ size = 18, color = '#1A1A1E', width = 1.8 }: IconProps & { width?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="5" width="16" height="15" rx="2.5" stroke={color} strokeWidth={width} />
    <Path d="M4 10h16M9 3v4M15 3v4" stroke={color} strokeWidth={width} strokeLinecap="round" />
  </Svg>
);

export const PencilIcon = ({ size = 20, color = '#6367FF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
  </Svg>
);

export const ClearIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="9" fill="#C4C4CC" />
    <Path d="M7 7l6 6M13 7l-6 6" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

export const EyeIcon = ({ off }: { off: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="#A8A8B0" strokeWidth={1.7} />
    <Circle cx="12" cy="12" r="2.8" stroke="#A8A8B0" strokeWidth={1.7} />
    {off && <Path d="M4 4l16 16" stroke="#A8A8B0" strokeWidth={1.7} strokeLinecap="round" />}
  </Svg>
);

export const ErrorIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="9" fill="#E5484D" />
    <Path d="M10 5.5v5.5" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
    <Circle cx="10" cy="14.3" r="1.2" fill="#fff" />
  </Svg>
);

/* ── 하단 탭 아이콘 ─────────────────────────────── */

export const HomeIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.5Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
  </Svg>
);

export const DiaryIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="3.5" width="14" height="17" rx="2" stroke={color} strokeWidth={1.8} />
    <Path d="M9 3.5v17M12 8h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const ChatIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M4.5 5.5h15v10h-8l-4 3.5v-3.5h-3v-10Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
  </Svg>
);

export const ReportIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M6 19v-6M12 19V6M18 19v-9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const MyIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8.5" r="3.5" stroke={color} strokeWidth={1.8} />
    <Path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const GoogleIcon = ({ size = 26 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path d="M18.1 10.2c0-.6-.06-1.18-.16-1.74H10v3.3h4.55a3.9 3.9 0 0 1-1.69 2.56v2.12h2.73C17.1 14.96 18.1 12.76 18.1 10.2z" fill="#4285F4" />
    <Path d="M10 18.4c2.29 0 4.21-.76 5.61-2.06l-2.73-2.12C12.13 14.83 11.15 15.1 10 15.1c-2.21 0-4.08-1.49-4.75-3.5H2.43v2.19C3.82 16.69 6.72 18.4 10 18.4z" fill="#34A853" />
    <Path d="M5.25 11.6A5.4 5.4 0 0 1 4.97 10c0-.55.1-1.09.28-1.6V6.21H2.43A9.24 9.24 0 0 0 1.4 10c0 1.48.35 2.88.97 4.13l2.88-2.53z" fill="#FBBC05" />
    <Path d="M10 4.9c1.25 0 2.37.43 3.25 1.27l2.44-2.44C14.21 2.36 12.29 1.6 10 1.6 6.72 1.6 3.82 3.31 2.43 6l2.82 2.19C5.92 6.39 7.79 4.9 10 4.9z" fill="#EA4335" />
  </Svg>
);
