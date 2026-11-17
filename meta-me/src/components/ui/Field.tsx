'use client';

import { useState, type InputHTMLAttributes, type ReactNode } from 'react';

const ClearIcon = () => (
  <span className="w-5 h-5 rounded-full bg-[#C4C7D0] flex items-center justify-center text-white">
    <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M10.586 12.001L4.929 6.344c-.359-.41-.404-1.01 0-1.414c.404-.405 1.005-.359 1.414 0L12 10.586l5.657-5.656c.409-.359 1.01-.404 1.414 0s.359 1.005 0 1.414l-5.657 5.657l5.657 5.656c.359.41.404 1.011 0 1.415s-1.005.359-1.414 0L12 13.415l-5.657 5.657c-.409.359-1.01.404-1.414 0s-.359-1.005 0-1.414Z"
      />
    </svg>
  </span>
);

/** 눈 아이콘: 열린 눈(비밀번호 보기) / 감은 눈(가리기). */
const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#A1A1AA"
      d={
        open
          ? 'M15.446 12.237c-.837 1.246-1.389 2.48-2.978 2.73c-2.391.375-4.237-2.131-3.158-4.302c.198-.399.486-.751.836-1.026l1.616-1.087l.287 1.881a2.01 2.01 0 0 0 1.517 1.516ZM12.752 4.03c3.401.273 6.907 2.548 8.539 5.554c.4.737.711 1.567.711 2.416c0 1.224-.616 2.403-1.315 3.37c-2.12 2.935-5.783 4.895-9.439 4.6c-3.401-.273-6.907-2.548-8.539-5.554c-.4-.737-.711-1.567-.711-2.416c0-1.224.616-2.403 1.315-3.37c2.12-2.935 5.783-4.895 9.439-4.6m-1.343 1.995c-1.155.093-2.276.461-3.291 1.012c-1.547.839-3.09 2.223-3.825 3.852c-.155.345-.291.727-.291 1.111c0 .791.488 1.582.933 2.199c1.834 2.538 5.085 4.209 8.237 3.706c1.137-.181 2.225-.621 3.2-1.227c1.366-.85 2.664-2.08 3.335-3.567c.155-.345.291-.727.291-1.111c0-.791-.488-1.582-.933-2.199c-1.714-2.372-4.693-4.015-7.656-3.776'
          : 'm15.528 15.302l.414 1.547l.034.259c.001.872-1.09 1.324-1.707.707c-.142-.142-.195-.26-.258-.448l-.41-1.528a10 10 0 0 1-3.202 0l-.41 1.528c-.063.188-.116.306-.258.448c-.617.617-1.708.165-1.708-.707l.035-.259l.414-1.547c-1.009-.376-1.884-.97-2.704-1.657l-1.193 1.194c-.149.13-.254.206-.448.258c-.843.226-1.561-.71-1.125-1.466l.159-.207l1.272-1.272c-.595-.865-1.1-1.806-1.379-2.826l-.052-.256c-.052-.754.757-1.3 1.436-.969c.514.251.569.822.758 1.301l.284.635q.296.592.696 1.12c1.368 1.809 3.572 2.816 5.824 2.816s4.456-1.007 5.824-2.816q.399-.528.696-1.12l.284-.635c.189-.479.244-1.05.757-1.301c.68-.331 1.489.215 1.436.969c-.018.265-.296.972-.317 1.025c-.281.739-.667 1.409-1.113 2.057l1.272 1.272l.159.207c.436.756-.282 1.692-1.125 1.466c-.194-.052-.299-.128-.448-.258l-1.193-1.194c-.82.687-1.696 1.281-2.704 1.657'
      }
    />
  </svg>
);

