// v2: 각 페이지가 <Screen nav>로 자체 헤더·하단 탭을 그리므로 여기서는 감싸기만 한다.
// [transform:translateZ(0)]는 페이지 안의 absolute 시트/모달이 폰 프레임 기준으로 잡히게 한다.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-full [transform:translateZ(0)]">{children}</div>;
}
