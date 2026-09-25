export function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3.5">
      <p className="text-[22px] font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-[12px] text-gray-400 mt-1">{label}</p>
    </div>
  );
}