/** 입력칸 앞에 붙는 아이콘 (비밀번호 찾기 화면). */
export const MailIcon = ({ color = '#1A1A1E', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path
      fill={color}
      d="M22 17.04c-.067 1.67-1.29 2.893-2.96 2.96H4.96c-1.67-.067-2.893-1.29-2.96-2.96V6.96a3.1 3.1 0 0 1 .332-1.34C2.849 4.623 3.854 4.045 4.96 4h14.08c1.67.067 2.893 1.29 2.96 2.96ZM4 9.456v7.504c.025.622.418 1.015 1.04 1.04h13.92c.336-.014.641-.132.845-.412c.138-.188.186-.398.195-.628V9.456l-6.28 4.536c-1.102.721-2.338.721-3.44 0Zm.004-2.464l7.374 5.325c.41.269.834.269 1.244 0l7.374-5.325c-.051-.603-.428-.968-1.036-.992H5.04c-.608.024-.985.389-1.036.992"
    />
  </svg>
);

export const PadlockIcon = ({ color = '#1A1A1E', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path
      fill={color}
      d="M13 15.727V17l-.034.259c-.226.842-1.396.996-1.832.241c-.101-.175-.121-.302-.134-.5v-1.273c-.895-.569-1.287-1.617-.802-2.609A2.02 2.02 0 0 1 12 11.993a2.02 2.02 0 0 1 1.802 1.125c.485.992.093 2.04-.802 2.609M6 8c.026-.614.085-1.194.269-1.784c.911-2.932 3.932-4.71 6.939-4.095a6 6 0 0 1 3.035 1.636C17.432 4.945 17.93 6.347 18 8c.196 0 1.087-.04 1.458.046c.9.21 1.49.995 1.542 1.897v10.114c-.063 1.1-.843 1.88-1.943 1.943H4.943c-.445-.026-.846-.153-1.198-.435c-.47-.377-.711-.915-.745-1.508V9.943c.052-.902.642-1.687 1.542-1.897C4.913 7.96 5.804 8 6 8m-.994 2.006v9.988h13.988v-9.988ZM8.001 8h7.998c-.018-.361-.009-.454-.082-.807a4 4 0 0 0-1.089-2.021c-1.882-1.881-5.076-1.414-6.345.922c-.326.601-.448 1.23-.482 1.906"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#A1A1AA"
      d="M7 5V4a1.04 1.04 0 0 1 .22-.625c.51-.637 1.568-.401 1.754.396L9 4v1h6V4a1.04 1.04 0 0 1 .22-.625c.51-.637 1.568-.401 1.754.396L17 4v1h2c.641.026 1.229.293 1.614.819c.257.351.369.751.386 1.181v12c-.046 1.146-.854 1.954-2 2H5c-.535-.022-1.03-.202-1.414-.586S3.022 19.535 3 19V7c.022-.535.202-1.03.586-1.414S4.465 5.022 5 5Zm12 7H5v7h14ZM5 10h14V7H5Z"
    />
  </svg>
);

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[13px] text-danger">
      <span className="w-4 h-4 rounded-full bg-danger text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">
        !
      </span>
      {children}
    </p>
  );
}

/**
 * 입력칸 테두리·배경. 비어 있으면 흰 바탕, 값이 있으면 회색 바탕, 포커스면 보라 테두리, 오류면 빨간 테두리.
 * (생년월일 칸처럼 input이 아닌 버튼에도 같은 모양을 쓴다)
 */
export function fieldBoxClass({ focused, filled, error }: { focused?: boolean; filled?: boolean; error?: boolean }) {
  const state = error
    ? 'bg-[#FFF1F2] border-[1.5px] border-danger'
    : focused
      ? 'bg-white border-[1.5px] border-primary'
      : filled
        ? 'bg-surface border border-[#ECEEF2]'
        : 'bg-white border border-[#ECEEF2]';
  return `flex items-center h-15 rounded-xl px-4 gap-3 transition-colors ${state}`;
}

