import React from 'react';

type Tone = 'white' | 'warm' | 'beige' | 'dark';

const TONE_BG: Record<Tone, string> = {
  white: 'bg-white',
  warm: 'bg-[#FAF7F3]',
  beige: 'bg-[#F5F1ED]',
  dark: 'bg-[#3D3D3D]',
};

/**
 * Container / Section：全站统一宽度 + 左右边距 + 上下间距
 *
 * 核心规范（建议全站统一）：
 * - 宽度：max-w-[1280px]
 * - 左右 padding：px-5 sm:px-8 lg:px-12 xl:px-16
 * - section 上下间距：py-16 md:py-20（少数需要更大再 override）
 */
export function Container({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12 xl:px-16 ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  tone = 'white',
  className = '',
  containerClassName = '',
  children,
  id,
}: {
  tone?: Tone;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={`${TONE_BG[tone]} py-16 md:py-20 ${className}`}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

/** 统一标题样式（你可按品牌再微调） */
export function SectionHeading({
  title,
  subtitle,
  align = 'center',
  className = '',
}: {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div className={`${align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#333333]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-base md:text-lg leading-relaxed text-[#666666]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/** 通用纵向节奏：比到处写 mb-xx 更稳定 */
export function Stack({
  gap = 'md',
  className = '',
  children,
}: {
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}) {
  const GAP = {
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-10',
  }[gap];

  return <div className={`${GAP} ${className}`}>{children}</div>;
}

/** 通用两列布局：mobile 单列 / desktop 双列 */
export function TwoCol({
  className = '',
  left,
  right,
  reverseOnDesktop = false,
  gap = 'gap-10 lg:gap-12',
}: {
  className?: string;
  left: React.ReactNode;
  right: React.ReactNode;
  reverseOnDesktop?: boolean;
  gap?: string;
}) {
  return (
    <div
      className={[
        'grid grid-cols-1 lg:grid-cols-12 items-center',
        gap,
        className,
      ].join(' ')}
    >
      <div className={`lg:col-span-6 ${reverseOnDesktop ? 'lg:order-2' : 'lg:order-1'}`}>
        {left}
      </div>
      <div className={`lg:col-span-6 ${reverseOnDesktop ? 'lg:order-1' : 'lg:order-2'}`}>
        {right}
      </div>
    </div>
  );
}