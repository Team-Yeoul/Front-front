'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

/* ── Icons ─────────────────────────────────────────────── */

export const ChevronLeft = ({ size = 18, color = '#1A1A1E' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M15 5l-7 7 7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronRight = ({ size = 16, color = '#B4B4BB' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 5l7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CheckIcon = ({ size = 14, color = '#FFFFFF', width = 2.4 }: { size?: number; color?: string; width?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CloseIcon = ({ size = 22, color = '#1A1A1E' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ArrowUpIcon = ({ size = 18, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 19V5M6 11l6-6 6 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DownloadIcon = ({ size = 18, color = '#1A1A1E' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChatBubbleIcon = ({ size = 22, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4.5 5.5h15v10h-8l-4 3.5v-3.5h-3v-10Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="9" cy="10.5" r="1" fill={color} />
    <circle cx="12" cy="10.5" r="1" fill={color} />
    <circle cx="15" cy="10.5" r="1" fill={color} />
  </svg>
);

export const GearIcon = ({ size = 20, color = '#1A1A1E' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MessageSquareIcon = ({ size = 14, color = '#6367FF' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4.5 5.5h15v10h-8l-4 3.5v-3.5h-3v-10Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export const FlagIcon = ({ size = 13, color = '#6367FF' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 21V4h11l-2 4 2 4H5" stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export const LockIcon = ({ size = 28, color = '#1A1A1E' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4.5" y="10" width="15" height="11" rx="2.5" fill={color} />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke={color} strokeWidth="2.2" />
  </svg>
);

export const SearchIcon = ({ size = 18, color = '#8E8E95' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth="2" />
    <path d="M16 16l4 4" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ── 3D assets cropped from the v2 design ─────────────── */

export type Asset3D =
  | 'alarm' | 'bars' | 'bulb' | 'chat' | 'check' | 'clock' | 'cogni-headphone' | 'envelope' | 'fire'
  | 'flower' | 'gem' | 'lock3d' | 'magnifier' | 'mascot-glasses' | 'megaphone' | 'mug' | 'pen'
  | 'spring' | 'spy' | 'star' | 'star-pink';

export function Img3D({ name, size, className = '' }: { name: Asset3D; size: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/v2/${name}.png`} alt="" width={size} className={`h-auto select-none ${className}`} draggable={false} />
  );
}

/** 코그니 캐릭터 이미지 (로컬 에셋 경로 또는 서버 icon_url). */
export function CogniImg({ src, size, className = '' }: { src: string; size: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} className={`h-auto select-none object-contain ${className}`} draggable={false} />
  );
}

/* ── Buttons ───────────────────────────────────────────── */

type Variant = 'primary' | 'dark' | 'gray' | 'white' | 'danger';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-white',
  dark: 'bg-ink text-white',
  gray: 'bg-surface-2 text-ink',
  white: 'bg-white text-ink',
  danger: 'bg-danger-soft text-danger',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...rest}
      className={`w-full max-w-[382px] mx-auto h-[63px] rounded-2xl text-[16px] font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 ${VARIANT[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function TextButton({ children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className={`w-full h-11 text-[14px] font-semibold text-ink ${className}`}>
      {children}
    </button>
  );
}

export function BackButton({ onClick, href, className = '' }: { onClick?: () => void; href?: string; className?: string }) {
  const router = useRouter();
  const cls = `w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center shrink-0 ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} aria-label="뒤로가기">
        <ChevronLeft />
      </Link>
    );
  }
  return (
    <button onClick={onClick ?? (() => router.back())} className={cls} aria-label="뒤로가기">
      <ChevronLeft />
    </button>
  );
}

/** 40px round back button · centered title · optional right slot. */
export function TopBar({
  title,
  sub,
  right,
  onBack,
  backHref,
  noBack = false,
  className = '',
}: {
  title?: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  onBack?: () => void;
  backHref?: string;
  noBack?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative flex items-center justify-between h-14 px-5 shrink-0 ${className}`}>
      {noBack ? <span className="w-10" /> : <BackButton onClick={onBack} href={backHref} />}
      {title && (
        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className="text-[15px] font-semibold text-ink whitespace-nowrap">{title}</p>
          {sub && <p className="text-[11px] font-mono text-mute mt-0.5">{sub}</p>}
        </div>
      )}
      <div className="min-w-10 flex justify-end">{right}</div>
    </div>
  );
}

/* ── Selection controls ────────────────────────────────── */

export function CheckBox({ checked, round = false }: { checked: boolean; round?: boolean }) {
  return (
    <span
      className={`w-[22px] h-[22px] shrink-0 flex items-center justify-center ${round ? 'rounded-full' : 'rounded-[6px]'} ${
        checked ? 'bg-primary' : 'bg-white border-[1.5px] border-[#D5D5DC]'
      }`}
    >
      {checked && <CheckIcon size={13} />}
    </span>
  );
}

/** Row option used by onboarding / friend-evaluation lists. */
export function OptionRow({
  label,
  description,
  selected,
  onClick,
  round = false,
}: {
  label: ReactNode;
  description?: ReactNode;
  selected: boolean;
  onClick: () => void;
  round?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 rounded-2xl px-4 text-left transition-colors ${
        description ? 'py-3.5' : 'py-4'
      } ${selected ? 'bg-surface border border-primary' : 'bg-surface border border-transparent'}`}
    >
      <span className={description ? 'mt-0.5' : ''}>
        <CheckBox checked={selected} round={round} />
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-[15px] ${selected ? 'font-semibold text-ink' : 'text-[#48484F]'}`}>{label}</span>
        {description && (
          <span className={`block text-[13px] mt-1 ${selected ? 'text-primary' : 'text-sub'}`}>{description}</span>
        )}
      </span>
    </button>
  );
}

/** Two/three-way pill segmented control (텍스트 | 태그, 1년 미만 | 1-3년 …). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex p-1 bg-surface-2 rounded-2xl">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 h-10 rounded-xl text-[14px] transition-colors ${
            value === o.value ? 'bg-white font-semibold text-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)]' : 'text-sub'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Selectable chip (emotion tags, keywords). */
export function ChoiceChip({
  label,
  selected,
  onClick,
  size = 'md',
}: {
  label: ReactNode;
  selected: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full font-medium transition-colors ${size === 'sm' ? 'h-8 px-3.5 text-[13px]' : 'h-9 px-4 text-[14px]'} ${
        selected ? 'bg-primary text-white font-semibold' : 'bg-surface-2 text-[#48484F]'
      }`}
    >
      {label}
    </button>
  );
}

/** Small static tag (pattern / keyword labels). */
export function Tag({ children, tone = 'primary' }: { children: ReactNode; tone?: 'primary' | 'yellow' | 'gray' | 'solid' }) {
  const cls = {
    primary: 'bg-primary-soft text-primary',
    yellow: 'bg-yellow text-ink',
    gray: 'bg-surface-2 text-sub',
    solid: 'bg-primary text-white',
  }[tone];
  return <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-semibold ${cls}`}>{children}</span>;
}

/** Inline badge above a question (성장 맥락, 객관식 …). */
export function Badge({ children, tone = 'gray', icon }: { children: ReactNode; tone?: 'gray' | 'primary' | 'yellow'; icon?: ReactNode }) {
  const cls = { gray: 'bg-surface-2 text-[#48484F]', primary: 'bg-primary-soft text-primary', yellow: 'bg-[#FDEFB2] text-gold' }[tone];
  return (
    <span className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[12px] font-semibold ${cls}`}>
      {icon}
      {children}
    </span>
  );
}

/** Page dots (onboarding progress, carousel). */
export function Dots({ count, index, variant = 'dot' }: { count: number; index: number; variant?: 'dot' | 'bar' }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }, (_, i) =>
        variant === 'bar' ? (
          <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-ink' : 'w-1.5 bg-[#D0D0D6]'}`} />
        ) : (
          <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === index ? 'bg-primary w-2 h-2' : i < index ? 'bg-primary-line' : 'bg-[#D8D8DE]'}`} />
        ),
      )}
    </div>
  );
}

export function ProgressBar({ value, className = '', track = '#E9EAF0', fill = '#6367FF', height = 6 }: { value: number; className?: string; track?: string; fill?: string; height?: number }) {
  return (
    <div className={`w-full rounded-full overflow-hidden ${className}`} style={{ background: track, height }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: fill }} />
    </div>
  );
}

export function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => onChange(!on)}
      disabled={disabled}
      className={`relative w-[44px] h-[26px] rounded-full transition-colors disabled:opacity-50 ${on ? 'bg-primary' : 'bg-[#DADAE0]'}`}
      aria-pressed={on}
    >
      <span className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'left-[21px]' : 'left-[3px]'}`} />
    </button>
  );
}

/** Floating "분석 결과 물어보기" chat button. */
export function ChatFab({ onClick, className = '' }: { onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-[52px] h-[52px] rounded-full bg-primary flex items-center justify-center shadow-[0_8px_20px_rgba(99,103,255,0.35)] ${className}`}
      aria-label="분석 결과 물어보기"
    >
      <ChatBubbleIcon />
    </button>
  );
}

export function Toast({ message }: { message: string }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-28 z-40 flex items-center gap-2 h-10 px-4 rounded-xl bg-[#3A3A40] text-white text-[14px] animate-fade-in whitespace-nowrap">
      <span className="w-[18px] h-[18px] rounded-full bg-primary flex items-center justify-center">
        <CheckIcon size={11} />
      </span>
      {message}
    </div>
  );
}
