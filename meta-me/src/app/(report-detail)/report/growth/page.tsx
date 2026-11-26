import { redirect } from 'next/navigation';

/** 리포트 항목은 리포트 탭 안의 위 탭으로 합쳐졌다(웹 8a~8e). 예전 주소로 들어오면 그 탭으로 보낸다. */
export default function ReportGrowthRedirect() {
  redirect('/report?tab=growth');
}
