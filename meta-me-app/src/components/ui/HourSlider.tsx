import { useRef } from 'react';
import { View, type GestureResponderEvent, type HostInstance } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/** Track + pill thumb (‹ ›) slider used for alarm time and "혼자 있는 시간". */
export function HourSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  const trackRef = useRef<HostInstance>(null);
  const track = useRef({ x: 0, width: 0 });
  const pct = ((value - min) / (max - min)) * 100;

  const measure = () => trackRef.current?.measureInWindow((x, _y, width) => (track.current = { x, width }));

  const setFromPageX = (e: GestureResponderEvent) => {
    const { x, width } = track.current;
    if (!width) return;
    const ratio = Math.max(0, Math.min(1, (e.nativeEvent.pageX - x) / width));
    const next = Math.round((min + ratio * (max - min)) / step) * step;
    if (next !== value) onChange(next);
  };

  return (
    <View
      ref={trackRef}
      onLayout={measure}
      className="h-10 justify-center"
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      // 스크롤 안에서도 좌우로 끄는 동안 손가락을 놓치지 않게 한다.
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => {
        measure();
        setFromPageX(e);
      }}
      onResponderMove={setFromPageX}
      accessibilityRole="adjustable"
      accessibilityValue={{ min, max, now: value }}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'increment') onChange(Math.min(max, value + step));
        if (e.nativeEvent.actionName === 'decrement') onChange(Math.max(min, value - step));
      }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
    >
      <View className="absolute left-0 right-0 h-2 rounded-full bg-[#E9EAF0]" />
      <View className="absolute left-0 h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      <View
        pointerEvents="none"
        className="absolute w-[62px] h-10 rounded-full bg-white flex-row items-center justify-center gap-2.5"
        style={{
          left: `${pct}%`,
          transform: [{ translateX: -31 }],
          boxShadow: '0 2px 10px rgba(26,26,30,0.15)',
        }}
      >
        <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
          <Path d="M15 5l-7 7 7 7" stroke="#6367FF" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
          <Path d="M9 5l7 7-7 7" stroke="#6367FF" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    </View>
  );
}
