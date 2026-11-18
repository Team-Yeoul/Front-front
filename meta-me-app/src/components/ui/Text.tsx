import { Platform, Text as RNText, type TextProps } from 'react-native';

type Props = TextProps & { className?: string };

/**
 * 네이티브는 fontWeight만으로 Pretendard 굵기 파일을 고르지 못한다(특히 Android).
 * className의 font-* 굵기를 보고 해당 굵기 파일을 fontFamily로 직접 지정한다.
 */
const WEIGHTS: [RegExp, string][] = [
  [/(^|\s)font-bold(\s|$)/, 'Pretendard-Bold'],
  [/(^|\s)font-semibold(\s|$)/, 'Pretendard-SemiBold'],
  [/(^|\s)font-medium(\s|$)/, 'Pretendard-Medium'],
  [/(^|\s)font-light(\s|$)/, 'Pretendard-Light'],
];

const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });

function familyOf(className: string, fallback: string | undefined) {
  if (/(^|\s)font-mono(\s|$)/.test(className)) return MONO;
  return WEIGHTS.find(([re]) => re.test(className))?.[1] ?? fallback;
}

/** 앱 기본 글자. 굵기 클래스가 없으면 Pretendard Regular. */
export function Text({ className = '', style, ...rest }: Props) {
  const fontFamily = familyOf(className, 'Pretendard-Regular');
  return <RNText {...rest} className={className} style={[{ fontFamily, fontWeight: 'normal' }, style]} />;
}

/**
 * <Text> 안에 넣는 부분 글자(웹의 <b>, <span>). 굵기 클래스가 있을 때만 글꼴을 바꾸고
 * 없으면 바깥 글자의 글꼴을 그대로 이어받는다.
 */
export function Span({ className = '', style, ...rest }: Props) {
  const fontFamily = familyOf(className, undefined);
  return <RNText {...rest} className={className} style={[fontFamily ? { fontFamily, fontWeight: 'normal' } : null, style]} />;
}
