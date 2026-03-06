/**
 * ProductIntroSection - 产品介绍区块（橙色上半 + 白色下半 + GIF 半覆盖）
 * 方案一：GIF 走 public 目录 + 原生 <img>，避免 ImageWithFallback / 构建优化导致动图卡帧
 *
 * ✅ 结构：
 * - 背景：上橙下白
 * - 文案：在橙色区域内（居中，列表左对齐）
 * - GIF：往上提，半覆盖橙/白
 */

import { Heart, Activity, Thermometer } from 'lucide-react';

const PRODUCT_FEATURES = [
  {
    icon: Heart,
    title: 'Vet-Recommended Support',
    description: 'High-density foam relieves joint pressure for deep, weightless sleep.',
  },
  {
    icon: Activity,
    title: 'Proactive Health Monitoring',
    description: 'Catch hidden issues early, before they become emergencies.',
  },
  {
    icon: Thermometer,
    title: 'Smart Heating',
    description: 'Adjustable warmth ensures their deepest, coziest sleep yet.',
  },
  {
    icon: Activity,
    title: 'Built-in Weight Scale',
    description: "Track your pet's weight daily to catch subtle changes early.",
  },
];

export function ProductIntroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background split: orange top / white bottom */}
      <div className="absolute inset-0">
        <div className="h-[58%] bg-[#FD8829]" />
        <div className="h-[42%] bg-white" />
      </div>

      {/* Content container */}
      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12 xl:px-16 py-16">
        {/* Text block on orange */}
        <div className="text-center">
          <h2 className="text-[36px] md:text-[44px] font-extrabold text-[#2F2F2F]">
            Meet WoafyPet Bed
          </h2>

          <div className="mx-auto mt-8 max-w-4xl space-y-6 text-left">
            {PRODUCT_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-start gap-4">
                  <Icon className="mt-1 text-[#2F2F2F]" size={22} />
                  <p className="text-[18px] leading-relaxed text-[#2F2F2F]">
                    <span className="font-bold">{f.title}:</span> {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* GIF block: half overlap */}
        <div className="relative mx-auto mt-12 max-w-5xl">
          {/* Pull media upward so it overlaps orange + white */}
          <div className="relative -mt-6 md:-mt-10 rounded-[28px] shadow-2xl overflow-hidden bg-white">
            {/* ✅ GIF must be in /public/gifs/productShowcase.gif */}
            <video
              className="w-full h-[320px] sm:h-[420px] md:h-[520px] object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              aria-label="WoafyPet Bed"
            >
              <source src={`${import.meta.env.BASE_URL}videos/productShowcase.webm`} type="video/webm" />
              <source src={`${import.meta.env.BASE_URL}videos/productShowcase.mp4`} type="video/mp4" />
              {/* Fallback for browsers that don't support video */}
              <img
                src={`${import.meta.env.BASE_URL}gifs/productShowcase.gif`}
                alt="WoafyPet Bed"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductIntroSection;