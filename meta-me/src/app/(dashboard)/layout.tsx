import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full [transform:translateZ(0)]">
      <Header />
      <main className="flex-1 overflow-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
