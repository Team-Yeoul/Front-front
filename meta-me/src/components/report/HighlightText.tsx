import type { HighlightLine } from '@/types';

export function HighlightText({ line, color = '#8287FF' }: { line: HighlightLine; color?: string }) {
  const idx = line.text.indexOf(line.highlight);
  if (idx === -1) return <>{line.text}</>;

  const before = line.text.slice(0, idx);
  const after = line.text.slice(idx + line.highlight.length);

  return (
    <>
      {before}
      <b className="font-semibold" style={{ color }}>
        {line.highlight}
      </b>
      {after}
    </>
  );
}
