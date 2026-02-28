/**
 * 统一颜色常量定义
 * 用于整个应用的颜色主题管理
 */

export const COLORS = {
  // 主色调 - 品牌橙色
  primary: {
    main: '#FD8829',      // 主按钮、强调色
    hover: '#E57620',     // 悬停状态
    light: '#FF6B35',     // 渐变辅助色
  },
  
  // 文字颜色
  text: {
    primary: '#333333',   // 主要文字
    secondary: '#666666', // 次要文字、描述
    dark: '#3D3D3D',      // 深色文字
    light: '#CCCCCC',     // 浅色文字（用于深色背景）
    muted: '#555555',     // 弱化文字
  },
  
  // 背景颜色
  background: {
    main: '#FAF7F3',      // 页面主背景
    white: '#FFFFFF',     // 白色背景
    light: '#F5F1ED',     // 浅色区块背景
    gray: '#F5F5F5',      // 灰色背景
    darkGray: '#EBEBEB',  // 深灰背景
    footer: '#3D3D3D',    // 页脚背景
  },
  
  // 边框颜色
  border: {
    light: '#E5E5E5',
    gray: '#D1D5DB',      // gray-300
  },
  
  // 状态颜色
  status: {
    success: '#22C55E',   // green-500
    error: '#EF4444',     // red-500
  },
} as const;

/**
 * Tailwind CSS 类名映射
 * 方便在 className 中直接使用
 */
export const TAILWIND_COLORS = {
  // 主色调
  primaryBg: 'bg-[#FD8829]',
  primaryHoverBg: 'hover:bg-[#E57620]',
  primaryText: 'text-[#FD8829]',
  
  // 文字
  textPrimary: 'text-[#333333]',
  textSecondary: 'text-[#666666]',
  textDark: 'text-[#3D3D3D]',
  textLight: 'text-[#CCCCCC]',
  
  // 背景
  bgMain: 'bg-[#FAF7F3]',
  bgLight: 'bg-[#F5F1ED]',
  bgFooter: 'bg-[#3D3D3D]',
} as const;
