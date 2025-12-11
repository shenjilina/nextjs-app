import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react({
      // 支持 React Server Components 的测试（模拟客户端行为）
      jsxRuntime: 'classic', // 或 'automatic'，根据项目配置调整
    }),
    tsconfigPaths(), // 支持 @/ 路径别名
  ],
  test: {
    // 测试文件匹配规则
    include: ['src/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    // 全局环境：使用 JSDOM 模拟浏览器环境（适合 React 组件测试）
    environment: 'jsdom',

    // 全局 setup 文件
    setupFiles: ['src/tests/setup.ts'],

    // 模拟 Next.js 特有模块（避免 SSR 报错）
    alias: {
      // 可选：mock next/image, next/link 等
    },

    // 模块 mock 规则
    deps: {
      // 避免 Vitest 尝试解析 CJS 模块时报错
      inline: ['next'],
    },

    // 覆盖率配置（可选）
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        'vitest.config.ts',
        '.next/',
        'next.config.ts',
        'postcss.config.js',
        'tailwind.config.ts',
      ],
    },

    // 输出格式
    reporters: ['default', 'html'], // 生成 html 报告

    // 并发控制
    maxConcurrency: 5,

    // 超时设置（毫秒）
    testTimeout: 10000,
    hookTimeout: 10000,

    // 支持 CSS Modules / Tailwind（避免样式导入报错）
    css: true,
  },
});