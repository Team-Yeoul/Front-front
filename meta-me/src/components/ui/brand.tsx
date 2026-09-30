/** "m" brand mark (public/logo.png is black; recolored with a CSS mask). */
export function LogoMark({ size = 24, color = '#1A1A1E' }: { size?: number; color?: string }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0"
      style={{
        width: size,
        height: (size * 93) / 131,
        backgroundColor: color,
        WebkitMaskImage: 'url(/logo.png)',
        maskImage: 'url(/logo.png)',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
      }}
    />
  );
}

export function Wordmark({ size = 18 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <LogoMark size={size * 1.35} />
      <span className="font-bold text-ink tracking-tight" style={{ fontSize: size }}>
        metame
      </span>
    </span>
  );
}

export function GoogleIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M18.1 10.2c0-.6-.06-1.18-.16-1.74H10v3.3h4.55a3.9 3.9 0 0 1-1.69 2.56v2.12h2.73C17.1 14.96 18.1 12.76 18.1 10.2z" fill="#4285F4" />
      <path d="M10 18.4c2.29 0 4.21-.76 5.61-2.06l-2.73-2.12C12.13 14.83 11.15 15.1 10 15.1c-2.21 0-4.08-1.49-4.75-3.5H2.43v2.19C3.82 16.69 6.72 18.4 10 18.4z" fill="#34A853" />
      <path d="M5.25 11.6A5.4 5.4 0 0 1 4.97 10c0-.55.1-1.09.28-1.6V6.21H2.43A9.24 9.24 0 0 0 1.4 10c0 1.48.35 2.88.97 4.13l2.88-2.53z" fill="#FBBC05" />
      <path d="M10 4.9c1.25 0 2.37.43 3.25 1.27l2.44-2.44C14.21 2.36 12.29 1.6 10 1.6 6.72 1.6 3.82 3.31 2.43 6l2.82 2.19C5.92 6.39 7.79 4.9 10 4.9z" fill="#EA4335" />
    </svg>
  );
}
