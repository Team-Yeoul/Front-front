'use client';

import { getActionExperimentStatus } from '@/lib/api';
import { useReportData } from '@/hooks/useReportData';
import { DetailHeader } from '@/components/report/DetailHeader';
import type { ActionExperimentStatus } from '@/types';

const MOCK: ActionExperimentStatus = {
  ready: false,
  message: '매주 실험 결과를 비교하는 페이지예요. 실험 완료 후 STEP 2에서 자세히 보여드릴게요.',
};

export default function ActionExperimentPage() {
  const status = useReportData(getActionExperimentStatus, MOCK);

  return (
    <div className="flex flex-col h-full bg-white">
      <DetailHeader title="다음 행동 실험" />

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
          <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
            <rect x="1" y="11" width="20" height="14" rx="3" stroke="#9CA3AF" strokeWidth="2" />
            <path d="M5 11V7a6 6 0 0 1 12 0v4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-[15px] font-semibold text-gray-900 mb-2">준비 중이에요</p>
        <p className="text-[13px] text-gray-400 text-center leading-relaxed">{status.message}</p>
      </div>
    </div>
  );
}
