'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useListDailyRecords } from '@/entities/diary';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, CheckIcon, Img3D } from '@/components/ui/primitives';
import { countStreak } from '@/lib/streak';

const WEEK = ['월', '화', '수', '목', '금', '토', '일'];
const toDateKey = (d: Date) => d.toLocaleDateString('sv-SE');

export default function StreakPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data } = useListDailyRecords({ size: 100 }, !!accessToken);

  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);

  let streak = 0;
  let doneIdx = new Set<number>();
  if (data) {
    const days = new Set(data.records.map((r) => r.recorded_date));
    streak = countStreak(days, today);
    doneIdx = new Set(
      WEEK.map((_, i) => {
        const x = new Date(monday);
        x.setDate(monday.getDate() + i);
        return days.has(toDateKey(x)) ? i : -1;
      }).filter((i) => i >= 0),
    );
  }
  const todayIdx = mondayOffset;

  return (
    <Screen footer={<Button onClick={() => router.push('/main')}>돌아가기</Button>}>
      <div className="px-5 pt-2">
        <BackButton />
      </div>
      <div className="flex flex-col items-center pt-16">
        <Img3D name="fire" size={96} />
        <p className="text-[64px] font-bold text-ink leading-none mt-4">{streak}</p>
        <p className="text-[16px] font-semibold text-[#48484F] mt-5">꾸준히 나를 기록하고 있어요</p>
        <div className="flex gap-2.5 mt-8">
          {WEEK.map((w, i) => {
            const done = doneIdx.has(i);
            return (
              <div key={w} className="flex flex-col items-center gap-2">
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    done ? (i === todayIdx ? 'bg-primary-line' : 'bg-primary') : 'bg-surface-2'
                  }`}
                >
                  {done && <CheckIcon size={15} />}
                </span>
                <span className={`text-[12px] ${done ? 'font-bold text-ink' : 'text-mute'}`}>{w}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-end gap-3 px-5 mt-[150px] pb-4">
        <span className="w-14 h-14 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6L10 3ZM17.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" fill="#6367FF" />
          </svg>
        </span>
        <div className="rounded-2xl bg-surface-2 px-4 py-4 text-[14px] text-[#48484F] leading-relaxed">
          {streak}일째예요. 오늘 쓴 문장은 어제보다 조금 더 정확해졌어요.
        </div>
      </div>
    </Screen>
  );
}
