import { redirect } from 'next/navigation';

/** 마이페이지의 리포트 탭은 없어졌다(웹 5a). 예전 주소로 들어오면 리포트 탭으로 보낸다. */
export default function MyReportRedirect() {
  redirect('/report');
}
