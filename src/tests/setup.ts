// tests/setup.ts
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock global TextEncoder/TextDecoder（Node.js < 16 需要）
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof TextDecoder;

// 可选：Mock Next.js 动态组件或 router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/',
}));

// 可选：Mock 全局 fetch（或使用 msw）
global.fetch = vi.fn();