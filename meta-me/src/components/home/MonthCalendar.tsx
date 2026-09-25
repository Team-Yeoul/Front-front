'use client';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function MonthCalendar({
  year,
  month,
  attendedDays,
  writtenDays,
  todayDay,
}: {
  year: number;
  month: number;
  attendedDays: number[];
  writtenDays: number[];
  todayDay?: number;
}) {
  const attended = new Set(attendedDays);
  const written = new Set(writtenDays);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div>
      <div className="grid grid-cols-7 gap-y-3">
        {WEEKDAYS.map((w, i) => (
          <span
            key={w}
            className={`text-[12px] text-center font-medium ${i === 0 ? 'text-[#c94f80]' : 'text-gray-400'}`}
          >
            {w}
          </span>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <span key={`empty-${i}`} />;

          const isWritten = written.has(day);
          const isAttended = attended.has(day);
          const isToday = day === todayDay;

          return (
            <div key={day} className="flex items-center justify-center">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] ${
                  isWritten
                    ? 'bg-[#8287FF] text-white font-semibold'
                    : isAttended
                      ? 'border border-dashed border-gray-300 text-gray-500'
                      : isToday
                        ? 'border border-gray-200 text-gray-500'
                        : 'text-gray-500'
                }`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <span className="w-3.5 h-3.5 rounded-full border border-dashed border-gray-300" />
          출석한 날
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <span className="w-3.5 h-3.5 rounded-full bg-[#8287FF]" />
          데일리 다이어리 쓴 날
        </span>
      </div>
    </div>
  );
}
