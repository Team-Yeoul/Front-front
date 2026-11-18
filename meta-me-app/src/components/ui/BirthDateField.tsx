import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sheet } from './overlays';
import { Button } from './primitives';
import { Text } from './Text';
import { CalendarIcon } from './icons';

const ROW = 44;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2) * ROW;

const daysIn = (y: number, m: number) => new Date(y, m, 0).getDate();
const pad2 = (n: number) => String(n).padStart(2, '0');

function parse(v: string) {
  const [y, m, d] = v.split('-').map(Number);
  return y && m && d ? { y, m, d } : null;
}

/** 한 칸씩 멈추는 휠 열. 항목을 누르면 그 값으로 이동한다. */
function Wheel({ items, value, unit, onChange }: { items: number[]; value: number; unit: string; onChange: (v: number) => void }) {
  const ref = useRef<ScrollViewInstance>(null);

  // 처음 열릴 때, 그리고 항목 수가 바뀔 때(월별 일수) 선택값 위치로 맞춘다.
  useEffect(() => {
    const i = items.indexOf(value);
    if (i >= 0) requestAnimationFrame(() => ref.current?.scrollTo({ y: i * ROW, animated: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.max(0, Math.min(items.length - 1, Math.round(e.nativeEvent.contentOffset.y / ROW)));
    if (items[i] !== value) onChange(items[i]);
  };

  return (
    <ScrollView
      ref={ref}
      className="flex-1"
      style={{ height: ROW * VISIBLE }}
      contentContainerStyle={{ paddingVertical: PAD }}
      snapToInterval={ROW}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      onMomentumScrollEnd={settle}
      onScrollEndDrag={(e) => {
        // 손을 떼며 관성 없이 멈춘 경우에도 값을 반영한다.
        if (!e.nativeEvent.velocity?.y) settle(e);
      }}
    >
      {items.map((n, i) => (
        <Pressable
          key={n}
          onPress={() => {
            ref.current?.scrollTo({ y: i * ROW, animated: true });
            onChange(n);
          }}
          className="items-center justify-center"
          style={{ height: ROW }}
        >
          <Text className={`text-[18px] ${n === value ? 'font-bold text-ink' : 'text-[#B4B4BB]'}`}>
            {n}
            {unit}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

/** 생년월일 입력: 누르면 하단 시트 휠 피커가 열린다. */
export function BirthDateField({ label = '생년월일', value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  const maxYear = new Date().getFullYear();
  const minYear = maxYear - 100;
  const parsed = parse(value);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => parsed ?? { y: maxYear - 20, m: 1, d: 1 });

  const openSheet = () => {
    setDraft(parsed ?? { y: maxYear - 20, m: 1, d: 1 });
    setOpen(true);
  };

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: daysIn(draft.y, draft.m) }, (_, i) => i + 1);
  // 2월 30일처럼 없는 날짜가 되지 않게 월/연 변경 시 일을 줄인다.
  const set = (next: Partial<typeof draft>) =>
    setDraft((d) => {
      const merged = { ...d, ...next };
      return { ...merged, d: Math.min(merged.d, daysIn(merged.y, merged.m)) };
    });

  const confirm = () => {
    onChange(`${draft.y}-${pad2(draft.m)}-${pad2(draft.d)}`);
    setOpen(false);
  };

  return (
    <View className="gap-2">
      <Text className="text-[13px] font-medium text-[#48484F]">{label}</Text>
      <Pressable
        onPress={openSheet}
        accessibilityRole="button"
        className={`flex-row items-center justify-between h-14 rounded-2xl px-4 border-[1.5px] ${
          open ? 'bg-white border-primary' : 'bg-surface border-transparent'
        }`}
      >
        <Text className={`text-[16px] ${parsed ? 'text-ink' : 'text-mute'}`}>
          {parsed ? `${parsed.y}. ${pad2(parsed.m)}. ${pad2(parsed.d)}.` : '생년월일을 선택해 주세요'}
        </Text>
        <CalendarIcon size={20} color="#A8A8B0" width={1.7} />
      </Pressable>

      <Sheet open={open} onClose={() => setOpen(false)} title="생년월일">
        <View className="px-5 pb-5">
          <View className="mt-4">
            <View pointerEvents="none" className="absolute left-0 right-0 rounded-xl bg-surface-2" style={{ top: PAD, height: ROW }} />
            <View className="flex-row">
              <Wheel items={years} value={draft.y} unit="년" onChange={(y) => set({ y })} />
              <Wheel items={months} value={draft.m} unit="월" onChange={(m) => set({ m })} />
              <Wheel items={days} value={draft.d} unit="일" onChange={(d) => set({ d })} />
            </View>
            <LinearGradient pointerEvents="none" colors={['#FFFFFF', '#FFFFFF00']} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 64 }} />
            <LinearGradient pointerEvents="none" colors={['#FFFFFF00', '#FFFFFF']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 64 }} />
          </View>
          <Button className="mt-5" onPress={confirm}>
            완료
          </Button>
        </View>
      </Sheet>
    </View>
  );
}
