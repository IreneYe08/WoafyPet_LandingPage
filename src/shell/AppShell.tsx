import AppRouter from '@/AppRouter';
import FooterSection from '@/components/sections/FooterSection';
import CookieBanner from '@/components/CookieBanner';
import TrackingGate from '@/components/TrackingGate';

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 门禁：只会在 consent=granted 时注入 tracking */}
      <TrackingGate />

      {/* 主体路由 */}
      <div className="flex-1">
        <AppRouter />
      </div>

      {/* 全站 footer 固定链接 */}
      <FooterSection />

      {/* 首次访问 cookie banner */}
      <CookieBanner />
    </div>
  );
}

export default AppShell;