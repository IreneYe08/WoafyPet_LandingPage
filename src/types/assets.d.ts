/**
 * 资源文件类型声明
 * 用于解决 TypeScript 无法识别图片和特殊模块的问题
 */

// Figma 资源模块声明
declare module '../assets/*.png' {
  const src: string;
  export default src;
}

declare module '../assets/*.jpg' {
  const src: string;
  export default src;
}

declare module '../assets/*.jpeg' {
  const src: string;
  export default src;
}

declare module '../assets/*.svg' {
  const src: string;
  export default src;
}

// 标准图片资源声明
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

// canvas-confetti 类型声明
declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: ('square' | 'circle')[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  function confetti(options?: ConfettiOptions): Promise<null>;
  export default confetti;
}
