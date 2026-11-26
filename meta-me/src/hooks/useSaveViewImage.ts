import { useCallback, useRef, useState } from 'react';

/** 다음 그리기가 끝날 때까지 기다린다. 캡처용 배경을 켠 뒤 화면에 반영되고 나서 찍기 위해 쓴다. */
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

/**
 * ref를 단 요소를 PNG로 찍어 내려받는다. (앱은 같은 화면을 사진첩에 저장한다)
 * capturing은 찍는 동안만 true라, 화면에선 안 보이는 캡처용 배경 등을 그때만 그릴 수 있다.
 */
export function useSaveViewImage(fileName = 'meta-me.png') {
  const ref = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    if (saving || !ref.current) return;
    setSaving(true);
    try {
      setCapturing(true);
      await nextFrame();
      const { toPng } = await import('html-to-image');
      const url = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      setCapturing(false);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.warn('[save-image] 실패', err);
      window.alert('이미지를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setCapturing(false);
      setSaving(false);
    }
  }, [saving, fileName]);

  return { ref, capturing, saving, save };
}
