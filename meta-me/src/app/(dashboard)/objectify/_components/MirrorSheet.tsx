// 거울이 비춘 사실 바텀시트
export function MirrorSheet({
  open,
  onClose,
  text,
}: {
  open: boolean;
  onClose: () => void;
  text: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-x-0 top-0 bottom-16 bg-black/30 z-50 flex flex-col justify-end">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-t-[28px] max-h-[85%] overflow-y-auto p-6 relative z-10 space-y-6 shadow-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-[18px] font-medium">거울이 비춘 사실</h3>
          <button onClick={onClose} className="text-xl text-gray-400 p-1">✕</button>
        </div>

        <div className="space-y-6 text-[13px] leading-relaxed text-gray-700">
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
}
