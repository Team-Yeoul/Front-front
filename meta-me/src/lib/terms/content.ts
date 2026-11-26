// 약관 본문 데이터. 웹(meta-me/src/components/ui/terms.tsx)과 같은 내용이다. 바꿀 때는 양쪽을 함께 바꾼다.
import { PRIVACY_POLICY } from './privacyPolicy';

export type TermsKey = 'service' | 'privacy' | 'sensitive' | 'marketing';

/** 문단(문자열), 소제목, 번호 없는 목록, 표(첫 행이 머리글). 문자열 안의 **굵게**를 지원한다. */
export type TermsBlock = string | { sub: string } | { list: string[] } | { table: string[][] };

export interface TermsDoc {
  title: string;
  intro: string | TermsBlock[];
  sections: { heading: string; paragraphs: TermsBlock[] }[];
}

export const TERMS_CONTENT: Record<TermsKey, TermsDoc> = {
  service: {
    title: '서비스 이용 약관',
    intro:
      '이 애플리케이션을 다운로드, 접속 또는 사용함으로써 귀하는 다음 이용 약관에 동의한 것으로 간주됩니다. 만약 동의하지 않으시면, 이 앱을 사용하지 마십시오.',
    sections: [
      {
        heading: '1. 응용 프로그램 사용법',
        paragraphs: [
          '메타미는 오락 및 허구적 목적으로만 제작된 도구입니다. 실제 기능을 하는 애플리케이션으로 간주되거나 현실적인 용도로 사용해서는 안 됩니다.',
          '귀하는 불법적이거나 사기적인 활동에 이 앱을 사용할 권한이 없습니다.',
          '이 앱의 모든 부분(허구 콘텐츠 포함)을 수정, 복사, 배포 또는 재판매하는 것은 금지되어 있습니다.',
        ],
      },
      {
        heading: '2. 사용자 책임',
        paragraphs: [
          '메타미를 사용함으로써, 귀하는 사용에 따른 모든 위험을 스스로 감수하고 자신의 행동에 대한 책임을 전적으로 부담한다는 데 동의하는 것입니다.',
          '당사는 앱 사용 또는 제공된 허위 정보로 인해 발생하는 모든 손해, 손실 또는 분쟁에 대해 책임을 지지 않습니다.',
        ],
      },
      {
        heading: '3. 약관의 변경',
        paragraphs: ['회사는 관련 법령을 위배하지 않는 범위에서 약관을 개정할 수 있으며, 변경 시 서비스 화면을 통해 사전에 공지합니다.'],
      },
    ],
  },
  privacy: PRIVACY_POLICY,
  sensitive: {
    title: '민감정보 처리 동의',
    intro: [
      '메타미에 쓰는 기록과 AI 대화에는 생각, 감정, 마음 상태가 담길 수 있어요. 운영자는 이를 민감정보로 보고, 「개인정보 보호법」 제23조에 따라 다른 동의와 따로 동의를 받습니다.',
    ],
    sections: [
      {
        heading: '처리 목적',
        paragraphs: ['매일 기록과 AI 대화 저장, AI가 사고·감정·행동 패턴을 분석한 결과와 코그니, 주간 리포트 제공'],
      },
      {
        heading: '처리 항목',
        paragraphs: [
          '온보딩 응답(소개 문장, 설문 답), 매일 질문·꼬리 질문 답변, 감정 기록, AI 대화 내용, AI 분석 결과(사고·감정·행동 패턴, 코그니, 주간 리포트)',
        ],
      },
      {
        heading: '보유 기간',
        paragraphs: ['탈퇴하거나 동의를 철회할 때까지. 기록을 지우면 그 기록은 지체 없이 삭제합니다.'],
      },
      {
        heading: 'AI 분석을 위한 국외 이전',
        paragraphs: [
          'AI 분석과 대화 답변을 만들기 위해 기록을 미국의 OpenAI로 보냅니다. 일기 답변은 이름·연락처 같은 정보를 가린 뒤 보내고, AI 대화는 원문 그대로 갈 수 있어요. OpenAI는 이 데이터를 AI 학습에 쓰지 않으며 최대 30일 뒤 삭제합니다(개인정보 처리방침 제8조).',
        ],
      },
      {
        heading: '동의를 거부할 권리와 불이익',
        paragraphs: [
          '동의하지 않을 수 있어요. 다만 기록과 AI 분석이 메타미의 핵심 기능이라, 동의하지 않으면 기록 쓰기, AI 분석·리포트, AI 대화를 쓸 수 없어요.',
          '동의한 뒤에도 설정 > 개인정보 > 민감정보 처리 동의에서 언제든 철회할 수 있어요.',
        ],
      },
    ],
  },
  marketing: {
    title: '마케팅 정보 수신',
    intro: '이벤트, 새로운 기능 소식 등 마케팅 정보를 앱 알림과 이메일로 받아볼 수 있어요.',
    sections: [{ heading: '안내', paragraphs: ['동의하지 않아도 서비스 이용에는 제한이 없으며, 설정에서 언제든지 변경할 수 있습니다.'] }],
  },
};

// 'constructor'·'toString' 같은 상속 속성은 약관이 아니므로 자기 키만 받는다.
export const isTermsKey = (v: unknown): v is TermsKey => typeof v === 'string' && Object.prototype.hasOwnProperty.call(TERMS_CONTENT, v);
