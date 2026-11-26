'use client';

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { Pressable, View } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import { ChevronRight } from '@/components/ui/icons';
import { chatKindLabel, chatPreview, chatTitle, hhmm } from '@/lib/chatLabels';
import type { SavedChat } from '@/store';
import { useTheme } from '@/lib/theme';

/** iOS 기본 목록 동작처럼: 카드와 붙어 있는 꽉 찬 높이의 버튼, 아이콘 위 · 글자 아래 */
const ACTION_W = 80;
// iOS 시스템 색: 고정(주황) · 삭제(빨강)
export const IOS_ORANGE = '#FF9500';
export const IOS_RED = '#FF3B30';
// 카드: 배경 #F4F4FA · 안쪽 여백 16 (px-4 py-4)
const CARD_BG = '#F4F4FA';
// 앱 Swipeable 설정과 같은 값: 끄는 거리 대비 움직임(friction) · 열리는 기준(threshold)
const FRICTION = 1.6;
const LEFT_THRESHOLD = ACTION_W * 0.7;
const RIGHT_THRESHOLD = ACTION_W * 0.5;
/** 이만큼 움직여야 밀기로 본다(그 전에는 탭·세로 스크롤) */
const SLOP = 8;
const LONG_PRESS_MS = 400;

/** 밀기 시작했을 때만 보이는 판(닫혀 있을 때 카드 뒤에서 비치지 않게). */
function ActionPanel({ visible, color, side, children }: { visible: boolean; color: string; side: 'left' | 'right'; children: ReactNode }) {
  return (
    <View
      className={`absolute top-0 bottom-0 ${side === 'left' ? 'left-0' : 'right-0'}`}
      style={{ width: ACTION_W, backgroundColor: color, opacity: visible ? 1 : 0 }}
    >
      {children}
    </View>
  );
}

