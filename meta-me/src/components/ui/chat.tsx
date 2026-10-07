'use client';

import type { ReactNode } from 'react';
import { ArrowUpIcon } from './primitives';

export function AiAvatar({ size = 28 }: { size?: number }) {
  return (
    <span
      className="rounded-full shrink-0 inline-block"
      style={{
        width: size,
        height: size,
        backgroundImage: 'radial-gradient(circle at 35% 30%, #B7B9FF 0%, #7B7FFF 45%, #4F52E5 100%)',
      }}
    />
  );
}

export function AiBubble({ children, badge, footer }: { children: ReactNode; badge?: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex items-end gap-2 pr-6">
      <AiAvatar />
      <div className="min-w-0 max-w-[88%]">
        <div className="bg-[#F7F7FA] rounded-[20px] rounded-bl-md px-4 py-3.5 shadow-[0_4px_14px_rgba(26,26,30,0.05)]">
          {badge && (
            <span className="inline-flex h-6 px-2.5 mb-2 rounded-full bg-[#FDEFB2] text-[11px] font-semibold text-gold items-center">
              {badge}
            </span>
          )}
          <div className="text-[15px] text-ink leading-[1.6] whitespace-pre-line">{children}</div>
          {footer}
        </div>
      </div>
    </div>
  );
}

export function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end pl-12">
      <div className="bg-primary text-white rounded-[20px] rounded-br-md px-4 py-3 text-[15px] leading-[1.6] whitespace-pre-line">
        {children}
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <AiAvatar />
      <div className="bg-[#F7F7FA] rounded-[18px] px-4 py-3.5 flex gap-1.5 shadow-[0_4px_14px_rgba(26,26,30,0.05)]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 140}ms`, opacity: 0.35 + i * 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

export function OutlineChip({ children, onClick, active = false }: { children: ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 px-3.5 rounded-full text-[13px] font-medium border transition-colors ${
        active ? 'border-primary text-primary bg-primary-soft' : 'border-[#DEDEE4] text-[#48484F] bg-white'
      }`}
    >
      {children}
    </button>
  );
}

/** Rounded input panel with a send button and optional quick-action chips. */
export function Composer({
  value,
  onChange,
  onSend,
  placeholder,
  chips,
  disabled = false,
  disabledLabel,
  disabledHint,
  sendEnabled,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder: string;
  chips?: ReactNode;
  disabled?: boolean;
  disabledLabel?: string;
  disabledHint?: string;
  /** Override for turns where sending doesn't depend on the text (e.g. a picked chip). */
  sendEnabled?: boolean;
  maxLength?: number;
}) {
  const canSend = !disabled && (sendEnabled ?? value.trim().length > 0);
  return (
    <div className="rounded-3xl bg-[#F4F4F8] border border-[#EDEDF2] px-4 pt-3.5 pb-3 shadow-[0_-4px_20px_rgba(26,26,30,0.04)]">
      {disabled ? (
        <div className="flex items-center gap-2 h-7 text-[15px] text-mute">
          <span className="w-5 h-5 rounded-full border-2 border-[#CFCFD6]" />
          {disabledLabel}
        </div>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && canSend) onSend();
          }}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full h-7 bg-transparent outline-none text-[15px] text-ink placeholder:text-mute"
        />
      )}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 min-w-0 overflow-x-auto no-scrollbar">
          {disabled ? <span className="text-[12px] text-mute">{disabledHint}</span> : chips}
        </div>
        <button
          onClick={onSend}
          disabled={!canSend}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${canSend ? 'bg-primary' : disabled ? 'bg-[#DEDEE4]' : 'bg-primary'}`}
          aria-label="보내기"
        >
          <ArrowUpIcon />
        </button>
      </div>
    </div>
  );
}
