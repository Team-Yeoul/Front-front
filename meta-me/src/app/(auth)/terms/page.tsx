import Link from 'next/link';

const TERMS = `이 애플리케이션을 다운로드, 접속 또는 사용함으로써 귀하는 다음 약관에 동의하는 것으로 간주됩니다. 진행에 동의하지 않으실 경우, 이 앱을 사용하지 마십시오.

1. 주요 프로그램 사용법
• 에타미는 당신 및 타인을 목적으로써 제공된 도구입니다. 다음 기능을 통해 메모리와 컨텐츠를 탐색하세요. 이 앱을 수정하거나 변형하는 행위에 동의하지 않습니다.
• 이 앱의 모든 부분(저작 권한 포함)을 수정, 복사, 배포 또는 공개하는 것은 금지됩니다.

2. 개인정보 처리방침
• 에타미를 사용함으로써, 귀하는 당사에 모든 정보를 직접 스스로 공개하고 자신의 행동에 대한 책임을 질임을 동의합니다.
• 당신은 아래 내용 페이지의 정보로 귀하의 계좌를 양도하는 것에 동의하는 것을 금지됩니다.
• 이 앱은 귀하의 개인정보를 안전하게 보관하며, 제3자에게 판매하거나 공유하지 않습니다.

3. 면책 조항
• 이 앱은 "있는 그대로" 제공되며, 특정 목적에의 적합성에 대한 보장을 포함하여 명시적이거나 묵시적인 어떠한 보증도 하지 않습니다.
• 서비스 중단이나 데이터 손실에 대해 에타미는 책임을 지지 않습니다.`;

export default function TermsPage() {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-9 h-1 rounded-full bg-gray-200" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <h1 className="text-[22px] font-bold text-gray-900 mb-5">이용약관</h1>
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{TERMS}</p>
      </div>

      <div className="px-6 pt-4 pb-10 border-t border-gray-100 bg-white">
        <Link href="/signup">
          <button className="w-full h-14 bg-gray-900 text-white rounded-2xl text-base font-semibold">
            동의합니다
          </button>
        </Link>
      </div>
    </div>
  );
}
