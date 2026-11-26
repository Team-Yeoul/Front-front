'use client';

import { ScrollView, View } from './rn';
import { TERMS_CONTENT, type TermsBlock, type TermsKey } from '@/lib/terms/content';
import { Span, Text } from './Text';

/** 문자열 안의 **굵게**를 굵은 글자로 바꾼다. */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <Span key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </Span>
    ) : (
      part
    ),
  );
}

const TEXT = 'text-[16px] text-[#5A5A62] dark:text-[#B8B8C4] leading-[26px]';
const CELL_W = 150;

function Block({ block }: { block: TermsBlock }) {
  if (typeof block === 'string') return <Text className={TEXT}>{inline(block)}</Text>;
  if ('sub' in block) return <Text className="text-[16px] font-bold text-ink mt-2">{block.sub}</Text>;
  if ('list' in block)
    return (
      <View className="gap-1.5">
        {block.list.map((item) => (
          <View key={item} className="flex-row">
            <Text className={`${TEXT} w-5 text-center`}>•</Text>
            <Text className={`${TEXT} flex-1`}>{inline(item)}</Text>
          </View>
        ))}
      </View>
    );
  // 표: 첫 행이 머리글. 폭이 좁으면 가로로 스크롤한다.
  const [head, ...rows] = block.table;
  const width = Math.max(300, head.length * CELL_W);
  const cell = 'border-line px-2.5 py-2';
  return (
    <ScrollView horizontal className="-mr-1">
      <View style={{ width }} className="border-t border-l border-line">
        {[head, ...rows].map((row, r) => (
          <View key={r} className={`flex-row ${r === 0 ? 'bg-surface' : ''}`}>
            {row.map((c, i) => (
              <View key={i} className={`flex-1 border-r border-b ${cell}`}>
                <Text className={`text-[12px] leading-[21px] ${r === 0 ? 'font-semibold text-ink' : 'text-[#5A5A62] dark:text-[#B8B8C4]'}`}>
                  {r === 0 ? c : inline(c)}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export function TermsBody({ termsKey }: { termsKey: TermsKey }) {
  const content = TERMS_CONTENT[termsKey];
  const intro = typeof content.intro === 'string' ? [content.intro] : content.intro;
  return (
    <View>
      <Text className="text-[24px] font-bold text-ink">{content.title}</Text>
      <View className="mt-4 gap-3">
        {intro.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </View>
      {content.sections.map((s) => (
        <View key={s.heading} className="mt-7">
          <Text className="text-[16px] font-bold text-ink">{s.heading}</Text>
          <View className="mt-3 border-l-2 border-line pl-3.5 gap-3">
            {s.paragraphs.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
