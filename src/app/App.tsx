/**
 * App.tsx - WoafyPet Landing Page 主应用组件
 *
 * 重构说明：
 * - 原 1254 行代码已拆分为 16 个独立 Section 组件
 * - 所有颜色常量已统一到 @/constants/colors.ts
 * - 通用按钮组件已提取到 @/components/common/PrimaryButton.tsx
 * - 图片资源已统一管理在 @/constants/images.ts
 *
 * @author WoafMeow Team
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import { useScrollDepth } from '@/hooks/useScrollDepth';

// Section 组件
import {
  HeroSection,
  ProductIntroSection,
  BenefitsGridSection,
  JointHealthSection,
  ComfortFeaturesSection,
  AppFeaturesSection,
  FoamLayersSection,
  ComparisonSection,
  VetRecommendedSection,
  MediaLogosSection,
  TestimonialsSection,
  FounderStorySection,
  SpecificationsSection,
  GuaranteeSection,
  WaitlistModal,
} from '@/components/sections';

// 页面级组件
import { CartPage } from '@/app/components/CartPage';

/**
 * Stripe Payment Link
 */
const STRIPE_PAYMENT_LINK_URL =
  (import.meta as any)?.env?.VITE_STRIPE_PAYMENT_LINK_URL ||
  'https://buy.stripe.com/3cIdRacRW1PW2Efcv7bV600';

/**
 * 主应用组件
 * 管理全局状态和页面路由
 */
export default function App() {
  // ==================== 状态管理 ====================

  /** 是否显示购物车页面 */
  const [showCart, setShowCart] = useState(false);

  /** 是否显示 Waitlist 模态框 */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /** 是否已加入 Waitlist（从 localStorage 恢复） */
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(() => {
    const saved = localStorage.getItem('hasJoinedWaitlist');
    return saved === 'true';
  });

  /** 优惠开始时间戳（从 localStorage 恢复） */
  const [offerStartTime, setOfferStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('offerStartTime');
    return saved ? parseInt(saved) : null;
  });

  /** 优惠是否已过期（从 localStorage 恢复，避免刷新后状态不一致） */
  const [offerExpired, setOfferExpired] = useState(() => {
    const saved = localStorage.getItem('offerExpired');
    return saved === 'true';
  });

  /** 页面是否已滚动（控制导航栏样式） */
  const [isScrolled, setIsScrolled] = useState(false);

  // ==================== 副作用 ====================

  /**
   * 检查优惠是否已过期
   * 优惠有效期：10 分钟
   */
  useEffect(() => {
    const startTimeStr = localStorage.getItem('offerStartTime');
    if (startTimeStr) {
      const startTime = parseInt(startTimeStr);
      const now = Date.now();
      const elapsed = now - startTime;
      const OFFER_DURATION = 10 * 60 * 1000; // 10 分钟
      if (elapsed >= OFFER_DURATION) {
        setOfferExpired(true);
        localStorage.setItem('offerExpired', 'true');
      }
    }
  }, []);

  /**
   * 监听滚动事件，控制导航栏样式
   */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始化调用
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /** GA4: landing page open + scroll depth (25/50/75/90) */
  useEffect(() => {
    trackEvent('lp_open', { section: 'landing' });
  }, []);
  useScrollDepth([25, 50, 75, 90]);

  // ==================== 事件处理 ====================

  /** 打开 Waitlist 模态框；section 用于 GA4 (hero / comfort / guarantee 等) */
  const openModal = (section?: string) => {
    trackEvent('click', {
      button_name: 'Join Waitlist Now',
      section: section || 'unknown',
    });
    setIsModalOpen(true);
  };

  /** 关闭 Waitlist 模态框 */
  const closeModal = () => setIsModalOpen(false);

  /** 打开购物车 */
  const openCart = () => setShowCart(true);

  /** 跳转 Stripe Payment Link（新逻辑：替代 CheckoutPage） */
  const goToStripeCheckout = () => {
    // 你也可以在这里追加 query params（例如带上 utm / email），但要确保 Stripe Link 支持并且你后端能处理
    window.location.assign(STRIPE_PAYMENT_LINK_URL);
  };

  /**
   * 处理加入 Waitlist 成功
   * 保存状态到 localStorage 并启动优惠倒计时
   */
  const handleJoinSuccess = () => {
    setHasJoinedWaitlist(true);
    localStorage.setItem('hasJoinedWaitlist', 'true');

    const startTime = Date.now();
    setOfferStartTime(startTime);
    localStorage.setItem('offerStartTime', startTime.toString());

    // 新开始倒计时，清掉过期标记
    setOfferExpired(false);
    localStorage.removeItem('offerExpired');
  };

  /**
   * 处理 Upsell 点击
   * 关闭模态框并直接跳 Stripe
   */
  const handleUpsellClick = () => {
    closeModal();
    goToStripeCheckout();
  };

  /**
   * 处理优惠过期
   */
  const handleOfferExpire = () => {
    setOfferExpired(true);
    localStorage.removeItem('offerStartTime');
    localStorage.setItem('offerExpired', 'true');
  };

  // ==================== 渲染 ====================

  // 购物车页面
  if (showCart) {
    return (
      <CartPage
        onBack={() => setShowCart(false)}
        onCheckout={() => {
          setShowCart(false);
          goToStripeCheckout(); // ✅ 直接跳 Stripe，不再进入 CheckoutPage
        }}
        hasJoinedWaitlist={hasJoinedWaitlist}
        offerExpired={offerExpired}
        onOfferExpire={handleOfferExpire}
      />
    );
  }

  // 主落地页
  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      {/* 导航栏 + Hero 区块 */}
      <HeroSection
        isScrolled={isScrolled}
        hasJoinedWaitlist={hasJoinedWaitlist}
        offerExpired={offerExpired}
        onOpenModal={openModal}
        onOpenCart={openCart}
      />

      {/* 产品介绍：Meet WoafyPet Bed */}
      <ProductIntroSection />

      {/* 功能优势网格 */}
      <BenefitsGridSection />

      {/* 关节健康问题展示 */}
      <JointHealthSection />

      {/* 舒适功能交互展示 */}
      <ComfortFeaturesSection onOpenModal={openModal} />

      {/* App 功能展示 */}
      <AppFeaturesSection />

      {/* 泡沫层结构展示 */}
      <FoamLayersSection />

      {/* 产品对比表格 */}
      <ComparisonSection />

      {/* 兽医推荐 */}
      <VetRecommendedSection />

      {/* 媒体报道 Logo */}
      <MediaLogosSection />

      {/* 用户评价 */}
      <TestimonialsSection />

      {/* 创始人故事 */}
      <FounderStorySection />

      {/* 产品规格 */}
      <SpecificationsSection />

      {/* 30 天保证 */}
      <GuaranteeSection onOpenModal={openModal} />

      {/* Waitlist 模态框 */}
      <WaitlistModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onJoinSuccess={handleJoinSuccess}
        onUpsellClick={handleUpsellClick} // ✅ 现在会直接跳 Stripe
        onOfferExpire={handleOfferExpire}
      />
    </div>
  );
}