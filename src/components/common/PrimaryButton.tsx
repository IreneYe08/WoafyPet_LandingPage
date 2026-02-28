/**
 * 主要按钮组件
 * 用于 CTA（Call to Action）场景，如 "Join Waitlist Now"
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { COLORS } from '@/constants/colors';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮内容 */
  children: ReactNode;
  /** 按钮尺寸变体 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否占满宽度 */
  fullWidth?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 尺寸样式映射
 */
const SIZE_STYLES = {
  sm: 'px-6 py-2 text-base',
  md: 'px-8 py-3 text-base',
  lg: 'px-10 py-4 text-lg',
} as const;

/**
 * PrimaryButton - 品牌主色调按钮
 * 
 * @example
 * <PrimaryButton onClick={handleClick}>Join Waitlist Now</PrimaryButton>
 * <PrimaryButton size="lg" fullWidth>Claim My 50% Discount</PrimaryButton>
 */
export function PrimaryButton({
  children,
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: PrimaryButtonProps) {
  const baseStyles = `
    bg-[${COLORS.primary.main}] 
    text-white 
    rounded-lg 
    hover:bg-[${COLORS.primary.hover}] 
    transition-all 
    duration-300 
    shadow-lg
    disabled:opacity-50 
    disabled:cursor-not-allowed
  `;
  
  const sizeStyles = SIZE_STYLES[size];
  const widthStyles = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`
        bg-[#FD8829] text-white rounded-lg hover:bg-[#E57620] 
        transition-all duration-300 shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeStyles} ${widthStyles} ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
