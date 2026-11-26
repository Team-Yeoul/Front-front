'use client';

import type { CSSProperties, HTMLAttributes, MouseEvent, Ref } from 'react';
import { splitA11y, type A11yProps } from './rn';

export type TextProps = Omit<HTMLAttributes<HTMLSpanElement>, 'role'> &
  A11yProps & {
    ref?: Ref<HTMLSpanElement>;
    className?: string;
    style?: CSSProperties;
    /** 1이면 한 줄 말줄임, 2 이상이면 그 줄 수에서 자른다. */
    numberOfLines?: number;
    onPress?: (e: MouseEvent<HTMLSpanElement>) => void;
    /** RN 전용(무시) */
    selectable?: boolean;
  };

const clampStyle = (n?: number): CSSProperties | undefined =>
  n && n > 1 ? { display: '-webkit-box', WebkitLineClamp: n, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : undefined;

/**
 * 앱 기본 글자(RN Text). 블록으로 놓이고 '\n' 줄바꿈을 그대로 보여 준다. Text 안의 Text는 이어지는 글자가 된다.
 * 굵기는 className(font-semibold …)이 Pretendard 굵기 파일을 고른다(globals.css @font-face).
 */
export function Text({ className = '', style, numberOfLines, onPress, selectable: _s, ref, ...props }: TextProps) {
  void _s;
  const { aria, rest } = splitA11y(props);
  return (
    <span
      ref={ref}
      {...rest}
      {...aria}
      onClick={onPress}
      className={`rn-text ${numberOfLines === 1 ? 'truncate' : ''} ${onPress ? 'cursor-pointer' : ''} ${className}`}
      style={{ ...clampStyle(numberOfLines), ...style }}
    />
  );
}

/** <Text> 안에 넣는 부분 글자(웹의 <b>, <span>). 바깥 글자의 크기·색을 물려받는다. */
export function Span({ className = '', style, numberOfLines: _n, onPress, selectable: _s, ref, ...props }: TextProps) {
  void _n;
  void _s;
  const { aria, rest } = splitA11y(props);
  return <span ref={ref} {...rest} {...aria} onClick={onPress} className={`rn-text inline ${className}`} style={style} />;
}
