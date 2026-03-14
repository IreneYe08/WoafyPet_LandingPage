import { Routes, Route } from 'react-router-dom';
import PrivacyPage from '@/pages/PrivacyPage';
import PrivacyChoicesPage from '@/pages/PrivacyChoicesPage';
import TermsPage from '@/pages/TermsPage';
import VipSuccessPage from "./pages/VipSuccessPage";
import BlogPage from '@/pages/BlogPage';          // ← 加这行
import BlogPostPage from '@/pages/BlogPostPage';  // ← 加这行
import App from '@/app/App';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/blog" element={<BlogPage />} />              {/* ← 加这行 */}
      <Route path="/blog/:slug" element={<BlogPostPage />} />    {/* ← 加这行 */}
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/privacy-choices" element={<PrivacyChoicesPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/vip-success" element={<VipSuccessPage />} />
      <Route path="*" element={<App />} />
    </Routes>
  );
}

export default AppRouter;