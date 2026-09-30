'use client';

import { useState, type InputHTMLAttributes } from 'react';

const ClearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" fill="#C4C4CC" />
    <path d="M7 7l6 6M13 7l-6 6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const EyeIcon = ({ off }: { off: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="#A8A8B0" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="2.8" stroke="#A8A8B0" strokeWidth="1.7" />
    {off && <path d="M4 4l16 16" stroke="#A8A8B0" strokeWidth="1.7" strokeLinecap="round" />}
  </svg>
);

/** Labeled text input from the v2 auth screens (gray fill → white + primary border on focus). */
export function Field({
  label,
  value,
  onChange,
  type = 'text',
  maxLength,
  error,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-[#48484F]">{label}</label>
      <div
        className={`flex items-center h-14 rounded-2xl px-4 gap-3 transition-colors border-[1.5px] ${
          focused ? 'bg-white border-primary' : 'bg-surface border-transparent'
        }`}
      >
        <input
          {...rest}
          type={isPassword && !reveal ? 'password' : isPassword ? 'text' : type}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 min-w-0 bg-transparent outline-none text-[16px] text-ink placeholder:text-mute caret-primary"
        />
        {focused && value && (
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onChange('')} aria-label="지우기">
            <ClearIcon />
          </button>
        )}
        {isPassword && (
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setReveal((r) => !r)} aria-label="비밀번호 보기">
            <EyeIcon off={reveal} />
          </button>
        )}
        {maxLength && !isPassword && !focused && (
          <span className="font-mono text-[13px] text-mute">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-[12px] text-danger">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" fill="#E5484D" />
            <path d="M10 5.5v5.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="14.3" r="1.2" fill="#fff" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export function RememberRow({ checked, onChange, forgotHref = '/forgot-password' }: { checked: boolean; onChange: (v: boolean) => void; forgotHref?: string }) {
  return (
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 cursor-pointer">
        <span
          className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center ${checked ? 'bg-primary' : 'border-[1.5px] border-[#D5D5DC]'}`}
        >
          {checked && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="text-[14px] text-[#48484F]">기억하기</span>
      </label>
      <a href={forgotHref} className="text-[13px] text-sub">
        비밀번호 찾으러 가기
      </a>
    </div>
  );
}