/** 채워진 핀 (SF Symbols pin.fill 느낌) */
export const PinIcon = ({ size = 20, color = '#FFFFFF', off = false }: { size?: number; color?: string; off?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
    <path d="M8.5 3h7a1 1 0 0 1 .8 1.6L15 6.4V10l2.6 2.6A1 1 0 0 1 16.9 14.3H13v6l-1 1.5-1-1.5v-6H7.1a1 1 0 0 1-.7-1.7L9 10V6.4L7.7 4.6A1 1 0 0 1 8.5 3Z" fill={color} />
    {off && <path d="M4 4l16 16" stroke={color === '#FFFFFF' ? IOS_ORANGE : '#FFFFFF'} strokeWidth={3.5} strokeLinecap="round" />}
    {off && <path d="M4 4l16 16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />}
  </svg>
);
/** 채워진 휴지통 (SF Symbols trash.fill 느낌) */
export const TrashIcon = ({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
    <path
      d="M9 2.5h6a1 1 0 0 1 1 1V5h4a1 1 0 1 1 0 2h-1l-.9 12.6A2.5 2.5 0 0 1 15.6 22H8.4a2.5 2.5 0 0 1-2.5-2.4L5 7H4a1 1 0 1 1 0-2h4V3.5a1 1 0 0 1 1-1Zm1 2.5h4V4.5h-4V5Z"
      fill={color}
    />
  </svg>
);

/**
 * 지난 대화 한 줄. 왼쪽→오른쪽으로 밀면 위에 고정(다시 밀면 해제), 오른쪽→왼쪽으로 밀면 '삭제' 버튼이 나온다.
 * 길게 누르면 같은 동작을 고르는 메뉴(onLongPress)를 띄운다.
 * (웹: 앱의 react-native-gesture-handler Swipeable 대신 포인터 이벤트로 같은 동작을 만든다. 마우스로 끌어도 된다.)
 */
export function ChatRow({
  chat,
  pinned,
  onOpen,
  onTogglePin,
  onDelete,
  onLongPress,
}: {
  chat: SavedChat;
  pinned: boolean;
  onOpen: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  onLongPress: () => void;
}) {
  const { fg, bg } = useTheme();
  // 카드가 옆으로 밀린 거리(+는 왼쪽 판(고정), -는 오른쪽 판(삭제)이 보인다)
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; sx: number; sy: number; base: number; active: boolean } | null>(null);
  const longTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 밀었거나 길게 누른 뒤 따라오는 click은 대화 열기로 보지 않는다.
  const suppressClick = useRef(false);

  const clearLong = () => {
    if (longTimer.current) clearTimeout(longTimer.current);
    longTimer.current = null;
  };
  useEffect(
    () => () => {
      clearLong();
      if (pinTimer.current) clearTimeout(pinTimer.current);
    },
    [],
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, base: x, active: false };
    suppressClick.current = false;
    clearLong();
    longTimer.current = setTimeout(() => {
      longTimer.current = null;
      drag.current = null;
      suppressClick.current = true;
      onLongPress();
    }, LONG_PRESS_MS);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.active) {
      if (Math.abs(dx) > SLOP && Math.abs(dx) > Math.abs(dy)) {
        d.active = true;
        clearLong();
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
      } else if (Math.abs(dy) > SLOP) {
        // 세로로 움직이면 목록 스크롤이다.
        clearLong();
        drag.current = null;
      }
      return;
    }
    // 판 너비보다 더 밀리지 않는다(overshoot 없음).
    setX(Math.max(-ACTION_W, Math.min(ACTION_W, d.base + dx / FRICTION)));
  };

  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    clearLong();
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.active) return;
    suppressClick.current = true;
    setDragging(false);
    if (x >= LEFT_THRESHOLD) {
      // 왼쪽 판(고정)이 다 열리면 바로 고정/해제하고 닫는다. 오른쪽 판(삭제)은 버튼을 눌러야 지운다.
      setX(0);
      // 고정하면 줄이 '고정됨' 묶음으로 옮겨 가며 새로 그려진다. 닫히는 동작이 끝난 뒤 바꾼다.
      pinTimer.current = setTimeout(onTogglePin, 260);
    } else if (x <= -RIGHT_THRESHOLD) {
      setX(-ACTION_W);
    } else {
      setX(0);
    }
  };

  return (
    // 카드와 밀어서 나온 버튼을 한 덩어리로 둥글게 자른다(iOS 둥근 목록 칸처럼).
    <View className="rounded-[20px] overflow-hidden">
      <ActionPanel visible={x > 0.5} color={IOS_ORANGE} side="left">
        <View className="flex-1 items-center justify-center gap-1.5">
          <PinIcon off={pinned} />
          <Text className="text-[12px] font-semibold text-white">{pinned ? '고정 해제' : '고정'}</Text>
        </View>
      </ActionPanel>
      <ActionPanel visible={x < -0.5} color={IOS_RED} side="right">
        <Pressable
          onPress={() => {
            setX(0);
            onDelete();
          }}
          accessibilityRole="button"
          accessibilityLabel="대화 삭제"
          tabIndex={x < 0 ? 0 : -1}
          className="flex-1 items-center justify-center gap-1.5 active:opacity-80"
        >
          <TrashIcon />
          <Text className="text-[12px] font-semibold text-white">삭제</Text>
        </Pressable>
      </ActionPanel>
      <Pressable
        onPress={() => {
          if (suppressClick.current) {
            suppressClick.current = false;
            return;
          }
          // 삭제 버튼이 열려 있으면 먼저 닫는다.
          if (x !== 0) {
            setX(0);
            return;
          }
          onOpen();
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onContextMenu={(e) => {
          // 데스크톱 오른쪽 클릭 · 길게 누를 때 뜨는 브라우저 메뉴 대신 앱 메뉴를 띄운다.
          e.preventDefault();
          if (longTimer.current || !suppressClick.current) {
            clearLong();
            drag.current = null;
            suppressClick.current = true;
            onLongPress();
          }
        }}
        accessibilityRole="button"
        accessibilityHint="오른쪽으로 밀면 고정, 왼쪽으로 밀면 삭제, 길게 누르면 메뉴가 열려요"
        className={`px-4 py-4 ${dragging ? '' : 'active:opacity-80'} touch-pan-y`}
        style={{
          backgroundColor: bg(CARD_BG),
          WebkitTouchCallout: 'none',
          transform: `translateX(${x}px)`,
          transition: dragging ? 'none' : 'transform 220ms cubic-bezier(0.33, 1, 0.68, 1)',
        }}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 min-w-0 flex-row items-center gap-1.5">
            {pinned && <PinIcon size={14} color={IOS_ORANGE} />}
            <Text className="flex-1 min-w-0 text-[16px] font-bold text-ink" numberOfLines={1}>
              {chatTitle(chat)}
            </Text>
          </View>
          <Text className="shrink-0 tabular-nums text-[12px] text-mute mt-0.5">{hhmm(chat.startedAt)}</Text>
        </View>
        <Text className="text-[14px] text-text-4 mt-1.5" numberOfLines={1}>
          {chatPreview(chat)}
        </Text>
        <View className="flex-row items-center justify-between mt-3">
          <View className="flex-row gap-1.5">
            {[chatKindLabel(chat), chat.context].filter(Boolean).map((t) => (
              <View key={t} className="h-7 px-2.5 rounded-full bg-primary-soft justify-center">
                <Text className="text-[12px] font-semibold text-primary-pressed">{t}</Text>
              </View>
            ))}
          </View>
          <ChevronRight size={16} color={fg('#A1A1AA')} />
        </View>
      </Pressable>
    </View>
  );
}
