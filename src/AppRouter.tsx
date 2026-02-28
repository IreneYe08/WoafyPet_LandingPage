import { Routes, Route } from 'react-router-dom';
import PrivacyPage from '@/pages/PrivacyPage';
import PrivacyChoicesPage from '@/pages/PrivacyChoicesPage';
import TermsPage from '@/pages/TermsPage';
import VipSuccessPage from "./pages/VipSuccessPage";

// 你现有首页组件：按你的项目实际入口替换
import App from '@/app/App';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/privacy-choices" element={<PrivacyChoicesPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/vip-success" element={<VipSuccessPage />} />
      {/* fallback */}
      <Route path="*" element={<App />} />
    </Routes>
  );
}

export default AppRouter;