/** v3 시안의 입력칸. 라벨은 선택이고, 앞에 아이콘을 붙일 수 있다. */
export function Field({
  label,
  value,
  onChange,
  type = 'text',
  maxLength,
  error,
  icon,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  /** 문자열이면 칸 아래에 문구까지 띄우고, true면 테두리만 빨갛게 한다. */
  error?: string | boolean;
  /** 입력칸 앞 아이콘. (focused) => 아이콘 */
  icon?: (focused: boolean) => ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-[13px] font-medium text-[#52525B]">{label}</label>}
      <div className={fieldBoxClass({ focused, filled: value.length > 0, error: !!error })}>
        {icon?.(focused)}
        <input
          {...rest}
          type={isPassword && !reveal ? 'password' : isPassword ? 'text' : type}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`flex-1 min-w-0 bg-transparent outline-none text-[15px] text-ink placeholder:text-[#A8ACB8] caret-primary ${
            isPassword && !reveal && value ? 'tracking-[0.1em]' : ''
          }`}
        />
        {value && (focused || (error && !isPassword)) && (
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onChange('')} aria-label="지우기">
            <ClearIcon />
          </button>
        )}
        {isPassword && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? '비밀번호 가리기' : '비밀번호 보기'}
          >
            <EyeIcon open={!reveal} />
          </button>
        )}
        {maxLength && !isPassword && !focused && !error && (
          <span className="text-[13px] text-[#A8ACB8]">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {typeof error === 'string' && error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

/** 탭하면 시트가 열리는 선택 칸 (생년월일). */
export function SelectField({ label, value, placeholder, onClick, active }: { label: string; value?: string; placeholder: string; onClick: () => void; active?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-[#52525B]">{label}</span>
      <button type="button" onClick={onClick} className={`${fieldBoxClass({ focused: active, filled: !!value })} justify-between text-left`}>
        <span className={`text-[15px] ${value ? 'text-ink' : 'text-[#A8ACB8]'}`}>{value || placeholder}</span>
        <CalendarIcon />
      </button>
    </div>
  );
}

export function RememberRow({ checked, onChange, forgotHref = '/forgot-password' }: { checked: boolean; onChange: (v: boolean) => void; forgotHref?: string }) {
  return (
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 cursor-pointer">
        <span className={`w-4.5 h-4.5 rounded flex items-center justify-center ${checked ? 'bg-primary' : 'border-[1.5px] border-[#C7C7D1]'}`}>
          {checked && (
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#FFFFFF"
                d="M9.171 16.072L19.778 5.465c.409-.359 1.01-.404 1.414 0c.404.405.359 1.005 0 1.415L9.878 18.193c-.204.179-.429.293-.707.293s-.503-.114-.707-.293l-5.657-5.657c-.297-.339-.393-.8-.159-1.207c.34-.588 1.092-.629 1.574-.207Z"
              />
            </svg>
          )}
        </span>
        <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="text-[14px] text-[#3F3F46]">기억하기</span>
      </label>
      <a href={forgotHref} className="text-[13px] text-[#8A8A96]">
        비밀번호 찾으러 가기
      </a>
    </div>
  );
}

/* ── 비밀번호 강도 ─────────────────────────────────────── */

/** 길이 8자 이상 · 영문 · 숫자 · 특수문자 중 몇 개를 만족하는지 (0~4). */
export function passwordScore(pw: string) {
  if (!pw) return 0;
  return [pw.length >= 8, /[A-Za-z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
}

const STRENGTH = [
  { color: '#E5484D', label: '너무 약해요 · 영문과 숫자를 섞어 8자 이상으로' },
  { color: '#E5484D', label: '너무 약해요 · 영문과 숫자를 섞어 8자 이상으로' },
  { color: '#E8A317', label: '보통이에요 · 특수문자를 더하면 안전해요' },
  { color: '#E8A317', label: '보통이에요 · 특수문자를 더하면 안전해요' },
  { color: '#22A861', label: '안전해요' },
];

/** 4칸 강도 막대. withLabel이면 아래에 한 줄 안내를 붙인다. */
export function PasswordStrength({ password, withLabel = true }: { password: string; withLabel?: boolean }) {
  const score = passwordScore(password);
  const { color, label } = STRENGTH[score];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className="flex-1 h-[5px] rounded-full transition-colors" style={{ background: i <= score ? color : '#ECEEF2' }} />
        ))}
      </div>
      {withLabel && password && (
        <p className="text-[13px] font-semibold" style={{ color }}>
          {label}
        </p>
      )}
    </div>
  );
}

/** 체크 동그라미 + 조건 문구 (8자 이상 ✓ …). */
export function RuleCheck({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-ink">
      <span className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${ok ? 'bg-primary' : 'bg-[#D4D6DD]'}`}>
        <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#FFFFFF"
            d="M9.171 16.072L19.778 5.465c.409-.359 1.01-.404 1.414 0c.404.405.359 1.005 0 1.415L9.878 18.193c-.204.179-.429.293-.707.293s-.503-.114-.707-.293l-5.657-5.657c-.297-.339-.393-.8-.159-1.207c.34-.588 1.092-.629 1.574-.207Z"
          />
        </svg>
      </span>
      {children}
    </span>
  );
}
