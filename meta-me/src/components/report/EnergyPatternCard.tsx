type EnergyVariant = 'boost' | 'drain' | 'void';

const VARIANT_STYLES: Record<EnergyVariant, { iconBg: string; iconColor: string; icon: string }> = {
  boost: { iconBg: 'bg-[#8287FF]', iconColor: 'text-white', icon: '↑' },
  drain: { iconBg: 'bg-[#F5D949]', iconColor: 'text-gray-900', icon: '↓' },
  void: { iconBg: 'bg-gray-900', iconColor: 'text-white', icon: '○' },
};

export function EnergyPatternCard({
  variant,
  title,
  subtitle,
}: {
  variant: EnergyVariant;
  title: string;
  subtitle: string;
}) {
  const style = VARIANT_STYLES[variant];

  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5">
      <span
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-[15px] font-bold shrink-0 ${style.iconBg} ${style.iconColor}`}
      >
        {style.icon}
      </span>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-gray-900">{title}</p>
        <p className="text-[12px] text-gray-400 mt-0.5 truncate">{subtitle}</p>
      </div>
    </div>
  );
}
