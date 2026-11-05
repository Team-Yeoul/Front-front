// 약관 본문. 회원가입 약관 동의(/terms)와 설정 > 약관 보기(/settings/terms/[key])에서 함께 쓴다.

export type TermsKey = 'service' | 'privacy' | 'marketing';

export const TERMS_CONTENT: Record<TermsKey, { title: string; intro: string; sections: { heading: string; paragraphs: string[] }[] }> = {
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
  privacy: {
    title: '개인정보 처리방침',
    intro: '메타미는 이용자의 개인정보를 소중히 다루며, 관련 법령에 따라 안전하게 처리합니다.',
    sections: [
      { heading: '1. 수집하는 항목', paragraphs: ['회원가입과 서비스 이용 과정에서 이메일, 비밀번호, 닉네임, 기록 데이터 등을 수집할 수 있습니다.'] },
      {
        heading: '2. 이용 목적',
        paragraphs: ['회원 가입 의사 확인 및 본인 인증', '서비스 제공, 콘텐츠 및 리포트 생성', '부정 이용 방지 및 고지사항 전달'],
      },
      { heading: '3. 보유 및 이용 기간', paragraphs: ['회원 탈퇴 시 지체 없이 파기하며, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.'] },
      { heading: '4. 이용자의 권리', paragraphs: ['이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제, 처리정지를 요청할 수 있습니다.'] },
    ],
  },
  marketing: {
    title: '마케팅 정보 수신',
    intro: '이벤트, 새로운 기능 소식 등 마케팅 정보를 앱 알림과 이메일로 받아볼 수 있어요.',
    sections: [{ heading: '안내', paragraphs: ['동의하지 않아도 서비스 이용에는 제한이 없으며, 설정에서 언제든지 변경할 수 있습니다.'] }],
  },
};

export const isTermsKey = (v: unknown): v is TermsKey => typeof v === 'string' && v in TERMS_CONTENT;

export function TermsBody({ termsKey }: { termsKey: TermsKey }) {
  const content = TERMS_CONTENT[termsKey];
  return (
    <>
      <h2 className="text-[22px] font-bold text-ink">{content.title}</h2>
      <p className="text-[15px] text-[#48484F] leading-[1.75] mt-4">{content.intro}</p>
      {content.sections.map((s) => (
        <section key={s.heading} className="mt-7">
          <h3 className="text-[17px] font-bold text-ink">{s.heading}</h3>
          <div className="mt-3 border-l-2 border-line pl-3.5 flex flex-col gap-3">
            {s.paragraphs.map((p) => (
              <p key={p} className="text-[15px] text-[#5A5A62] leading-[1.75]">
                {p}
              </p>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
