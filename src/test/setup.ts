import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

// 전역 테스트 설정
beforeEach(() => {
  // 각 테스트 전에 localStorage 초기화
  localStorage.clear();

  // 콘솔 에러/경고 숨기기 (필요시)
  // vi.spyOn(console, 'error').mockImplementation(() => {});
  // vi.spyOn(console, 'warn').mockImplementation(() => {});
});

// 전역 모킹 설정
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
